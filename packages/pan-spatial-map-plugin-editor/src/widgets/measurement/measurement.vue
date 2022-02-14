<template>
  <mapgis-measure
    ref="mapgisMeasure"
    v-if="is2DMapMode"
    enableControl
    isAdvanceControl
  />
  <mapgis-3d-measure ref="mapgis3dMeasure" v-else />
</template>

<script lang="ts">
import { Mixins, Component, Watch } from 'vue-property-decorator'
import { WidgetMixin } from '@mapgis/web-app-framework'

@Component
export default class MpMeasurement extends Mixins(WidgetMixin) {
  onClose() {
    this.$refs[
      `${this.is2DMapMode ? 'mapgisMeasure' : 'mapgis3dMeasure'}`
    ].remove()
  }
}
</script>
