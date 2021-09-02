<template>
  <div>
    <template v-if="!cluster">
      <mp-marker-set-pro :markers="markers" :field-configs="fieldConfigs">
      </mp-marker-set-pro>
      <mp-marker-set-pro
        :markers="activeMarkers"
        :field-configs="activeFieldConfigs"
      >
      </mp-marker-set-pro>
    </template>
  </div>
</template>

<script lang="ts">
import { Mixins, Component, Prop, Watch } from 'vue-property-decorator'
import { IFields } from '@mapgis/pan-spatial-map-common'
import { MapMixin } from '@mapgis/web-app-framework'

@Component()
export default class PlaceNameMapbox extends Mixins(MapMixin) {
  @Prop({ type: Array, required: true, default: [] })
  readonly fieldConfigs!: IFields[]

  @Prop({ type: [Array, Object], required: true, default: [] })
  readonly markers!: Record<string, any>[]

  @Prop({ type: Array, required: true, default: () => [] })
  readonly activeFieldConfigs!: IFields[]

  @Prop({ type: [Array, Object], required: true, default: [] })
  readonly activeMarkers!: Record<string, any>[]

  @Prop() cluster!: boolean

  @Prop() geojson!: Record<string, unknown>

  setMapCenter(positionCoord) {
    this.map.flyTo({
      center: positionCoord,
      curve: 1,
      easing(t) {
        return t
      }
    })
  }
}
</script>

<style lang="less" scoped>
.table-markers {
  max-height: 200px;
  overflow: auto;
  .table-marker-item {
    padding: 0;
    font-size: 10px;
    div {
      padding: 2px 2px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
  }
}
</style>
