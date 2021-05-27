<template>
  <div>
    <div v-for="(item, i) in markers" :key="'placename-marker-' + i">
      <mp-cesium-marker
        :marker="item"
        :currentMarkerId="currentMarkerId"
        @marker-id="getCurrentMarkerId"
      ></mp-cesium-marker>
    </div>
  </div>
</template>

<script lang="ts">
import {
  Mixins,
  Provide,
  Component,
  Prop,
  Watch,
  Emit,
  Vue
} from 'vue-property-decorator'
import { utilInstance } from '@mapgis/pan-spatial-map-store'
import { MapMixin } from '@mapgis/web-app-framework'

@Component()
export default class PlaceNameCesium extends Mixins(MapMixin) {
  @Prop({ type: Array, required: true, default: [] })
  readonly markers!: Record<string, any>[]

  @Prop() geojson!: Record<string, unknown>

  private currentMarkerId = ''

  getCurrentMarkerId(id: string) {
    this.currentMarkerId = id
  }

  setMapCenter(positionCoord) {
    this.webGlobe.flyTo(positionCoord[0], positionCoord[1], 10000000, 2)
  }
}
</script>

<style scoped></style>
