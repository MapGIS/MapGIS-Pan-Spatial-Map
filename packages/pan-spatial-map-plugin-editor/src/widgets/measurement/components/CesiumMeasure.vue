<template>
  <div class="cesium-measure-wrapper"></div>
</template>

<script lang="ts">
import { Component, Mixins, Provide, Prop, Watch } from 'vue-property-decorator'
import { WidgetMixin } from '@mapgis/web-app-framework'
import MeasureMixin from '../mixins/measure'

@Component({ name: 'CesiumMeasure' })
export default class CesiumMeasure extends Mixins(WidgetMixin, MeasureMixin) {
  private measureTool: any = null

  // 打开测量工具
  openMeasure(mode) {
    // 每次打开绘制前先关闭之前的
    this.clearMeasure()
    // 设置测量模式
    this.setMeasureMode(mode)
    this.measureTool.startTool()
  }

  // 关闭测量工具
  closeMeasure() {
    if (this.measureTool && this.measureTool._handler) {
      this.measureTool.stopTool()
    }
  }

  // 设置测量模式
  setMeasureMode(mode) {
    switch (mode) {
      case 'measure-length':
        this.measureTool = new this.Cesium.MeasureLengthTool(
          this.webGlobe.viewer
        )
        break
      case 'measure-area':
        this.measureTool = new this.Cesium.MeasureAreaTool(this.webGlobe.viewer)
        break
      case 'measure-triangulation':
        this.measureTool = new this.Cesium.TriangulationTool(
          this.webGlobe.viewer
        )
        break
      default:
        break
    }
  }
}
</script>

<style lang="less" scoped></style>
