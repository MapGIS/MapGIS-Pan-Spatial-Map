<template>
  <mapgis-3d-mapv-heater-layer
    v-if="isMapv"
    :geojson="selfGeojson"
    :options="options"
    :field="field"
  />
  <mapgis-3d-cesium-heater-layer
    v-else-if="bound"
    :geojson="selfGeojson"
    :options="options"
    :field="field"
    :bound="bound"
  />
</template>
<script lang="ts">
import { Mixins, Component } from 'vue-property-decorator'
import { LayerType, LoadStatus } from '@mapgis/web-app-framework'
import { DataCatalogManager } from '@mapgis/pan-spatial-map-common'
import BaseMixin from '../../mixins/base'
import zondyGeojson from '../../mock/zondyGeojson.json'

enum typeEnum {
  MAPV = 'MAPV',
  CESIUM = 'CESIUM'
}

@Component
export default class CesiumHeatMap extends Mixins(BaseMixin) {
  private bound = null

  private selfGeojson = null

  // 是否mapv图层
  get isMapv() {
    return this.subjectData.style?.type === typeEnum.MAPV
  }

  // 热力图配置项
  get options() {
    return this.subjectData.style
  }

  /**
   * 获取图层范围
   */
  async getBounds() {
    const { ip, port, gdbp, docName } = this.subjectData
    const layer = DataCatalogManager.generateLayerByConfig({
      ip,
      port,
      gdbps: gdbp,
      serverName: docName,
      serverType: docName ? LayerType.IGSMapImage : LayerType.IGSVector
    })
    const _layer =
      layer?.loadStatus === LoadStatus.notLoaded ? await layer.load() : layer
    const { xmin, xmax, ymax, ymin } = _layer.fullExtent
    return {
      west: xmin,
      east: xmax,
      north: ymax,
      south: ymin
    }
  }

  /**
   * 展示图层
   */
  showLayer() {
    // fixme 测试专用开始------------
    if (!this.field || this.field === 'count') {
      this.selfGeojson = zondyGeojson
      this.bound = {
        east: 114.40417819778051,
        north: 30.469278757013154,
        south: 30.465101046619523,
        west: 114.39874205680401
      }
      return
    }
    // 测试专用结束---------------
    this.selfGeojson = this.geojson
    if (!this.isMapv) {
      this.getBounds().then(bound => (this.bound = bound))
    }
  }
}
</script>
