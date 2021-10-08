<template>
  <div class="mp-widget-aspect-analysis">
    <mp-group-tab title="坡向图例设置">
      <a-tooltip slot="handle" placement="bottomRight" :title="info">
        <a-icon type="info-circle" class="info-icon"></a-icon>
      </a-tooltip>
    </mp-group-tab>
    <MpColorsSetting
      v-model="params"
      :rangeField="'坡向范围'"
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
  name: 'MpAspectAnalysis',
  components: {
    MpColorsSetting
  }
})
export default class MpAspectAnalysis extends Mixins(WidgetMixin) {
  private params = [
    { min: 0, max: 60, color: 'rgba(244, 67, 54, 0.5)' },
    { min: 60, max: 120, color: 'rgba(233, 30, 99, 0.5)' },
    { min: 120, max: 180, color: 'rgba(156, 39, 176, 0.5)' },
    { min: 180, max: 240, color: 'rgba(255, 235, 59, 0.5)' },
    { min: 240, max: 300, color: 'rgba(96, 125, 139, 0.5)' },
    { min: 300, max: 360, color: 'rgba(76, 175, 80, 0.5)' }
  ]

  private isEnableLighting = undefined // 光照是否已开启

  private noBrightness = undefined // 是否有brightness对象

  private brightnessStatusAndUniformsBrightness = undefined // 光照参数

  private info =
    '坡向分析需要带法线地形。\r\n坡向按照东北西南的顺序表示方向,即0°表示坡向指向正东方向。'

  get sceneControllerInstance() {
    return Objects.SceneController.getInstance(
      this.Cesium,
      this.CesiumZondy,
      this.webGlobe
    )
  }

  created() {
    window.AspectAnalyzeManage = {
      drawElement: null,
      aspectAnalysis: null
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
    const { viewer } = this.webGlobe
    // 初始化交互式绘制控件
    window.AspectAnalyzeManage.drawElement =
      window.AspectAnalyzeManage.drawElement ||
      new this.Cesium.DrawElement(viewer)

    const { params } = this

    const colors = []
    const ramp = []
    params.forEach(({ max, color }) => {
      ramp.push((max / 360).toFixed(2))
      colors.push(color)
    })
    const rampColor = this.transformColor(colors)

    const self = this

    // 激活交互式绘制工具
    window.AspectAnalyzeManage.drawElement.startDrawingPolygon({
      // 绘制完成回调函数
      callback: positions => {
        this.remove()
        this.enableBrightnessFuc() // 开启光照
        window.AspectAnalyzeManage.aspectAnalysis =
          window.AspectAnalyzeManage.aspectAnalysis ||
          new this.Cesium.TerrainAnalyse(viewer, {
            aspectRampColor: rampColor,
            aspectRamp: ramp
          })
        window.AspectAnalyzeManage.aspectAnalysis.enableContour(false)
        window.AspectAnalyzeManage.aspectAnalysis.updateMaterial('aspect')
        window.AspectAnalyzeManage.aspectAnalysis.changeAnalyseArea(positions)
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
    // 判断是否已有坡向分析结果
    if (window.AspectAnalyzeManage.aspectAnalysis) {
      // 移除坡向分析显示结果
      window.AspectAnalyzeManage.aspectAnalysis.updateMaterial('none')
      window.AspectAnalyzeManage.aspectAnalysis = null
    }

    if (window.AspectAnalyzeManage.drawElement) {
      // 取消交互式绘制矩形事件激活状态
      window.AspectAnalyzeManage.drawElement.stopDrawing()
      window.AspectAnalyzeManage.drawElement = null
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
