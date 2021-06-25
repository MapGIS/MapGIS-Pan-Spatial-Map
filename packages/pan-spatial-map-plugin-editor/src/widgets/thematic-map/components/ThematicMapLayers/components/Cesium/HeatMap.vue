<template>
  <!-- 热力图 -->
  <mapgis-3d-mapv-layer :geojson="geojsonPoint" :options="options" />
</template>
<script lang="ts">
import { Mixins, Component } from 'vue-property-decorator'
import BaseMinxin from '../../mixins/base'

@Component
export default class CesiumHeatMap extends Mixins(BaseMinxin) {
  geojsonPoint = {}

  options = {
    cesium: {
      postRender: true,
      postRenderFrame: 10
    },
    context: '2d',
    size: 30,
    max: 5,
    draw: 'heatmap',
    gradient: {
      0.25: 'rgb(255,0,255)',
      0.55: 'rgb(255,255,0)',
      0.85: 'yellow',
      1.0: 'rgb(255,0,0)'
    } /* ,
    animation: {
      type: 'time',
      stepsRange: {
        start: 0,
        end: 100
      },
      trails: 10,
      duration: 4
    } */
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
