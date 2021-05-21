<template>
  <!-- 蜂窝图 -->
  <cesium-mapv-layer
    :geojson="geojsonPoint"
    :options="options"
    v-show="geojsonPoint"
  />
</template>
<script lang="ts">
import { Mixins, Component } from 'vue-property-decorator'
import { CesiumMapvLayer } from '@mapgis/webclient-vue-cesium'
import BaseMinxin from '../../mixins/base'

@Component
export default class CesiumHexBin extends Mixins(BaseMinxin) {
  geojsonPoint = null

  options = {
    context: '2d',
    draw: 'honeycomb',
    max: '10',
    size: '20',
    label: {
      show: true,
      fillStyle: 'white',
      shadowColor: 'yellow',
      font: '10px Arial',
      shadowBlur: '10'
    },
    gradient: {
      0: 'rgba(49, 54, 149, 0)',
      0.2: 'rgba(69,117,180, 0.7)',
      0.3: 'rgba(116,173,209, 0.7)',
      0.4: 'rgba(171,217,233, 0.7)',
      0.5: 'rgba(224,243,248, 0.7)',
      0.6: 'rgba(254,224,144,0.7)',
      0.7: 'rgba(253,174,97,0.7)',
      0.8: 'rgba(244,109,67,0.8)',
      0.9: 'rgba(215,48,39,0.8)',
      0.95: 'rgba(165, 0, 38,0.8)'
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
<style lang="less" scoped></style>
