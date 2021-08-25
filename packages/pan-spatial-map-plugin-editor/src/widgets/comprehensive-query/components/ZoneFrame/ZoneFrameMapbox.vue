<template>
  <div></div>
</template>

<script lang="ts">
import { Component, Watch, Mixins, Prop, Provide } from 'vue-property-decorator'
import { MapMixin, Feature } from '@mapgis/web-app-framework'
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
  readonly feature!: Feature.FeatureGeoJSON | null

  @Prop({
    type: Array,
    default: () => {
      return []
    }
  })
  readonly center

  @Prop({
    type: Object,
    default: () => {
      return {}
    }
  })
  readonly fitBound!: Record<string, any>

  @Prop({
    type: Object,
    default: () => {
      return {}
    }
  })
  readonly highlightStyle!: Record<string, any>

  timer = null

  mounted() {
    this.featureChange()
    this.timer = window.setTimeout(() => {
      this.clearTimer()
      this.centerChange()
      this.fitBoundChange()
    }, 500)
  }

  clearTimer() {
    if (this.timer !== null) {
      window.clearTimeout(this.timer)
      this.timer = null
    }
  }

  @Watch('feature', { deep: true })
  @Watch('highlightStyle', { deep: true })
  featureChange() {
    this.clear()
    if (this.feature && Object.keys(this.feature).length > 0) {
      this.map.addSource('zone-frame', { type: 'geojson', data: this.feature })
      this.map.addLayer({
        id: 'zone-frame',
        type: 'fill',
        source: 'zone-frame',
        paint: {
          'fill-color': this.highlightStyle.feature.reg.color
        }
      })
      this.map.addLayer({
        id: 'zone-frame-outline',
        type: 'line',
        source: 'zone-frame',
        paint: {
          'line-color': this.highlightStyle.feature.line.color,
          'line-width': parseInt(this.highlightStyle.feature.line.size)
        }
      })
      this.map.addLayer({
        id: 'zone-frame-text',
        type: 'symbol',
        source: 'zone-frame',
        paint: { 'text-color': this.highlightStyle.label.text.color },
        layout: {
          'text-field': '{name}',
          'text-size': parseInt(this.highlightStyle.label.text.fontSize)
        }
      })
    }
  }

  @Watch('center', { deep: true })
  centerChange() {
    if (this.center && this.center.length > 0) {
      this.map.panTo([this.center[0], this.center[1]])
    }
  }

  @Watch('fitBound', { deep: true })
  fitBoundChange() {
    if (this.fitBound && Object.keys(this.fitBound).length > 0) {
      const { xmin, ymin, xmax, ymax } = this.fitBound
      this.map.fitBounds([
        [xmin, ymin],
        [xmax, ymax]
      ])
    }
  }

  beforeDestroy() {
    this.clear()
    this.clearTimer()
  }

  private clear() {
    if (this.map.getLayer('zone-frame-text')) {
      this.map.removeLayer('zone-frame-text')
    }
    if (this.map.getLayer('zone-frame-outline')) {
      this.map.removeLayer('zone-frame-outline')
    }
    if (this.map.getLayer('zone-frame')) {
      this.map.removeLayer('zone-frame')
    }
    if (this.map.getSource('zone-frame')) {
      this.map.removeSource('zone-frame')
    }
  }
}
</script>

<style lang="less"></style>
