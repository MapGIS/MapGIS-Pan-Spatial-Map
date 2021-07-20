<template>
  <div class="mp-widget-aspect-analysis">
    <a-row class="title">
      <div class="space"></div>
      <div class="label">坡向权重设置</div>
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
import { Vue, Component, Mixins } from 'vue-property-decorator'
import { WidgetMixin, Objects } from '@mapgis/web-app-framework'

@Component({
  name: 'MpAspectAnalysis'
})
export default class MpAspectAnalysis extends Mixins(WidgetMixin) {
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
    window.AspectAnalyzeManage = {
      drawElement: null,
      cutFill: null,
      advancedAnalysisManager: null,
      AspectAnalysis: null
    }
  }

  mounted() {}

  // 微件失活时
  onDeActive() {
    this.remove()
    window.AspectAnalyzeManage.advancedAnalysisManager = null
  }

  add() {
    this.remove()
    window.AspectAnalyzeManage.advancedAnalysisManager =
      window.AspectAnalyzeManage.advancedAnalysisManager ||
      new this.CesiumZondy.Manager.AdvancedAnalysisManager({
        viewer: this.webGlobe.viewer
      })
    this.webGlobe.viewer.scene.globe.depthTestAgainstTerrain = true
    const arr = this.transformColor(this.arrayColor)
    if (arr.length > 0) {
      window.AspectAnalyzeManage.AspectAnalysis = window.AspectAnalyzeManage.advancedAnalysisManager.createAspectAnalysis(
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
    if (window.AspectAnalyzeManage.AspectAnalysis) {
      this.webGlobe.scene.VisualAnalysisManager.remove(
        window.AspectAnalyzeManage.AspectAnalysis
      )
      window.AspectAnalyzeManage.AspectAnalysis.stop()
      window.AspectAnalyzeManage.AspectAnalysis = null
    }
  }
}
</script>
<style lang="less">
.mp-widget-aspect-analysis {
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
