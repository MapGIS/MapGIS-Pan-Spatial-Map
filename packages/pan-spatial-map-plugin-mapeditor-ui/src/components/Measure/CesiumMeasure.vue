<template>
  <div class="cesium-measure-wrapper"></div>
</template>

<script lang="ts">
import { Component, Mixins, Provide, Prop, Watch } from 'vue-property-decorator'
import { MapDocumentMixin } from '@mapgis/pan-spatial-map-store'

@Component({ components: {} })
export default class Measure extends Mixins(MapDocumentMixin) {
  @Provide()
  get webGlobe() {
    return this.map
  }

  @Provide()
  get Cesium() {
    return this.mapLib
  }

  @Prop({
    type: Object,
    default: () => {
      return {
        mode: '',
        clickCount: 0
      }
    }
  })
  measureMode!: Record<string, any>

  @Prop({ type: Number, default: 0 }) deleteCount!: number

  private measureModes = {
    measureLength: 'measure-length',
    measureArea: 'measure-area'
  }

  private preMode = ''

  @Watch('measureMode', { deep: true })
  changeMeasureMode() {
    if (this.measureMode.mode !== this.preMode) {
      this.preMode = this.measureMode.mode
    }
    if (this.measureTool) {
      this.measureTool.stopTool()
      this.measureTool = undefined
    }
    if (this.measureMode.mode === this.measureModes.measureLength) {
      this.measureTool = this.measureLengthTool
      this.measureTool.startTool()
    } else if (this.measureMode.mode === this.measureModes.measureArea) {
      this.measureTool = this.measureAreaTool
      this.measureTool.startTool()
    }
  }

  @Watch('deleteCount', { deep: true })
  toggleDelete() {
    if (this.measureTool) {
      this.measureTool.stopTool()
    }
  }

  @Watch('Cesium', { deep: true })
  mapLibChange() {
    if (this.Cesium) {
      if (!this.measureLengthTool) {
        this.measureLengthTool = this.addMeasureLengthTool()
      }
      if (!this.measureAreaTool) {
        this.measureAreaTool = this.addMeasureAreaTool()
      }
      if (!this.triangulationTool) {
        this.triangulationTool = this.addTriangulationTool()
      }
    }
  }

  private onMapClear() {
    this.toggleDelete()
  }

  private measureTool: any = undefined

  private measureLengthTool: any = undefined

  private measureAreaTool: any = undefined

  private triangulationTool: any = undefined

  mounted() {
    this.mapLibChange()
  }

  /**
   * 添加长度测量工具
   */
  addMeasureLengthTool() {
    if (!this.measureLengthTool)
      this.measureLengthTool = new this.Cesium.MeasureLengthTool(
        this.webGlobe.viewer
      )
    return this.measureLengthTool
  }

  /**
   * 开始进行长度测量
   */
  startMeasureLength() {
    this.addMeasureLengthTool()
    this.measureLengthTool.startTool()
  }

  /**
   * 停止进行长度测量
   */
  stopMeasureLength() {
    this.addMeasureLengthTool()
    this.measureLengthTool.stopTool()
  }

  /**
   * 添加面积测量工具
   */
  addMeasureAreaTool() {
    if (!this.measureAreaTool)
      this.measureAreaTool = new this.Cesium.MeasureAreaTool(
        this.webGlobe.viewer
      )
    return this.measureAreaTool
  }

  /**
   * 开始进行面积测量
   */
  startMeasureArea() {
    this.addMeasureAreaTool()
    this.measureAreaTool.startTool()
  }

  /**
   * 停止进行面积测量
   */
  stopMeasureArea() {
    this.addMeasureAreaTool()
    this.measureAreaTool.stopTool()
  }

  /**
   * 添加三角测量工具
   */
  addTriangulationTool() {
    if (!this.triangulationTool)
      this.triangulationTool = new this.Cesium.TriangulationTool(
        this.webGlobe.viewer
      )
    return this.triangulationTool
  }

  /**
   * 开始进行三角测量
   */
  startTriangulation() {
    this.addTriangulationTool()
    this.triangulationTool.startTool()
  }

  /**
   * 停止进行三角测量
   */
  stopTriangulation() {
    this.addTriangulationTool()
    this.triangulationTool.stopTool()
  }
}
</script>

<style scoped></style>
