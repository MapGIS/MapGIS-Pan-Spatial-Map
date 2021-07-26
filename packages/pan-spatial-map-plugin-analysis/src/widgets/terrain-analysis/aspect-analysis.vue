<template>
  <div class="mp-widget-aspect-analysis">
    <mp-group-tab title="坡向权重设置"></mp-group-tab>
    <mp-setting-form>
      <a-form-item
        v-for="(color, index) in arrayColor"
        :key="index"
        :label="getLabel(index)"
      >
        <MpColorPicker
          :color.sync="arrayColor[index]"
          :disableAlpha="false"
        ></MpColorPicker>
      </a-form-item>
    </mp-setting-form>
    <a-row>
      <a-textarea
        class="mp-note-info"
        disabled
        :value="`坡向分析需要带法线地形`"
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

@Component({
  name: 'MpAspectAnalysis'
})
export default class MpAspectAnalysis extends Mixins(WidgetMixin) {
  private arrayColor: string[] = [
    'rgba(244, 67, 54, 0.5)',
    'rgba(233, 30, 99, 0.5)',
    'rgba(156, 39, 176, 0.5)',
    'rgba(255, 235, 59, 0.5)',
    'rgba(96, 125, 139, 0.5)',
    'rgba(76, 175, 80, 0.5)'
  ]

  getLabel(index) {
    return (0.0 + index * 0.2).toFixed(1)
  }

  created() {
    window.AspectAnalyzeManage = {
      drawElement: null,
      aspectAnalysis: null
    }
    this.onActive()
  }

  onActive() {
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

  // 微件失活时
  onDeActive() {
    this.remove()
    const { viewer } = this.webGlobe
    viewer.scene.globe.enableLighting = false
    viewer.scene.brightness.enabled = false
  }

  add() {
    const { viewer } = this.webGlobe
    // 初始化交互式绘制控件
    window.AspectAnalyzeManage.drawElement =
      window.AspectAnalyzeManage.drawElement ||
      new this.Cesium.DrawElement(viewer)

    const arr = this.transformColor(this.arrayColor)

    const self = this

    // 激活交互式绘制工具
    window.AspectAnalyzeManage.drawElement.startDrawingPolygon({
      // 绘制完成回调函数
      callback: positions => {
        this.remove()
        window.AspectAnalyzeManage.aspectAnalysis =
          window.AspectAnalyzeManage.aspectAnalysis ||
          new this.Cesium.TerrainAnalyse(viewer, { aspectRampColor: arr })
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
  }
}
</script>
<style lang="less" scoped>
@import '../index.less';
</style>
