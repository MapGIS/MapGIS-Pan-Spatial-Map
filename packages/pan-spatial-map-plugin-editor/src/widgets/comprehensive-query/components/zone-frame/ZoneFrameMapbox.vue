<template>
  <div></div>
</template>

<script lang="ts">
import { Component, Watch, Mixins, Prop, Provide } from 'vue-property-decorator'
import { MapMixin } from '@mapgis/web-app-framework'
import { utilInstance, FeatureGeoJSON } from '@mapgis/pan-spatial-map-store'

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

  @Prop({ type: String, default: '#484896' })
  readonly fillOutlineColor!: string

  @Prop({ type: String, default: '#6e599f' })
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
      const center = utilInstance.getFeaturesCenter(val.features)
      this.map.flyTo({
        center,
        speed: 1.2,
        curve: 1,
        easing(t: any) {
          return t
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

  clear() {
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
