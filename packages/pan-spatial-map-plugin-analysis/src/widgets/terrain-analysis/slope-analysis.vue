<template>
  <div class="mp-widget-slope-analysis">
    <div class="panel">
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
    </div>
    <div class="footer">
      <a-button type="primary" @click="add">开始分析</a-button>
      <a-button type="primary" @click="remove">结束分析</a-button>
    </div>
  </div>
</template>
<script lang="ts">
declare const CesiumZondy
import { Vue, Component, Mixins } from 'vue-property-decorator'
import { WidgetMixin, ColorUtil } from '@mapgis/web-app-framework'
import { Sketch } from 'vue-color'

@Component({ name: 'MpSlopeAnalysis', components: { 'sketch-picker': Sketch } })
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
    /** 视点跳转仅用于测试用（拖动球体，再去绘制，很难找到坡度分析支持的视角，导致绘制后不显示分析结果） */
    // 初始化视图功能管理类
    const sceneManager = new CesiumZondy.Manager.SceneManager({
      viewer: this.webGlobe.viewer
    })
    // 视点跳转（跳转到台湾）
    sceneManager.flyToEx(120.9819, 23.5307, {
      height: 9161,
      heading: 30,
      pitch: -10,
      roll: 0
    })
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
        const Color = color.split(',')
        const ColorRgb = {
          green: Number(Color[1] / 255),
          blue: Number(parseInt(Color[2]) / 255),
          red: Number(Color[0].split('(')[1] / 255),
          alpha: Number(Color[3].split(')')[0])
        }
        return new this.Cesium.Color(
          ColorRgb.red,
          ColorRgb.green,
          ColorRgb.blue,
          ColorRgb.alpha
        )
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

  // 颜色拾取器对应事件
  private onColorChange(val, index) {
    Vue.set(this.arrayColor, index, ColorUtil.colorObjectToRgba(val.rgba))
  }
}
</script>
<style lang="less">
.mp-widget-slope-analysis {
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
