<template>
  <div class="mapbox-measure-wrapper">
    <mapbox-measure
      class="measure-draw-wrapper"
      position="bottom-left"
      ref="measureRef"
      :measureMode="activeMeasureMode"
      @added="handleAdded"
      @measureResult="getMeasureResult"
      @onDrawModeChanged="onDrawModeChanged"
      @onAddNewFeature="onAddNewFeature"
    >
    </mapbox-measure>
  </div>
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

import { MapMixin } from '@mapgis/web-app-framework'
import { MapboxMeasure, MapboxMarker } from '@mapgis/webclient-vue-mapboxgl'
import { utilInstance } from '@mapgis/pan-spatial-map-store'

@Component({ components: { MapboxMeasure, MapboxMarker } })
export default class Measure extends Mixins(MapMixin) {
  @Prop({
    type: Object,
    default: () => {
      return {
        textType: '宋体',
        textColor: '#3300CC',
        textSize: 16,
        lineColor: '#CC3333',
        lineType: '实线',
        lineOpacity: 100,
        lineWidth: 3
      }
    }
  })
  measureSetting!: Record<string, any>

  @Prop({
    type: Object,
    default: () => {
      return {
        mode: '',
        var: 0
      }
    }
  })
  measureMode!: Record<string, any>

  @Prop({
    type: String,
    default: ''
  })
  distanceUnit!: string

  @Prop({
    type: String,
    default: ''
  })
  areaUnit!: string

  @Prop({
    type: Number,
    default: 0
  })
  clearVar!: number

  @Prop({
    type: Number,
    default: 0
  })
  stopVar!: number

  @Prop({
    type: Number,
    default: 0
  })
  deActiveVar!: number

  @Prop({
    type: Number,
    default: 0
  })
  activeVar!: number

  private measure: any = null

  // 当前激活的测量类型
  private activeMeasureMode = this.measureMode.mode

  mounted(): void {
    // this.enableMeasure()
  }

  @Watch('clearVar')
  clearMeasure() {}

  @Watch('stopVar')
  stopMeasure() {}

  @Watch('deActiveVar')
  onDeactive() {}

  @Watch('activeVar')
  onActive() {}

  @Watch('measureMode', { deep: true })
  changeMeasureMode() {
    this.activeMeasureMode = this.measureMode.mode
  }

  @Watch('measureSetting', { deep: true, immediate: true })
  changeMeasureSetting() {}

  enableMeasure() {
    const component: any = this.$refs.measureRef
    if (component && !this.measure) {
      component.enableMeasure()
    }
  }

  handleAdded() {}

  getMeasureResult() {}

  onDrawModeChanged() {}

  onAddNewFeature() {}
}
</script>

<style scoped></style>
