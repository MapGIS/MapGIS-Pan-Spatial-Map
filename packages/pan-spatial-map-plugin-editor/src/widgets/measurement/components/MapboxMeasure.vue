<template>
  <div class="mapbox-measure-wrapper">
    <mapgis-measure
      class="measure-draw-wrapper"
      position="bottom-left"
      ref="measureRef"
      :measureMode="activeMeasureMode"
      @added="handleAdded"
      @measureResult="getMeasureResult"
      @onDrawModeChanged="onDrawModeChanged"
      @onAddNewFeature="onAddNewFeature"
    >
      <div slot="measureMarker">
        <mapgis-marker
          v-for="(item, index) in measureMarkers"
          :key="'measuer-marker-' + index"
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
        </mapgis-marker>
      </div>
    </mapgis-measure>
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
import { utilInstance } from '@mapgis/pan-spatial-map-store'

@Component({ components: {} })
export default class Measure extends Mixins(MapMixin) {
  DrawSources = ['mapbox-gl-draw-hot', 'mapbox-gl-draw-cold']

  @Provide()
  actions = undefined

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

  @Emit('start')
  onMeasureStart() {}

  @Emit('finished')
  onMeasureFineshed(results: Record<string, any>) {}

  private measure: any = null

  // 当前激活的测量类型
  private activeMeasureMode = this.measureMode.mode

  private measureMarkers: any[] = []

  // 测量结果
  private results: Record<string, any> = {}

  private changeMeasureSettingInterval = null

  mounted(): void {
    this.enableMeasure()
  }

  @Watch('clearVar')
  clearMeasure() {
    this.measureMarkers = []
    if (this.measure) {
      this.measure.deleteAll()
      this.measure.changeMode('simple_select')
    }
  }

  @Watch('stopVar')
  stopMeasure() {}

  @Watch('deActiveVar')
  onDeactive() {
    this.measure.changeMode('simple_select')
  }

  @Watch('activeVar')
  onActive() {
    this.moveMeasureLayersToTop()
    this.changeMapBoxDrawMode()
  }

  @Watch('measureMode', { deep: true })
  changeMeasureMode() {
    this.clearMeasure()
    this.moveMeasureLayersToTop()
    this.activeMeasureMode = this.measureMode.mode
    this.onMeasureStart()
    this.changeMapBoxDrawMode()
  }

