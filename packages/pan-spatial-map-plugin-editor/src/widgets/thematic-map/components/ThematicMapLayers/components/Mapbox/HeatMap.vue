<template>
  <!-- 热力图 -->
  <mapgis-mapv-layer
    v-if="geojsonPoint.features && geojsonPoint.features.length"
    :geojson="geojsonPoint"
    :options="options"
    :count-field="countField"
  />
</template>
<script lang="ts">
import { Mixins, Component } from 'vue-property-decorator'
import BaseMinxin from '../../mixins/base'

@Component
export default class MapboxHeatMap extends Mixins(BaseMinxin) {
  geojsonPoint = {}

  get countField() {
    return 'count'
  }

  get options() {
    return {
      context: '2d',
      draw: 'heatmap',
      max: 60,
      ...(this.subjectData.style || {})
    }
  }

  /**
   * 展示图层
   */
  showLayer() {
    if (this.geojson) {
      this.geojsonPoint = this.geojson
    }
  }

  /**
   * 移除图层
   */
  removeLayer() {
    if (this.geojsonPoint) {
      this.geojsonPoint.features = []
    }
  }
}
</script>
