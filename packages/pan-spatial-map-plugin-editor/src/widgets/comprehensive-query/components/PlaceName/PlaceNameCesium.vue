<template>
  <div>
    <template v-if="!cluster">
      <mp-3d-marker-set-pro :markers="markers" :field-configs="fieldConfigs">
      </mp-3d-marker-set-pro>
    </template>
  </div>
</template>

<script lang="ts">
import { Mixins, Component, Prop, Watch } from 'vue-property-decorator'
import { IFields } from '@mapgis/pan-spatial-map-store'
import { MapMixin } from '@mapgis/web-app-framework'

@Component({ components: {} })
export default class PlaceNameCesium extends Mixins(MapMixin) {
  @Prop({ type: Array, required: true, default: [] })
  readonly fieldConfigs!: IFields[]

  @Prop({ type: [Array, Object], required: true, default: [] })
  readonly markers!: Record<string, any>[]

  @Prop() cluster!: boolean

  @Prop() geojson!: Record<string, unknown>

  setMapCenter(positionCoord) {}
}
</script>

<style scoped></style>