  @Watch('measureSetting', { deep: true, immediate: true })
  changeMeasureSetting() {
    if (this.map === null) {
      return false
    }
    if (this.isMapboxDrawSourceAdded()) {
      if (this.changeMeasureSettingInterval) {
        clearInterval(this.changeMeasureSettingInterval)
      }
      const { layers } = this.map.getStyle()
      for (let i = 0; i < layers.length; i += 1) {
        const layer = layers[i]
        if (layer.source && this.DrawSources.includes(layer.source)) {
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
              this.measureSetting.lineOpacity / 100
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

  enableMeasure() {
    const component: any = this.$refs.measureRef
    if (component && !this.measure) {
      component.enableMeasure()
    }
  }

  handleAdded(e: any) {
    const { measure } = e
    this.measure = measure
    this.changeMeasureSettingInterval = setInterval(_ => {
      if (this.isMapboxDrawSourceAdded()) {
        this.changeMeasureSetting()
      }
    }, 20)
  }

  // 将量算绘制的图层移到所有图层上方，避免被覆盖
  moveMeasureLayersToTop() {
    if (this.map === null) {
      return false
    }
    if (
      this.map.getSource(this.DrawSources[0]) ||
      this.map.getSource(this.DrawSources[1])
    ) {
      const { layers } = this.map.getStyle()
      for (let i = 0; i < layers.length; i++) {
        const layer = layers[i]
        if (layer.source && this.DrawSources.includes(layer.source)) {
          this.map.moveLayer(layer.id)
        }
      }
    }
  }

  // 根据当前激活类型来选择对应的绘制类型
  changeMapBoxDrawMode() {
    switch (this.activeMeasureMode) {
      case 'measure-length':
        if (this.measure) {
          this.measure.changeMode('draw_line_string')
        }
        break
      case 'measure-area':
        if (this.measure) {
          this.measure.changeMode('draw_polygon')
        }
        break
      default:
        break
    }
  }

  isMapboxDrawSourceAdded() {
    if (
      this.map.getSource(this.DrawSources[0]) &&
      this.map.getSource(this.DrawSources[1])
    ) {
      return true
    }
    return false
  }

  onDrawModeChanged(drawMode: any) {
    if (drawMode.mode === 'simple_select') {
      this.changeMapBoxDrawMode()
    }
  }

  onAddNewFeature() {
    const data = this.measure.getAll()
    if (data.features.length > 1) {
      const featureIds = []
      for (let i = 0; i < data.features.length - 1; i++) {
        featureIds.push(data.features[i].id)
      }
      this.measure.delete(featureIds)
      this.measureMarkers = []
    }
  }

  // 根据所选单位值，对距离单位进行处理
  transDistanceUnit() {
    let perimeterR = 1
    let perimeterUnitLabel = ''

    switch (this.distanceUnit) {
      case 'm':
        perimeterR = 1
        perimeterUnitLabel = this.distanceUnit
        break
      case 'km':
        perimeterR = 1000
        perimeterUnitLabel = this.distanceUnit
        break
      case '米':
        perimeterR = 1
        perimeterUnitLabel = this.distanceUnit
        break
      case '千米':
        perimeterR = 1000
        perimeterUnitLabel = this.distanceUnit
        break
      default:
        break
    }

    return {
      perimeterR,
      perimeterUnitLabel
    }
  }

  // 根据所选单位值，对面积单位进行处理
  transAreaUnit() {
    let perimeterR = 1
    let areaR = 1
    let perimeterUnitLabel = ''
    let areaUnitLabel = ''

    switch (this.areaUnit) {
      case 'm2':
        perimeterR = 1
        areaR = 1
        perimeterUnitLabel = 'm'
        areaUnitLabel = this.areaUnit
        break
      case 'km2':
        perimeterR = 1000
        areaR = 1000 * 1000
        perimeterUnitLabel = 'km'
        areaUnitLabel = this.areaUnit
        break
      case '平方米':
        perimeterR = 1
        areaR = 1
        perimeterUnitLabel = '米'
        areaUnitLabel = this.areaUnit
        break
      case '平方千米':
        perimeterR = 1000
        areaR = 1000 * 1000
        perimeterUnitLabel = '千米'
        areaUnitLabel = this.areaUnit
        break
      default:
        break
    }

    return {
      perimeterR,
      areaR,
      perimeterUnitLabel,
      areaUnitLabel
    }
  }

  getMeasureResult(result: any) {
    let perimeter = ''
    let area = ''
    let marker: any = null
    let distanceUnitExp
    let areaUnitExp

    this.results = {}

    switch (this.activeMeasureMode) {
      case 'measure-length':
        distanceUnitExp = this.transDistanceUnit()
        perimeter = (result.perimeter / distanceUnitExp.perimeterR).toFixed(2)
        marker = {
          coordinates: result.coordinates[result.coordinates.length - 1],
          text: [perimeter + distanceUnitExp.perimeterUnitLabel],
          style: `color:${this.measureSetting.textColor};font-family:${this.measureSetting.textType};font-size:${this.measureSetting.textSize}`
        }
        this.measureMarkers.push(marker)
        this.results = {
          planeLength: perimeter + distanceUnitExp.perimeterUnitLabel,
          ellipsoidLength: perimeter + distanceUnitExp.perimeterUnitLabel
        }
        break
      case 'measure-area':
        areaUnitExp = this.transAreaUnit()
        perimeter = (result.perimeter / areaUnitExp.perimeterR).toFixed(2)
        area = (result.area / areaUnitExp.areaR).toFixed(2)
        marker = {
          coordinates: utilInstance.getCenterOfGravityPoint(
            result.coordinates[0]
          ),
          text: [
            `周长: ${perimeter}${areaUnitExp.perimeterUnitLabel}`,
            `面积：${area}${areaUnitExp.areaUnitLabel}`
          ],
          style: `color:${this.measureSetting.textColor};font-family:${this.measureSetting.textType};font-size:${this.measureSetting.textSize}`
        }
        this.measureMarkers.push(marker)
        this.results = {
          planePerimeter: perimeter + areaUnitExp.perimeterUnitLabel,
          planeArea: area + areaUnitExp.areaUnitLabel,
          ellipsoidPerimeter: perimeter + areaUnitExp.perimeterUnitLabel,
          ellipsoidArea: area + areaUnitExp.areaUnitLabel
        }
        break
      default:
        break
    }
    this.onMeasureFineshed(this.results)
  }
}
</script>

<style scoped></style>
