<template>
  <!-- 蜂窝图 -->
  <mapgis-3d-mapv-layer :geojson="geojsonPoint" :options="hexbinOptions" />
</template>
<script lang="ts">
import { Mixins, Component } from 'vue-property-decorator'
import BaseMinxin from '../../mixins/base'

@Component
export default class CesiumHexBin extends Mixins(BaseMinxin) {
  geojsonPoint = {}

  options = {
    cesium: {
      postRender: true,
      postRenderFrame: 0
    },
    context: '2d',
    draw: 'honeycomb',
    max: 100
  }

  get hexbinOptions() {
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
<style lang="less" scoped></style>
