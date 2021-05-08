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

  private cesiumUtil = cesiumUtilInstance

  private entityNames: string[] = []

  mounted() {
    this.cesiumUtil.setCesiumGlobe(this.Cesium, this.webGlobe)
  }

  @Watch('geojson')
  changeGeojson(val: FeatureGeoJSON | null) {
    this.clear()
    if (val && Object.keys(val).length > 0) {
      // 行政区划几何类型一般是Polygon
      const { features } = val
      this.entityNames = []
      const rgba = utilInstance.getRGBA(this.fillColor, 0.75)
      const fillColor = new this.Cesium.Color(
        rgba.r / 255,
        rgba.g / 255,
        rgba.b / 255,
        rgba.a
      )
      const outlineRgba = utilInstance.getRGBA(this.fillOutlineColor, 0.75)
      const fillOutlineColor = new this.Cesium.Color(
        outlineRgba.r / 255,
        outlineRgba.g / 255,
        outlineRgba.b / 255,
        outlineRgba.a
      )
      for (let i = 0; i < features.length; i += 1) {
        const coords = features[i].geometry.coordinates[0]
        const name = `zone-frame-${i}`
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
      const center = utilInstance.getFeaturesCenter(val.features)
      this.webGlobe.flyTo(center[0], center[1], 10000000, 2)
    }
  }

  @Watch('bounds', { deep: true })
  fitBounds() {
    if (this.bounds && Object.keys(this.bounds).length > 0) {
      const { xmin, ymin, xmax, ymax } = this.bounds
      // eslint-disable-next-line new-cap
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

  clear() {
    for (let i = this.entityNames.length - 1; i >= 0; i -= 1) {
      this.cesiumUtil.removeEntityByName(this.entityNames[i])
      this.entityNames.pop()
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
