<template>
  <!-- 蜂窝图 -->
  <mapgis-3d-mapv-layer
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
export default class CesiumHexBin extends Mixins(BaseMixin) {
  get options() {
    return {
      cesium: {
        postRender: true,
        postRenderFrame: 0
      },
      context: '2d',
      draw: 'honeycomb',
      ...(this.subjectData.style || {})
    }
  }
}
</script>
