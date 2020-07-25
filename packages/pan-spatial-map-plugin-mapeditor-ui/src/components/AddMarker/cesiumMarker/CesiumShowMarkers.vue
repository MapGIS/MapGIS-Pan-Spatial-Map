<template>
  <div class="cesium-marker">
    <div v-for="(item, i) in markers" :key="'cesium-marker-' + i">
      <cesium-marker-dialog
        :marker="item"
        :currentMarkerId="currentMarkerId"
        @delete="interactCancel(item)"
        @markerId="getCurrentMarkerId"
      ></cesium-marker-dialog>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Mixins, Provide, Prop } from 'vue-property-decorator'
import { CesiumPopup } from '@mapgis/webclient-vue-cesium'
import { MapDocumentMixin } from '@mapgis/pan-spatial-map-store'
import MarkerInfo from '../MarkerInfo.vue'
import cesiumMarkerMixin from './cesiumMarkerMixin'
import CesiumMarkerDialog from './CesiumMarkerDialog.vue'

@Component({
  components: {
    CesiumPopup,
    MarkerInfo,
    CesiumMarkerDialog
  }
})
export default class CesiumShowMarkers extends Mixins(
  MapDocumentMixin,
  cesiumMarkerMixin
) {
  @Provide()
  get webGlobe() {
    return this.map
  }

  @Provide()
  get Cesium() {
    return this.mapLib
  }

  @Prop({ type: Array, required: true }) markers!: Record<string, any>[]

  private prePopup: any = undefined

  private markerFeatures: any[] = []

  onMapLoad(map: any) {
    if (map.crs) {
      return
    }
    this.cesiumUtil.setCesiumGlobe(this.Cesium, this.webGlobe)
  }

  private currentMarkerId = ''

  mounted() {
    if (this.Cesium) {
      this.cesiumUtil.setCesiumGlobe(this.Cesium, this.webGlobe)
    }
  }

  onMapClear() {
    this.markers = []
  }

  interactCancel(item: any) {
    const index = this.markers.indexOf(item)
    this.markers.splice(index, 1)
    this.cesiumUtil.removeEntityByName(item.id)
  }

  getCurrentMarkerId(id: string) {
    this.currentMarkerId = id
  }
}
</script>

<style>
.mapboxgl-popup-content {
  position: relative;
  background: rgba(255, 255, 255, 0.8);
  /* border-radius: 0px; */
  box-shadow: 0 1px 2px rgba(255, 255, 255, 0.1);
  /* padding: 10px 10px; */
  pointer-events: auto;
}

.mapboxgl-popup-tip {
  width: 0;
  height: 0;
  border: 10px solid transparent;
  z-index: 1;
  background: rgba(255, 255, 255, 0);
  align-self: center;
  border-bottom: none;
  border-top-color: rgba(255, 255, 255, 0);
}
</style>
