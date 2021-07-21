<template>
  <div class="mp-widget-slope-analysis">
    <a-row class="title">
      <div class="space"></div>
      <div class="label">坡度权重设置</div>
    </a-row>
    <a-form-model :label-col="{ span: 3 }" :wrapper-col="{ span: 21 }">
      <a-form-model-item
        v-for="(color, index) in arrayColor"
        :key="index"
        :label="getLabel(index)"
      >
        <MpColorPicker
          :color.sync="arrayColor[index]"
          :disableAlpha="false"
        ></MpColorPicker>
      </a-form-model-item>
    </a-form-model>
    <a-row>
      <a-textarea
        class="note"
        disabled
        :value="`坡度分析需要带法线地形`"
        auto-size
      ></a-textarea>
    </a-row>
    <div class="control-button-container">
      <a-button class="control-button" type="primary" @click="add" size="small"
        >开始分析</a-button
      >
      <a-button
        class="control-button"
        type="primary"
        @click="remove"
        size="small"
        >结束分析</a-button
      >
    </div>
  </div>
</template>
<script lang="ts">
import { Vue, Component, Mixins } from 'vue-property-decorator'
import { WidgetMixin, ColorUtil } from '@mapgis/web-app-framework'

@Component({ name: 'MpSlopeAnalysis' })
export default class MpSlopeAnalysis extends Mixins(WidgetMixin) {
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
    window.SlopeAnalyzeManage = {
      drawElement: null,
      slopeAnalysis: null
    }
    // this.onActive()
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
    window.SlopeAnalyzeManage.drawElement =
      window.SlopeAnalyzeManage.drawElement ||
      new this.Cesium.DrawElement(viewer)

    const arr = this.transformColor(this.arrayColor)

    const self = this

    // 激活交互式绘制工具
    window.SlopeAnalyzeManage.drawElement.startDrawingPolygon({
      // 绘制完成回调函数
      callback: positions => {
        this.remove()
        viewer.scene.globe.enableLighting = true
        window.SlopeAnalyzeManage.slopeAnalysis =
          window.SlopeAnalyzeManage.slopeAnalysis ||
          new this.Cesium.TerrainAnalyse(viewer, { slopeRampColor: arr })
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
  }
}
</script>
<style lang="less">
.mp-widget-slope-analysis {
  .ant-form-item {
    display: flex;
    align-items: center;
    margin-bottom: 5px;
  }
  .ant-form-item-label {
    line-height: 20px;
  }
  .ant-form-item-label > label::after {
    content: '';
  }
  .ant-input {
    padding: 4px 11px;
  }

  .title {
    margin: 5px 0;
    .space {
      width: 4px;
      height: 25px;
      background: @primary-color;
      margin-right: 8px;
      float: left;
    }
    .label {
      line-height: 25px;
      font-weight: bold;
    }
  }

  .note {
    padding: 3px 0;
    color: @text-color-secondary;
    word-break: break-all;
    white-space: break-spaces;
    font-size: 12px;
    &.ant-input {
      border: none;
      background-color: transparent;
      resize: none;
      min-height: 24px;
    }
  }

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
