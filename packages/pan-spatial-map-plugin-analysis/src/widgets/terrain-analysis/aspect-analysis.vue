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
import { WidgetMixin, ColorUtil } from '@mapgis/web-app-framework'
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

  private brightnessEnabled = false // 光照是否已开启

  private info =
    '坡向分析需要带法线地形。\r\n坡向按照东北西南的顺序表示方向,即0°表示坡向指向正东方向。'

  created() {
    window.AspectAnalyzeManage = {
      drawElement: null,
      aspectAnalysis: null
    }
  }

  onActive() {
    const { viewer } = this.webGlobe
    if (viewer.scene.globe.enableLighting && viewer.scene.brightness) {
      this.brightnessEnabled = true
    }
  }

  // 微件失活时
  onDeActive() {
    this.remove()
  }

  /**
   * 开启光照
   */
  enableBrightness() {
    if (this.brightnessEnabled) {
      return
    }
    // 开启光照，不然放大地图，分析结果显示异常
    const { viewer } = this.webGlobe
    viewer.scene.globe.enableLighting = true
    // 调高亮度
    const stages = viewer.scene.postProcessStages
    viewer.scene.brightness =
      viewer.scene.brightness ||
      stages.add(this.Cesium.PostProcessStageLibrary.createBrightnessStage())
    viewer.scene.brightness.enabled = true
    viewer.scene.brightness.uniforms.brightness = 1.2
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
        this.enableBrightness() // 开启光照
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

    // 关闭光照
    const { viewer } = this.webGlobe
    if (viewer.scene.brightness && !this.brightnessEnabled) {
      viewer.scene.globe.enableLighting = false
      viewer.scene.brightness.enabled = false
    }
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
