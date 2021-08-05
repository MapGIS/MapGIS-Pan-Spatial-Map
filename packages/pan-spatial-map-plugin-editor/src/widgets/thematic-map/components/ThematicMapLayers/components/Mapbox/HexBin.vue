<template>
  <!-- 蜂窝图 -->
  <mapgis-mapv-layer
    :geojson="geojsonPoint"
    :options="options"
    :count-field="countField"
  />
</template>
<script lang="ts">
import { Mixins, Component } from 'vue-property-decorator'
import BaseMinxin from '../../mixins/base'

@Component
export default class MapboxHexBin extends Mixins(BaseMinxin) {
  geojsonPoint = {}

  get countField() {
    return 'count'
  }

  get options() {
    return {
      context: '2d',
      draw: 'honeycomb',
      max: 100,
      ...(this.subjectData.style || {})
    }
  }

  get countField() {
    return 'count'
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
