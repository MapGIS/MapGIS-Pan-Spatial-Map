<template>
  <div></div>
</template>

<script lang="ts">
import { Component, Watch, Mixins, Prop, Provide } from 'vue-property-decorator'
import { MapMixin } from '@mapgis/web-app-framework'
import { utilInstance, FeatureGeoJSON } from '@mapgis/pan-spatial-map-store'
import { bboxPolygon, lineString, bbox } from '@turf/turf'

@Component({})
export default class ZoneFrameMapbox extends Mixins(MapMixin) {
  @Prop({
    type: Object,
    required: true,
    default: () => {
      return {}
    }
  })
  readonly geojson!: FeatureGeoJSON | null

  @Prop({ type: String, default: '#FF0000' })
  readonly fillOutlineColor!: string

  @Prop({ type: String, default: '#EFFF5F' })
  readonly fillColor!: string

  @Prop({
    type: Object,
    default: () => {
      return {}
    }
  })
  readonly bounds!: Record<string, any>

  @Watch('geojson', { deep: true })
  changeGeojson(val: FeatureGeoJSON | null) {
    this.clear()
    if (val && Object.keys(val).length > 0) {
      this.map.addSource('zone-frame', { type: 'geojson', data: val })
      this.map.addLayer({
        id: 'zone-frame',
        type: 'fill',
        source: 'zone-frame',
        paint: {
          'fill-outline-color': this.fillOutlineColor,
          'fill-color': this.fillColor,
          'fill-opacity': 0.75
          // 'line-width': Number(this.lineWidth)
        }
      })
      this.map.addLayer({
        id: 'zone-frame-text',
        type: 'symbol',
        source: 'zone-frame',
        paint: { 'text-color': '#FD6A6F' },
        layout: {
          'text-field': '{name}',
          'text-size': 16
        }
      })
      if (val && JSON.stringify(val) !== '{}') {
        const box = bbox(val)
        const polygon = bboxPolygon(box)
        const bounds = [
          polygon.geometry?.coordinates[0][0],
          polygon.geometry?.coordinates[0][2]
        ]
        this.map.fitBounds(bounds, {
          padding: 45
        })
      }
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

  clear() {
    if (this.map.getLayer('zone-frame-text')) {
      this.map.removeLayer('zone-frame-text')
    }
    if (this.map.getLayer('zone-frame')) {
      this.map.removeLayer('zone-frame')
    }
    if (this.map.getSource('zone-frame')) {
      this.map.removeSource('zone-frame')
    }
  }

  private deactivated() {
    this.clear()
  }

  onMapClear() {
    this.clear()
  }
}
</script>

<style lang="scss"></style>
