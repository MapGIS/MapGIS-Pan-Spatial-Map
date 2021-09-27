<template>
  <!-- 分段专题图图层 -->
  <mapgis-igs-theme-layer-custom
    :showPanel="false"
    :dataSource="geojson"
    :themeProps="themeProps"
    :theme-options="themeOptions"
  />
</template>
<script lang="ts">
import { Mixins, Component } from 'vue-property-decorator'
import MapboxMixin from '../../mixins/mapbox'

@Component
export default class MapboxSubSectionMap extends Mixins(MapboxMixin) {
  get themeProps() {
    return {
      layerId: this.id,
      themeField: this.subjectData.field,
      themeType: 'range'
    }
  }

  get themeOptions() {
    return this.subjectData?.color || []
  }
}
</script>
