<template>
  <div class="mp-widget-slope-analysis">
    <mp-group-tab title="坡度权重设置"></mp-group-tab>
    <MpColorsSetting v-model="params"></MpColorsSetting>
    <a-row>
      <a-textarea
        class="mp-note-info"
        disabled
        :value="`坡度分析需要带法线地形`"
        auto-size
      ></a-textarea>
    </a-row>
    <div class="mp-footer-actions">
      <a-button type="primary" @click="add">分析</a-button>
      <a-button @click="remove">清除</a-button>
    </div>
  </div>
</template>
<script lang="ts">
import { Vue, Component, Mixins } from 'vue-property-decorator'
import { WidgetMixin, ColorUtil } from '@mapgis/web-app-framework'
import MpColorsSetting from './color-wheel/colors-setting.vue'

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

  private brightnessEnabled = false // 光照是否已开启

  getLabel(index) {
    return (0.0 + index * 0.2).toFixed(1)
  }

  created() {
    window.SlopeAnalyzeManage = {
      drawElement: null,
      slopeAnalysis: null
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
        this.enableBrightness()
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
</style>
