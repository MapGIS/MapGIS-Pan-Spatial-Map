<template>
  <div class="mp-widget-contour-analysis">
    <mp-setting-form :form="form">
      <a-form-item label="等值距">
        <a-input
          v-model.number="formData.contourSpacing"
          type="number"
          min="0"
          addon-after="(米)"
        />
      </a-form-item>
      <a-form-item label="线宽">
        <a-input v-model.number="formData.contourWidth" type="number" min="0" />
      </a-form-item>
      <a-form-item label="线颜色">
        <MpColorPicker
          :color.sync="formData.contourColor"
          :disableAlpha="true"
          class="color-picker"
        ></MpColorPicker>
      </a-form-item>
    </mp-setting-form>
    <div class="control-button-container">
      <a-button class="control-button" type="primary" @click="add"
        >开始分析</a-button
      >
      <a-button class="control-button" type="primary" @click="remove"
        >结束分析</a-button
      >
    </div>
  </div>
</template>
<script lang="ts">
import { Vue, Component, Mixins } from 'vue-property-decorator'
import { WidgetMixin, Objects } from '@mapgis/web-app-framework'

@Component({
  name: 'MpContourAnalysis'
})
export default class MpContourAnalysis extends Mixins(WidgetMixin) {
  private form = this.$form.createForm(this)

  private formData = {
    contourSpacing: 150,
    contourWidth: 2,
    contourColor: 'rgb(255,0,0)'
  }

  get edgeColor() {
    return Objects.SceneController.getInstance(
      this.Cesium,
      this.CesiumZondy,
      this.webGlobe
    ).colorToCesiumColor(this.formData.contourColor)
  }

  created() {
    window.ContourAnalysisManage = {
      drawElement: null,
      contourAnalysis: null
    }
  }

  onActive() {}

  // 微件失活时
  onDeActive() {
    this.remove()
  }

  add() {
    const { areaType } = this.formData
    const { viewer } = this.webGlobe
    // 初始化交互式绘制控件
    window.ContourAnalysisManage.drawElement =
      window.ContourAnalysisManage.drawElement ||
      new this.Cesium.DrawElement(viewer)

    const { contourWidth, contourSpacing } = this.formData

    const self = this

    // 激活交互式绘制工具
    window.ContourAnalysisManage.drawElement.startDrawingPolygon({
      // 绘制完成回调函数
      callback: positions => {
        this.remove()
        window.ContourAnalysisManage.contourAnalysis =
          window.ContourAnalysisManage.contourAnalysis ||
          new this.Cesium.TerrainAnalyse(viewer, {})
        window.ContourAnalysisManage.contourAnalysis.enableContour(true)
        window.ContourAnalysisManage.contourAnalysis.updateMaterial('none')
        window.ContourAnalysisManage.contourAnalysis.changeContourWidth(
          contourWidth
        )
        window.ContourAnalysisManage.contourAnalysis.changeContourSpacing(
          contourSpacing
        )
        window.ContourAnalysisManage.contourAnalysis.changeContourColor(
          this.edgeColor
        )
        window.ContourAnalysisManage.contourAnalysis.changeAnalyseArea(
          positions
        )
      }
    })
  }

  remove() {
    // 判断是否已有等值线分析结果
    if (window.ContourAnalysisManage.contourAnalysis) {
      // 移除等值线分析显示结果
      window.ContourAnalysisManage.contourAnalysis.enableContour(false)
      window.ContourAnalysisManage.contourAnalysis.updateMaterial('none')
      window.ContourAnalysisManage.contourAnalysis = null
    }

    if (window.ContourAnalysisManage.drawElement) {
      // 取消交互式绘制矩形事件激活状态
      window.ContourAnalysisManage.drawElement.stopDrawing()
      window.ContourAnalysisManage.drawElement = null
    }
  }
}
</script>
<style lang="less">
.mp-widget-contour-analysis {
  padding-top: 8px;
  .control-button-container {
    display: flex;
    justify-content: space-between;
    margin: 5px 0;
    &:last-child {
      margin-bottom: 0;
    }
    .control-button {
      width: calc(~'50% - 2.5px');
    }
  }
}
</style>
