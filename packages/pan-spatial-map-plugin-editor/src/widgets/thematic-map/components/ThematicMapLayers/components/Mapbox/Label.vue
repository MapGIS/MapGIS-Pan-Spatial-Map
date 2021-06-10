<template>
  <!-- 聚合标注专题图 -->
  <mapgis-mapv-layer :geojson="geojsonPoint" :options="options" />
</template>
<script lang="ts">
import { Mixins, Component } from 'vue-property-decorator'
import RowFlex from '../../../RowFlex'
import BaseMinxin from '../../mixins/base'

@Component
export default class MapboxLabel extends Mixins(BaseMinxin) {
  geojsonPoint = {}

  options = {
    fillStyle: 'rgba(255, 50, 0, 1.0)',
    size: 50 / 3 / 2,
    minSize: 8,
    maxSize: 31,
    globalAlpha: 0.8,
    clusterRadius: 150,
    maxClusterZoom: 18,
    maxZoom: 19,
    minPoints: 5,
    extent: 400,
    label: {
      show: true,
      fillStyle: 'white'
    },
    gradient: {
      '0': 'blue',
      '0.5': 'yellow',
      '1.0': 'rgb(255,0,0)'
    },
    draw: 'cluster'
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
<style lang="less" scoped>
.popup-row {
  min-width: 100px;
}
</style>
