<template>
  <div>
    <div v-for="(item, i) in markers" :key="'result-marker-' + i">
      <cesium-marker
        :marker="item"
        :fieldNames="getFildNames(item.properties)"
        :currentMarkerId="currentMarkerId"
        @markerId="updateCurrentMarkerId"
      ></cesium-marker>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Watch, Mixins, Emit } from 'vue-property-decorator'
import {
  FeatureGeoJSON,
  utilInstance,
  cesiumUtilInstance
} from '@mapgis/pan-spatial-map-store'
import { MapMixin } from '@mapgis/web-app-framework'

import CesiumMarker from '../../../components/CesiumMarker/CesiumMarker.vue'

@Component({
  components: { CesiumMarker }
})
export default class ResultTabCesium extends Mixins(MapMixin) {
  @Prop({
    type: Boolean,
    default: false
  })
  readonly filterWithMap!: boolean

  @Prop({
    type: Array,
    required: true
  })
  readonly markers!: Record<string, any>[]

  @Prop({
    type: Object,
    default: () => {
      return {}
    }
  })
  readonly bounds!: Record<string, any>

  @Prop({
    type: Object,
    default: () => {
      return {}
    }
  })
  readonly geojson!: Record<string, any>

  private entityNames: string[] = []

  private currentMarkerId = ''

  @Watch('bounds')
  changeMapBounds() {
    if (this.bounds && Object.keys(this.bounds).length > 0) {
      const { xmin, ymin, xmax, ymax } = this.bounds
      const Rectangle = new this.Cesium.Rectangle.fromDegrees(
        xmin,
        ymin,
        xmax,
        ymax
      )
      this.webGlobe.viewer.camera.flyTo({
        destination: Rectangle
      })
    }
  }

  @Watch('filterWithMap')
  changeFilterWithMap(val: boolean) {
    this.webGlobe.viewer.camera.changed.addEventListener(() => {
      if (!val) {
        return
      }
      const cExtent = cesiumUtilInstance.getCurrentExtent(this.webGlobe)
      const bounds = {
        xmin: cExtent.xmin,
        ymin: cExtent.ymin,
        xmax: cExtent.xmax,
        ymax: cExtent.ymax
      }
      this.emitMapBounds(bounds)
    })
  }

  @Emit('mapBounds')
  emitMapBounds(bounds: Record<string, any>) {}

  @Emit('clear')
  emitClear(clear: string) {}

  mounted() {
    cesiumUtilInstance.setCesiumGlobe(this.Cesium, this.webGlobe)
  }

  onMapLoad(map: any) {
    cesiumUtilInstance.setCesiumGlobe(this.Cesium, this.webGlobe)
  }

  @Watch('geojson', { immediate: true, deep: true })
  dataChange(val: FeatureGeoJSON | null) {
    this.clear()
    if (val && Object.keys(val).length > 0) {
      // 行政区划几何类型一般是Polygon
      const { features } = val
      this.entityNames = []
      const rgba = utilInstance.getRGBA('#6e599f', 0.75)
      const fillColor = new this.Cesium.Color(
        rgba.r / 255,
        rgba.g / 255,
        rgba.b / 255,
        rgba.a
      )
      const outlineRgba = utilInstance.getRGBA('#484896', 0.75)
      const fillOutlineColor = new this.Cesium.Color(
        outlineRgba.r / 255,
        outlineRgba.g / 255,
        outlineRgba.b / 255,
        outlineRgba.a
      )
      for (let i = 0; i < features.length; i += 1) {
        const coords = features[i].geometry.coordinates[0]
        const name = `result-entity-${i}`
        this.entityNames.push(name)
        cesiumUtilInstance.appendPolygon(
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
  }

  private clear() {
    for (let i = this.entityNames.length - 1; i >= 0; i -= 1) {
      cesiumUtilInstance.removeEntityByName(this.entityNames[i])
      this.entityNames.pop()
    }
  }

  getFildNames(properties: Record<string, any>) {
    const tags = utilInstance.getJsonTag(properties)
    return tags
  }

  updateCurrentMarkerId(id: string) {
    this.currentMarkerId = id
  }
}
</script>
<style lang="scss" scoped>
.width100 {
  width: 100%;
}
</style>
