<template>
  <!-- 蜂窝图 -->
  <mapgis-mapv-layer :geojson="geojsonPoint" :options="hexBinOptions" />
</template>
<script lang="ts">
import { Mixins, Component } from 'vue-property-decorator'
import BaseMinxin from '../../mixins/base'

@Component
export default class MapboxHexBin extends Mixins(BaseMinxin) {
  geojsonPoint = {}

  options = {
    context: '2d',
    draw: 'honeycomb',
    max: 100
  }

  get hexBinOptions() {
    return {
      ...this.options,
      ...(this.subDataConfig.style || {})
    }
  }

  /**
   * 展示图层
   */
  showLayer() {
    if (this.geojson) {
      this.geojsonPoint = this.addCountToGeoJSON(this.geojson)
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
