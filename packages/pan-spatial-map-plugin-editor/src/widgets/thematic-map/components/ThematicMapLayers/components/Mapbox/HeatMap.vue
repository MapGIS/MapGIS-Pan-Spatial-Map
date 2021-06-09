<template>
  <!-- 热力图 -->
  <mapgis-mapv-layer :geojson="geojsonPoint" :options="options" />
</template>
<script lang="ts">
import { Mixins, Component } from 'vue-property-decorator'
import { MapMixin } from '@mapgis/web-app-framework'
import {
  queryFeaturesInstance,
  FeatureIGS
} from '@mapgis/pan-spatial-map-store'
import BaseMinxin from '../../mixins/base'

@Component
export default class MapboxHeatMap extends Mixins(BaseMinxin, MapMixin) {
  geojsonPoint = {}

  options = {
    context: '2d',
    draw: 'heatmap',
    size: 13,
    max: 60,
    gradient: {
      0.25: 'rgb(218,21,21)',
      0.55: 'rgb(206,104,32)',
      0.85: 'rgb(206,177,32)',
      1.0: 'rgb(222,192,45)'
    },
    animation: {
      type: 'time',
      stepsRange: {
        start: 0,
        end: 100
      },
      trails: 10,
      duration: 4
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
