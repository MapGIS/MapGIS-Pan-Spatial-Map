<template>
  <div></div>
</template>

<script lang="ts">
import { Component, Watch, Mixins, Prop, Provide } from 'vue-property-decorator'
import { MapMixin } from '@mapgis/web-app-framework'
import {
  utilInstance,
  FeatureGeoJSON,
  cesiumUtilInstance
} from '@mapgis/pan-spatial-map-store'

@Component({})
export default class ZoneFramCesium extends Mixins(MapMixin) {
  @Prop({
    type: Object,
    required: true,
    default: () => {
      return {}
    }
  })
  readonly feature!: FeatureGeoJSON | null

  @Prop({
    type: Object,
    default: () => {
      return {}
    }
  })
  readonly highlightStyle!: Record<string, any>

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

  private cesiumUtil = cesiumUtilInstance

  private entityNames: string[] = []

  @Watch('feature', { deep: true })
  @Watch('highlightStyle', { deep: true })
  featureChange() {
    this.clear()
    if (this.feature && Object.keys(this.feature).length > 0) {
      // 行政区划几何类型一般是Polygon
      this.entityNames = []

      const fillColor = new this.Cesium.Color.fromCssColorString(
        this.highlightStyle.feature.reg.color
      )

      const fillOutlineColor = new this.Cesium.Color.fromCssColorString(
        this.highlightStyle.feature.line.color
      )

      const coords = this.feature.geometry.coordinates[0]
      const name = 'zone-frame'
      this.entityNames.push(name)
      this.cesiumUtil.appendPolygon(
        name,
        coords
          .join(',')
          .split(',')
          .map(Number),
        fillColor,
        fillOutlineColor
      )
    }
  }

  @Watch('center', { deep: true })
  centerChange() {
    if (this.center && this.center.length > 0) {
      this.webGlobe.viewer.camera.flyTo({
        destination: this.Cesium.Cartesian3.fromDegrees(
          this.center[0],
          this.center[1],
          this.webGlobe.viewer.camera.positionCartographic.height
        )
      })
    }
  }

  @Watch('fitBound', { deep: true })
  fitBoundChange() {
    if (this.fitBound && Object.keys(this.fitBound).length > 0) {
      const { xmin, ymin, xmax, ymax } = this.fitBound
      const rectangle = new this.Cesium.Rectangle.fromDegrees(
        xmin,
        ymin,
        xmax,
        ymax
      )
      this.webGlobe.viewer.camera.flyTo({
        destination: rectangle
      })
    }
  }

  mounted() {
    this.cesiumUtil.setCesiumGlobe(this.Cesium, this.webGlobe)
  }

  beforeDestroy() {
    this.clear()
  }

  private clear() {
    for (let i = this.entityNames.length - 1; i >= 0; i -= 1) {
      this.cesiumUtil.removeEntityByName(this.entityNames[i])
      this.entityNames.pop()
    }
  }
}
</script>

<style lang="scss"></style>
