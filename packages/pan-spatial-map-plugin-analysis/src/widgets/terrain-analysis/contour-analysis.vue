<template>
  <div class="mp-widget-flooding">
    <div class="panel">
      <a-row class="title">
        <div class="space"></div>
        <div class="label">参数设置</div>
      </a-row>
      <a-form-model
        :model="formData"
        :label-col="{ span: 8 }"
        :wrapper-col="{ span: 16 }"
      >
        <a-form-model-item label="等值距">
          <a-input
            v-model.number="formData.contourSpacing"
            type="number"
            min="0"
            addon-after="(米)"
          />
        </a-form-model-item>
        <a-form-model-item label="线宽">
          <a-input
            v-model.number="formData.contourWidth"
            type="number"
            min="0"
          />
        </a-form-model-item>
        <a-form-model-item label="线颜色">
          <MpColorPicker
            :color.sync="formData.contourColor"
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
import { WidgetMixin } from '@mapgis/web-app-framework'

@Component({
  name: 'MpContourAnalysis'
})
export default class MpContourAnalysis extends Mixins(WidgetMixin) {
  private formData = {
    contourSpacing: 150,
    contourWidth: 2,
    contourColor: 'rgb(255,255,102)'
  }

  get edgeColor() {
    if (this.formData.contourColor) {
      const Color = this.formData.contourColor.split(',')
      const ColorRgb = {
        green: Number(Color[1] / 255),
        blue: Number(parseInt(Color[2]) / 255),
        red: Number(Color[0].split('(')[1] / 255)
      }
      return new this.Cesium.Color(
        ColorRgb.red,
        ColorRgb.green,
        ColorRgb.blue,
        this.opacity || 0.5
      )
    }
    const ColorRgb = {
      green: 0.2,
      blue: 0.5,
      red: 0.4
    }
    return new this.Cesium.Color(
      ColorRgb.red,
      ColorRgb.green,
      ColorRgb.blue,
      this.opacity || 0.5
    )
  }

  created() {
    window.terrainAnalyse = null
  }

  // 微件失活时
  onDeActive() {
    this.remove()
  }

  add() {
    const { viewer } = this.webGlobe
    window.terrainAnalyse =
      window.terrainAnalyse || new this.Cesium.TerrainAnalyse(viewer, {})
    window.terrainAnalyse.enableContour(true)
    window.terrainAnalyse.updateMaterial('none')
    window.terrainAnalyse.changeContourWidth(this.formData.contourWidth)
    window.terrainAnalyse.changeContourSpacing(this.formData.contourSpacing)
  }

  remove() {
    // 判断是否已有等值线分析结果
    if (window.terrainAnalyse) {
      // 移除等值线分析显示结果
      window.terrainAnalyse.enableContour(false)
      window.terrainAnalyse = null
    }
  }
}
</script>
<style lang="less">
.mp-widget-flooding {
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
