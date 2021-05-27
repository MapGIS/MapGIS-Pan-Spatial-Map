<template>
  <mapgis-marker
    v-if="coordinate.length > 0"
    :coordinates="[coordinate[0], coordinate[1]]"
    anchor="bottom"
  >
    <img slot="marker" :src="`${baseUrl + markerImg}`" />
  </mapgis-marker>
</template>

<script lang="ts">
import {
  Component,
  Watch,
  Mixins,
  Provide,
  Prop,
  Emit
} from 'vue-property-decorator'
import { MapMixin, AppMixin } from '@mapgis/web-app-framework'
import {
  FeatureGeoJSON,
  baseConfigInstance
} from '@mapgis/pan-spatial-map-store'

@Component
export default class CoordinateMapbox extends Mixins(MapMixin, AppMixin) {
  @Prop({
    type: Boolean,
    default: false
  })
  readonly pickable!: boolean

  @Prop({
    type: Array,
    default: () => {
      return []
    }
  })
  readonly coordinate!: number[]

  @Prop({
    type: Array,
    default: () => {
      return []
    }
  })
  readonly center!: number[]

  @Prop({
    type: Object,
    required: true,
    default: () => {
      return {}
    }
  })
  readonly frameFeature!: FeatureGeoJSON | null

  @Prop({
    type: Object,
    default: () => {
      return {}
    }
  })
  readonly highlightStyle!: Record<string, any>

  private markerImg = `${baseConfigInstance.config.colorConfig.label.image.defaultImg}`

  @Watch('pickable')
  private pickableChange() {
    const canvas = this.map.getCanvasContainer()

    if (this.pickable) {
      this.map.on('click', this.onClick)
      canvas.style.cursor = 'default'
    } else {
      this.map.off('click', this.onClick)
      canvas.style.cursor = ''
    }
  }

  @Watch('center', { deep: true })
  centerChange() {
    if (this.center && this.center.length > 0) {
      this.map.panTo([this.center[0], this.center[1]])
    }
  }

  @Watch('frameFeature', { deep: true })
  private frameFeatureChange(val: FeatureGeoJSON | null) {
    this.clear()
    if (val && Object.keys(val).length > 0) {
      this.map.addSource('coordinate', { type: 'geojson', data: val })
      this.map.addLayer({
        id: 'coordinate',
        type: 'fill',
        source: 'coordinate',
        paint: {
          'fill-color': this.highlightStyle.feature.reg.color
        }
      })
      this.map.addLayer({
        id: 'coordinate-outline',
        type: 'line',
        source: 'coordinate',
        paint: {
          'line-color': this.highlightStyle.feature.line.color,
          'line-width': parseInt(this.highlightStyle.feature.line.size)
        }
      })
      this.map.addLayer({
        id: 'coordinate-text',
        type: 'symbol',
        source: 'coordinate',
        paint: { 'text-color': this.highlightStyle.label.text.color },
        layout: {
          'text-field': '{name}',
          'text-size': parseInt(this.highlightStyle.label.text.fontSize)
        }
      })
    }
  }

  @Emit('picked-coordinate')
  emitPickedCoordinate(pickedCoordinate: number[]) {}

  beforeDestroy() {
    this.clear()
    this.removeClickEvent()
  }

  private onClick({
    lngLat: { lng, lat }
  }: {
    lngLat: { lng: number; lat: number }
  }) {
    this.emitPickedCoordinate([lng, lat])
  }

  private clear() {
    if (this.map.getLayer('coordinate-text')) {
      this.map.removeLayer('coordinate-text')
    }
    if (this.map.getLayer('coordinate-outline')) {
      this.map.removeLayer('coordinate-outline')
    }
    if (this.map.getLayer('coordinate')) {
      this.map.removeLayer('coordinate')
    }
    if (this.map.getSource('coordinate')) {
      this.map.removeSource('coordinate')
    }
  }

  private removeClickEvent() {
    if (this.pickable) {
      this.map.off('click', this.onClick)
      this.map.getCanvasContainer().style.cursor = ''
    }
  }
}
</script>

<style lang="scss"></style>
