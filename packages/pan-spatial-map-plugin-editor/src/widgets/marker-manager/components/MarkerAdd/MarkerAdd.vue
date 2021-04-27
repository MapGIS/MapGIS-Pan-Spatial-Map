<template>
  <div>
    <mapbox-marker-add
      v-if="is2DMapMode"
      :drawMode="drawMode"
      @addMarker="addMarker"
    />
  </div>
</template>

<script lang="ts">
import { Mixins, Component, Prop, Emit } from 'vue-property-decorator'

import { AppMixin } from '@mapgis/web-app-framework'

import MapboxMarkerAdd from './MapboxMarkerAdd.vue'

@Component({
  components: {
    MapboxMarkerAdd
  }
})
export default class MarkerAdd extends Mixins(AppMixin) {
  @Prop({ type: Object, default: '' }) drawMode!: Record<string, any>

  @Emit('addMarker')
  emitAddMarker(marker: any) {}

  addMarker(marker: any[]) {
    this.emitAddMarker(marker)
  }
}
</script>
