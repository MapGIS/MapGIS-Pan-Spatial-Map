<template>
  <div class="mapbox-measure-wrapper">
    <mapbox-measure
      class="measure-draw-wrapper"
      position="bottom-left"
      ref="measure"
      :measureMode="measureMode.mode"
      @added="handleAdded"
      @measureResult="getMeasureResult"
    >
      <div slot="measureMarker">
        <mapbox-marker
          v-for="(item, i) in measureMarkers"
          :key="'measuer-marker-' + i"
          :coordinates="item.coordinates"
        >
          <div slot="marker">
            <div
              v-for="text in item.text"
              :key="'measuerText-' + text"
              :style="
                `font-size: ${measureSetting.textSize}px;font-family: ${measureSetting.textType};color: ${measureSetting.textColor}`
              "
            >
              {{ text }}
            </div>
          </div>
        </mapbox-marker>
      </div>
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
import { MapboxMeasure, MapboxMarker } from '@mapgis/webclient-vue-mapboxgl'
import { MapDocumentMixin, utilInstance } from '@mapgis/pan-spatial-map-store'

@Component({ components: { MapboxMeasure, MapboxMarker } })
export default class Measure extends Mixins(MapDocumentMixin) {
  @Provide() map

  @Provide()
  get mapbox() {
    return this.mapLib
  }

  @Provide()
  actions = undefined

  @Prop({
    type: Object,
    default: () => {
      return {
        lineColor: '#3bb2d0',
        lineType: '实线',
        lineOpacity: 1,
        lineWidth: 1,
        textType: '宋体',
        textColor: '#CC3333',
        textSize: 12
      }
    }
  })
  measureSetting!: Record<string, any>

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

  @Prop({
    type: String,
    default: ''
  })
  unit!: string

  @Prop({ type: Number, default: 0 }) deleteCount!: number

  @Emit('results')
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  emitResults(results: Record<string, any>) {
    // console.log(mapInfo);
  }

  private measureModes = {
    measureLength: 'measure-length',
    measureArea: 'measure-area'
  }

  private measureMarkers: any[] = []

  private measure: any = null

  private results: Record<string, any> = {}

  private preMode = ''

  @Watch('measureMode', { deep: true })
  changeMeasureMode() {
    if (!this.measure) {
      this.enableMeasure()
    }
    if (this.measureMode.mode !== this.preMode) {
      this.measureMarkers = []
      this.preMode = this.measureMode.mode
    }
    if (this.measureMode.mode === this.measureModes.measureLength) {
      // eslint-disable-next-line no-unused-expressions
      this.measure && this.measure.changeMode('draw_line_string')
    } else if (this.measureMode.mode === this.measureModes.measureArea) {
      // eslint-disable-next-line no-unused-expressions
      this.measure && this.measure.changeMode('draw_polygon')
    }
  }

  @Watch('measureSetting', { deep: true })
  changeMeasureSetting() {
    const drawSources = ['mapbox-gl-draw-hot', 'mapbox-gl-draw-cold']
    if (
      this.map.getSource(drawSources[0]) ||
      this.map.getSource(drawSources[1])
    ) {
      const { layers } = this.map.getStyle()
      for (let i = 0; i < layers.length; i += 1) {
        const layer = layers[i]
        if (layer.source && drawSources.includes(layer.source)) {
          const { type } = layer
          if (type === 'line') {
            const layerId = layer.id
            this.map.setPaintProperty(
              layerId,
              'line-color',
              this.measureSetting.lineColor
            )

            if (this.measureSetting.lineType === '虚线') {
              this.map.setPaintProperty(layerId, 'line-dasharray', [0.2, 2])
            } else if (this.measureSetting.lineType === '实线') {
              this.map.setPaintProperty(layerId, 'line-dasharray', null)
            }
            this.map.setPaintProperty(
              layerId,
              'line-opacity',
              this.measureSetting.lineOpacity
            )
            this.map.setPaintProperty(
              layerId,
              'line-width',
              this.measureSetting.lineWidth
            )
          }
        }
      }
    }
  }

  @Watch('deleteCount', { deep: true })
  toggleDelete() {
    this.enableMeasure()
    this.measureMarkers = []
    // eslint-disable-next-line no-unused-expressions
    this.measure && this.measure.deleteAll()
  }

  private onMapClear() {
    this.toggleDelete()
  }

  handleAdded(e: any) {
    const { measure } = e
    this.measure = measure
  }

  getMeasureResult(result: any) {
    console.log(result)
    let perimeter = ''
    let area = ''
    let marker: any = null
    let perimeterR = 1
    let areaR = 1
    if (this.unit === 'km' || this.unit === '千米') {
      perimeterR = 1000
    } else if (this.unit === 'km2' || this.unit === '平方千米') {
      perimeterR = 1000
      areaR = 1000 * 1000
    }
    switch (this.measureMode.mode) {
      case this.measureModes.measureLength:
        perimeter = (result.perimeter / perimeterR).toFixed(2)
        marker = {
          coordinates: result.coordinates[result.coordinates.length - 1],
          text: [perimeter + this.unit],
          style: `color:${this.measureSetting.textColor};font-family:${this.measureSetting.textType};font-size:${this.measureSetting.textSize}`
        }
        this.measureMarkers.push(marker)
        // eslint-disable-next-line no-case-declarations
        const planeLength = perimeter + this.unit
        // eslint-disable-next-line no-case-declarations
        const ellipsoidLength = perimeter + this.unit
        this.results = { planeLength, ellipsoidLength }
        break
      case this.measureModes.measureArea:
        perimeter = (result.perimeter / perimeterR).toFixed(2)
        area = (result.area / areaR).toFixed(2)
        marker = {
          coordinates: utilInstance.getCenterOfGravityPoint(
            result.coordinates[0]
          ),
          text: [
            `周长: ${perimeter}${this.unit.split('平方')[1]}`,
            `面积：${area}${this.unit}`
          ],
          style: `color:${this.measureSetting.textColor};font-family:${this.measureSetting.textType};font-size:${this.measureSetting.textSize}`
        }
        this.measureMarkers.push(marker)
        // eslint-disable-next-line no-case-declarations
        const planePerimeter = perimeter + this.unit.split('平方')[1]
        // eslint-disable-next-line no-case-declarations
        const planeArea = area + this.unit
        // eslint-disable-next-line no-case-declarations
        const ellipsoidPerimeter = perimeter + this.unit.split('平方')[1]
        // eslint-disable-next-line no-case-declarations
        const ellipsoidArea = area + this.unit
        this.results = {
          planePerimeter,
          planeArea,
          ellipsoidPerimeter,
          ellipsoidArea
        }
        break
      default:
        break
    }
    this.emitResults(this.results)
  }

  enableMeasure() {
    const component = this.$refs.measure
    // eslint-disable-next-line no-unused-expressions
    component && component.enableMeasure()
  }
}
</script>

<style scoped></style>
