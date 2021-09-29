<template>
  <!-- 聚合标注专题图 -->
  <mapgis-3d-mapv-layer
    :geojson="geojson"
    :options="options"
    :count-field="field"
  />
</template>
<script lang="ts">
import { Mixins, Component } from 'vue-property-decorator'
import BaseMixin from '../../mixins/base'

@Component
export default class CesiumLabel extends Mixins(BaseMixin) {
  get options() {
    return {
      cesium: { postRender: true, postRenderFrame: 0 },
      draw: 'cluster',
      context: '2d',
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
      ...(this.subjectData.style || {})
    }
  }
}
</script>
