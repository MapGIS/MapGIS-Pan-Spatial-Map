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
declare const CesiumZondy
import { Vue, Component, Mixins } from 'vue-property-decorator'
import { WidgetMixin, Objects } from '@mapgis/web-app-framework'

@Component({ name: 'MpSlopeAnalysis' })
export default class MpSlopeAnalysis extends Mixins(WidgetMixin) {
  private arrayColor: string[] = [
    'rgb(244, 67, 54, 0.5)',
    'rgb(233, 30, 99, 0.5)',
    'rgb(156, 39, 176, 0.5)',
    'rgb(255, 235, 59, 0.5)',
    'rgb(96, 125, 139, 0.5)',
    'rgb(76, 175, 80, 0.5)'
  ]

  getLabel(index) {
    return (0.0 + index * 0.2).toFixed(1)
  }

  created() {
    window.SlopeAnalyzeManage = {
      drawElement: null,
      cutFill: null,
      advancedAnalysisManager: null,
      SlopeAnalysis: null
    }
  }

  mounted() {}

  // 微件失活时
  onDeActive() {
    this.remove()
    window.SlopeAnalyzeManage.advancedAnalysisManager = null
  }

  add() {
    this.remove()
    window.SlopeAnalyzeManage.advancedAnalysisManager =
      window.SlopeAnalyzeManage.advancedAnalysisManager ||
      new CesiumZondy.Manager.AdvancedAnalysisManager({
        viewer: this.webGlobe.viewer
      })
    this.webGlobe.viewer.scene.globe.depthTestAgainstTerrain = true
    const arr = this.transformColor(this.arrayColor)
    if (arr.length > 0) {
      window.SlopeAnalyzeManage.SlopeAnalysis = window.SlopeAnalyzeManage.advancedAnalysisManager.createSlopeAnalysis(
        arr
      )
    } else {
      this.$q.notify({
        message: '颜色格式不正确',
        position: 'center'
      })
    }
  }

  transformColor(arrayColor) {
    let isNull = false
    const arr = arrayColor.map(color => {
      if (color) {
        return Objects.SceneController.getInstance(
          this.Cesium,
          this.CesiumZondy,
          this.webGlobe
        ).colorToCesiumColor(color)
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
    if (window.SlopeAnalyzeManage.SlopeAnalysis) {
      this.webGlobe.scene.VisualAnalysisManager.remove(
        window.SlopeAnalyzeManage.SlopeAnalysis
      )
      window.SlopeAnalyzeManage.SlopeAnalysis.stop()
      window.SlopeAnalyzeManage.SlopeAnalysis = null
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
