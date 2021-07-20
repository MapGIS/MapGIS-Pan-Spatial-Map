<template>
  <!-- 聚合标注专题图 -->
  <mapgis-3d-mapv-layer :geojson="geojsonPoint" :options="labelOptions" />
</template>
<script lang="ts">
import { Mixins, Component } from 'vue-property-decorator'
import BaseMinxin from '../../mixins/base'

@Component
export default class CesiumLabel extends Mixins(BaseMinxin) {
  geojsonPoint = {}

  options = {
    draw: 'cluster',
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
    }
  }

  get labelOptions() {
    return {
      ...this.options,
      ...(this.subjectData.style || {})
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
<style lang="less" scoped></style>
