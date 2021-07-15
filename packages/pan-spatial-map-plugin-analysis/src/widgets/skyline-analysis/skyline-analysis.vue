<template>
  <div class="mp-widget-skyline-analysis">
    <div class="panel">
      <a-form-model
        :model="formData"
        :label-col="{ span: 8 }"
        :wrapper-col="{ span: 16 }"
      >
        <a-form-model-item label="线宽">
          <a-input
            v-model.number="formData.skylineWidth"
            type="number"
            min="0"
          />
        </a-form-model-item>
        <a-form-model-item label="线颜色">
          <MpColorPicker
            :color.sync="formData.skylineColor"
            :disableAlpha="true"
          ></MpColorPicker>
        </a-form-model-item>
      </a-form-model>
    </div>
    <div class="footer">
      <a-button type="primary" @click="add">开始分析</a-button>
      <a-button type="primary" @click="remove">结束分析</a-button>
    </div>
  </div>
</template>
<script lang="ts">
import { Vue, Component, Mixins } from 'vue-property-decorator'
import { WidgetMixin, Objects } from '@mapgis/web-app-framework'

@Component({
  name: 'MpSkylineAnalysis'
})
export default class MpSkylineAnalysis extends Mixins(WidgetMixin) {
  private formData = {
    skylineWidth: 2,
    skylineColor: 'rgb(255,0,0)'
  }

  get edgeColor() {
    return Objects.SceneController.getInstance(
      this.Cesium,
      this.CesiumZondy,
      this.webGlobe
    ).colorToCesiumColor(this.formData.skylineColor)
  }

  created() {
    window.skylineAnalysis = null
  }

  // 微件关闭时
  onClose() {
    this.remove()
  }

  // 微件失活时
  onDeActive() {
    this.remove()
  }

  add() {
    this.remove()
    const { viewer } = this.webGlobe
    // 初始化高级分析功能管理类
    const advancedAnalysisManager = new this.CesiumZondy.Manager.AdvancedAnalysisManager(
      {
        viewer
      }
    )
    // 创建天际线实例
    window.skylineAnalysis = advancedAnalysisManager.createSkyLine({})
    window.skylineAnalysis.color = this.edgeColor
    window.skylineAnalysis.lineWidth = this.formData.skylineWidth
  }

  remove() {
    // 判断是否已有天际线分析结果
    if (window.skylineAnalysis) {
      // 移除天际线分析显示结果
      window.skylineAnalysis.destroy()
      window.skylineAnalysis = null
    }
  }
}
</script>
<style lang="less">
.mp-widget-skyline-analysis {
  .panel {
    width: 100%;
    .ant-form-item {
      display: flex;
      align-items: center;
      margin-bottom: 0;
    }
    .ant-input {
      padding: 4px 11px;
    }
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

  .footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
    width: 100%;
    margin-top: 8px;

    .ant-btn {
      padding: 0 15px;
    }
  }
}
</style>
