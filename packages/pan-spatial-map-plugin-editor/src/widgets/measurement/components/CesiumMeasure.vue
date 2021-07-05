<template>
  <div class="cesium-measure-wrapper"></div>
</template>

<script lang="ts">
import {
  Component,
  Mixins,
  Provide,
  Prop,
  Watch,
  Emit
} from 'vue-property-decorator'
import { WidgetMixin } from '@mapgis/web-app-framework'
import MeasureMixin from '../mixins/measure'

@Component({ name: 'CesiumMeasure' })
export default class CesiumMeasure extends Mixins(WidgetMixin, MeasureMixin) {
  private measureTool: any = null

  // 测量结果
  private results: Record<string, any> = {}

  @Emit('start')
  emitMeasureStart() {}

  @Emit('finished')
  emitMeasureFineshed(results: Record<string, any>) {}

  // 打开测量工具
  openMeasure(mode) {
    // 每次打开绘制前先关闭之前的
    this.closeMeasure()
    // 设置测量模式
    this.setMeasureMode(mode)
    this.measureTool.startTool()
    // 发送测量开始的事件
    this.emitMeasureStart()
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
          this.webGlobe.viewer,
          {
            callBack: result => {
              this.results = {
                cesiumLength: (result[result.length - 1] / 1000).toFixed(2)
              }
              // 发送测量结束事件，会带上测量结果
              this.emitMeasureFineshed(this.results)
            }
          }
        )
        break
      case 'measure-area':
        this.measureTool = new this.Cesium.MeasureAreaTool(
          this.webGlobe.viewer,
          {
            callBack: result => {
              this.results = {
                cesiumArea: (result / (1000 * 1000)).toFixed(2)
              }
              // 发送测量结束事件，会带上测量结果
              this.emitMeasureFineshed(this.results)
            }
          }
        )
        break
      case 'measure-triangulation':
        this.measureTool = new this.Cesium.TriangulationTool(
          this.webGlobe.viewer,
          {
            callBack: result => {
              this.results = {
                horizontalDiatance: result.horizontalDiatance.toFixed(2),
                verticalDiatance: result.verticalDiatance.toFixed(2)
              }
              // 发送测量结束事件，会带上测量结果
              this.emitMeasureFineshed(this.results)
            }
          }
        )
        break
      default:
        break
    }
  }
}
</script>

<style lang="less" scoped></style>
