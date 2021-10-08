<template>
  <div class="mp-widget-slope-analysis">
    <mp-group-tab title="坡度图例设置">
      <a-tooltip slot="handle" placement="bottomRight" :title="info">
        <a-icon type="info-circle" class="info-icon"></a-icon>
      </a-tooltip>
    </mp-group-tab>
    <MpColorsSetting
      v-model="params"
      :rangeField="'坡度范围'"
    ></MpColorsSetting>
    <div class="mp-footer-actions">
      <a-button type="primary" @click="add">分析</a-button>
      <a-button @click="remove">清除</a-button>
    </div>
  </div>
</template>
<script lang="ts">
import { Vue, Component, Mixins } from 'vue-property-decorator'
import { WidgetMixin, ColorUtil, Objects } from '@mapgis/web-app-framework'
import MpColorsSetting from './components/colors-setting.vue'

@Component({
  name: 'MpSlopeAnalysis',
  components: {
    MpColorsSetting
  }
})
export default class MpSlopeAnalysis extends Mixins(WidgetMixin) {
  private params = [
    { min: 0, max: 15, color: 'rgba(244, 67, 54, 0.5)' },
    { min: 15, max: 30, color: 'rgba(233, 30, 99, 0.5)' },
    { min: 30, max: 45, color: 'rgba(156, 39, 176, 0.5)' },
    { min: 45, max: 60, color: 'rgba(255, 235, 59, 0.5)' },
    { min: 60, max: 75, color: 'rgba(96, 125, 139, 0.5)' },
    { min: 75, max: 90, color: 'rgba(76, 175, 80, 0.5)' }
  ]

  private isEnableLighting = undefined // 光照是否已开启

  private noBrightness = undefined // 是否有brightness对象

  private brightnessStatusAndUniformsBrightness = undefined // 光照参数

  private info = '坡度分析需要带法线地形'

  get sceneControllerInstance() {
    return Objects.SceneController.getInstance(
      this.Cesium,
      this.CesiumZondy,
      this.webGlobe
    )
  }

  getLabel(index) {
    return (0.0 + index * 0.2).toFixed(1)
  }

  created() {
    window.SlopeAnalyzeManage = {
      drawElement: null,
      slopeAnalysis: null
    }
  }

  onActive() {}

  // 微件失活时
  onDeActive() {
    this.remove()
  }

  /**
   * 开启光照
   */
  enableBrightnessFuc() {
    // 开启光照，不然放大地图，分析结果显示异常

    this.isEnableLighting = this.sceneControllerInstance.isEnableLighting()
    if (!this.isEnableLighting) {
      // 未开启光照，开启
      this.sceneControllerInstance.setEnableLighting(true)
    }
    // 调高亮度
    const { viewer } = this.webGlobe
    const stages = viewer.scene.postProcessStages
    const brightness = this.sceneControllerInstance.getBrightness()
    if (!brightness) {
      // 初始没有brightness对象
      this.noBrightness = true
      viewer.scene.brightness = stages.add(
        this.Cesium.PostProcessStageLibrary.createBrightnessStage()
      )
    }
    // 设置前记录原有光照参数
    this.brightnessStatusAndUniformsBrightness = this.sceneControllerInstance.getBrightnessStatusAndUniformsBrightness()
    const statusAndUniformsBrightness = {
      enabled: true,
      brightness: 1.2
    }
    this.sceneControllerInstance.setBrightnessStatusAndUniformsBrightness(
      statusAndUniformsBrightness
    )
  }

  add() {
    console.log(this.params)
    const { viewer } = this.webGlobe
    // 初始化交互式绘制控件
    window.SlopeAnalyzeManage.drawElement =
      window.SlopeAnalyzeManage.drawElement ||
      new this.Cesium.DrawElement(viewer)

    const { params } = this

    const colors = []
    const ramp = []
    params.forEach(({ max, color }) => {
      ramp.push((max / 90).toFixed(2))
      colors.push(color)
    })
    const rampColor = this.transformColor(colors)

    const self = this

    // 激活交互式绘制工具
    window.SlopeAnalyzeManage.drawElement.startDrawingPolygon({
      // 绘制完成回调函数
      callback: positions => {
        this.remove()
        this.enableBrightnessFuc() // 开启光照
        window.SlopeAnalyzeManage.slopeAnalysis =
          window.SlopeAnalyzeManage.slopeAnalysis ||
          new this.Cesium.TerrainAnalyse(viewer, {
            slopeRampColor: rampColor,
            slopeRamp: ramp
          })
        window.SlopeAnalyzeManage.slopeAnalysis.enableContour(false)
        window.SlopeAnalyzeManage.slopeAnalysis.updateMaterial('slope')
        window.SlopeAnalyzeManage.slopeAnalysis.changeAnalyseArea(positions)
      }
    })
  }

  transformColor(arrayColor) {
    let isNull = false
    const arr = arrayColor.map(color => {
      if (color) {
        return ColorUtil.rgbaToHex(color)
      }
      isNull = true
      return null
    })
    if (isNull) {
      return []
    }
    return arr
  }

  // 恢复光照设置
  restoreEnableLighting() {
    // 恢复光照开启状态设置
    if (
      this.isEnableLighting !== undefined &&
      this.isEnableLighting !== this.sceneControllerInstance.isEnableLighting()
    ) {
      this.sceneControllerInstance.setEnableLighting(this.isEnableLighting)
    }
    const stages = this.webGlobe.viewer.scene.postProcessStages
    if (this.noBrightness) {
      // 如果开始没有brightness对象，恢复
      stages.remove(this.webGlobe.viewer.scene.brightness)
      this.webGlobe.viewer.scene.brightness = undefined
    } else {
      // 恢复brightness参数设置
      if (this.brightnessStatusAndUniformsBrightness !== undefined) {
        const brightnessStatusAndUniformsBrightness = this.sceneControllerInstance.getBrightnessStatusAndUniformsBrightness()
        if (
          this.brightnessStatusAndUniformsBrightness.enabled !==
            brightnessStatusAndUniformsBrightness.enabled ||
          this.brightnessStatusAndUniformsBrightness.brightness !==
            brightnessStatusAndUniformsBrightness.brightness
        ) {
          this.sceneControllerInstance.setBrightnessStatusAndUniformsBrightness(
            this.brightnessStatusAndUniformsBrightness
          )
        }
      }
    }
  }

  remove() {
    // 判断是否已有坡度分析结果
    if (window.SlopeAnalyzeManage.slopeAnalysis) {
      // 移除坡度分析显示结果
      window.SlopeAnalyzeManage.slopeAnalysis.updateMaterial('none')
      window.SlopeAnalyzeManage.slopeAnalysis = null
    }

    if (window.SlopeAnalyzeManage.drawElement) {
      // 取消交互式绘制矩形事件激活状态
      window.SlopeAnalyzeManage.drawElement.stopDrawing()
      window.SlopeAnalyzeManage.drawElement = null
    }

    // 恢复光照设置
    this.restoreEnableLighting()
  }
}
</script>
<style lang="less" scoped>
@import '../index.less';
.info-icon {
  color: rgba(0, 0, 0, 0.65);
  width: 27px;
  margin: 0 6px;
  text-align: center;
  cursor: pointer;
}
</style>
