<template>
  <!-- 热力图 -->
  <mapgis-mapv-layer
    v-if="geojson && geojson.features && !!geojson.features.length"
    :geojson="geojson"
    :options="options"
    :count-field="field"
  />
</template>
<script lang="ts">
import { Mixins, Component } from 'vue-property-decorator'
import BaseMixin from '../../mixins/base'

@Component
export default class MapboxHeatMap extends Mixins(BaseMixin) {
  get options() {
    return {
      draw: 'heatmap',
      context: '2d',
      ...(this.subjectData?.themeStyle || {})
    }
  }
}
</script>
