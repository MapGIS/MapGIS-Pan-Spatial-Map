<template>
  <div>
    <mapbox-marker-show
      v-if="is2DMapMode"
      :markers="markers"
    ></mapbox-marker-show>
  </div>
</template>

<script lang="ts">
import { Mixins, Component, Prop, Watch } from 'vue-property-decorator'

import { AppMixin } from '@mapgis/web-app-framework'

import MapboxMarkerShow from './MapboxMarkerShow.vue'

@Component({
  components: {
    MapboxMarkerShow
  }
})
export default class MarkerShow extends Mixins(AppMixin) {
  @Prop({ type: Array, required: true }) markers!: Record<string, any>[]
}
</script>

<style>
.mapboxgl-popup-content {
  position: relative;
  background: rgba(255, 255, 255, 0.8);
  border-radius: 3px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2), 0 1px 1px rgba(0, 0, 0, 0.14),
    0 2px 1px -1px rgba(0, 0, 0, 0.12);
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
