<template>
  <div>
    <MpMapView :page-height="pageHeight" v-if="isPlaneMode"></MpMapView>
    <MpSceneView :page-height="pageHeight" v-else></MpSceneView>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Mixins } from 'vue-property-decorator'
import { MapTypeChanageMixin } from '@mapgis/pan-spatial-map-store'
import MpMapView from './MapView.vue'
import MpSceneView from './SceneView.vue'

@Component({
  name: 'MpMapContainer',
  components: {
    MpMapView,
    MpSceneView
  }
})
export default class MpMapContainer extends Mixins(MapTypeChanageMixin) {
  @Prop(String) readonly pageHeight?: string

  @Prop({ default: true }) is2D?: boolean

  created() {
    this.mapType = this.is2D ? 'mapbox' : 'cesium'
  }
}
</script>
