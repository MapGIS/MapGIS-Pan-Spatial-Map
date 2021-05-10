<template>
  <div class="coordinate column q-pa-md">
    <mapbox-marker
      v-if="isShowMarker"
      :coordinates="[coordinate[0], coordinate[1]]"
    >
      <img slot="marker" :src="markerBlue" />
    </mapbox-marker>
  </div>
</template>

<script lang="ts">
/* eslint-disable @typescript-eslint/no-non-null-assertion */
import {
  Component,
  Watch,
  Mixins,
  Provide,
  Prop,
  Emit
} from 'vue-property-decorator'
import { MapMixin, WidgetState } from '@mapgis/web-app-framework'
import { MapboxMarker } from '@mapgis/webclient-vue-mapboxgl'
import {
  FeatureGeoJSON,
  baseConfigInstance
} from '@mapgis/pan-spatial-map-store'

@Component({
  components: { MapboxMarker }
})
export default class CoordinateMapbox extends Mixins(MapMixin) {
  @Prop({
    type: Object,
    required: true,
    default: () => {
      return {}
    }
  })
  readonly geojson!: FeatureGeoJSON | null

  @Prop({
    type: Object,
    default: () => {
      return {}
    }
  })
  readonly bounds!: Record<string, any>

  @Prop({
    type: Boolean,
    default: false
  })
  readonly isClick!: boolean

  @Prop({
    type: String,
    default: WidgetState.CLOSED
  })
  readonly widgetState!: string

  @Prop({
    type: Array,
    default: () => {
      return []
    }
  })
  readonly coordinate!: number[]

  @Emit('mapCoordinate')
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  emitMapCoordinate(mapCoordinate: number[]) {}

  private mounted() {
    console.log('mounted')
    this.onGeojsonChanged()
    this.onInteractModeChanged()
  }

  private beforeDestory() {
    // this.clearCoordinate()
  }

  private destroyed() {
    console.log('destroyed')
    this.clearCoordinate()

    if (this.isClick) {
      this.map.off('click', this.getMouseCoordinate)
    }
  }

  private fillOutlineColor = '#484896'

  private fillColor = '#6e599f'

  private markerBlue = `${this.baseUrl}${baseConfigInstance.config.colorConfig.label.image.defaultImg}`

  private get isShowMarker() {
    return !(this.widgetState === WidgetState.CLOSED)
  }

  @Watch('isClick')
  private onInteractModeChanged() {
    // 修改说明：通过this.map.on('click', this.getMouseCoordinate.bind(this))添加事件监听的写法,会造成事件监听无法移除。
    // 修改人：马原野 2020年11月27日
    if (this.isClick) {
      this.map.on('click', this.getMouseCoordinate)
    } else {
      this.map.off('click', this.getMouseCoordinate)
    }
  }

  @Watch('widgetState')
  private onwidgetStateChange() {
    if (this.widgetState === WidgetState.DEACTIVE) {
    } else if (this.widgetState === WidgetState.CLOSED) {
      this.clearCoordinate()
    }
  }

  @Watch('geojson')
  private onGeojsonChanged() {
    this.clearCoordinate()
    if (this.geojson && Object.keys(this.geojson).length > 0) {
      this.map.addSource('coordinate', {
        type: 'geojson',
        data: this.geojson
      })
      this.map.addLayer({
        id: 'coordinate',
        type: 'fill',
        source: 'coordinate',
        paint: {
          'fill-outline-color': this.fillOutlineColor,
          'fill-color': this.fillColor,
          'fill-opacity': 0.75
        }
      })
    }
  }

  @Watch('bounds', { deep: true })
  fitBounds() {
    if (this.bounds && Object.keys(this.bounds).length > 0) {
      const { xmin, ymin, xmax, ymax } = this.bounds
      this.map.fitBounds([
        [xmin, ymin],
        [xmax, ymax]
      ])
    }
  }

  // 地图点击回调方法
  private getMouseCoordinate({
    lngLat: { lng, lat }
  }: {
    lngLat: { lng: number; lat: number }
  }) {
    if (this.widgetState === WidgetState.ACTIVE) {
      this.emitMapCoordinate([lng, lat])
    }
  }

  // 清除
  private clearCoordinate() {
    if (this.map.getLayer('coordinate')) {
      this.map.removeLayer('coordinate')
    }
    if (this.map.getSource('coordinate')) {
      this.map.removeSource('coordinate')
    }
  }

  private deactivated() {
    this.clearCoordinate()
  }

  onMapClear() {
    this.clearCoordinate()
  }
}
</script>

<style lang="scss"></style>
