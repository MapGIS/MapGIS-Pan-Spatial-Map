<template>
  <!-- 蜂窝图 -->
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
export default class MapboxHexBin extends Mixins(BaseMixin) {
  get options() {
    return {
      context: '2d',
      draw: 'honeycomb',
      max: 100,
      ...(this.subjectData.style || {})
    }
  }
}
</script>
