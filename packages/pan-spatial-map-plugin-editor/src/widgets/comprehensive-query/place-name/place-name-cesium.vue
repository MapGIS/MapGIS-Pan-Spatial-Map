<template>
  <div>
    <div v-for="(item, i) in markers" :key="'placename-marker-' + i">
      <mp-cesium-marker
        :marker="item"
        :fieldNames="fieldNames"
        :currentMarkerId="currentMarkerId"
        @markerId="getCurrentMarkerId"
      ></mp-cesium-marker>
    </div>
  </div>
</template>

<script lang="ts">
import { Mixins, Provide, Component, Prop, Watch } from 'vue-property-decorator'
import {
  MapDocumentMixin,
  cesiumUtilInstance
} from '@mapgis/pan-spatial-map-store'

@Component({ components: {} })
export default class PlaceNameCesium extends Mixins(MapDocumentMixin) {
  @Provide()
  get webGlobe() {
    return this.map
  }

  @Provide()
  get Cesium() {
    return this.mapLib
  }

  @Prop({ type: Array, required: true, default: [] })
  readonly fieldNames!: []

  @Prop({ type: Array, required: true, default: [] })
  readonly markers!: Record<string, any>[]

  @Prop({ type: Array, default: [] })
  readonly positionCoord!: number[]

  private currentMarkerId = ''

  private oldMarkers: Record<string, any>

  @Watch('positionCoord', { deep: true })
  updatePositionCoord() {
    this.webGlobe.flyTo(
      this.positionCoord[0],
      this.positionCoord[1],
      10000000,
      2
    )
  }

  @Watch('markers', { deep: true })
  updateMarkers() {
    if (
      this.oldMarkers &&
      this.markers &&
      this.oldMarkers[0].id !== this.markers[0].id
    ) {
      for (let i = 0; i < this.oldMarkers.length; i += 1) {
        const marker = this.oldMarkers[i]
        cesiumUtilInstance.removeEntityByName(marker.id)
      }
    }
    this.oldMarkers = [...this.markers]
  }

  getCurrentMarkerId(id: string) {
    this.currentMarkerId = id
  }

  onMapLoad(map: any) {
    if (map.crs) {
      return
    }
    cesiumUtilInstance.setCesiumGlobe(this.Cesium, this.webGlobe)
  }

  onMapClear() {
    for (let i = 0; i < this.oldMarkers.length; i += 1) {
      const marker = this.oldMarkers[i]
      cesiumUtilInstance.removeEntityByName(marker.id)
    }
  }
}
</script>

<style scoped></style>
