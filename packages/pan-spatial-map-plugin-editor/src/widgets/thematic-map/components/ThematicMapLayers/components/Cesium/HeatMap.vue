<template>
  <!-- 热力图 -->
  <mapgis-3d-mapv-layer
    :geojson="mapvData"
    :options="options"
    :count-field="countField"
    v-if="isMapv"
  />
</template>
<script lang="ts">
import { Mixins, Component } from 'vue-property-decorator'
import {
  Feature,
  LayerType,
  LoadStatus,
  CommonUtil
} from '@mapgis/web-app-framework'
import { DataCatalogManager } from '@mapgis/pan-spatial-map-common'
import BaseMinxin from '../../mixins/base'

type HeatMapData = Array<{ x: number; y: number; value: number }>

@Component({
  inject: ['webGlobe', 'CesiumZondy']
})
export default class CesiumHeatMap extends Mixins(BaseMinxin) {
  private mapvData: Feature.FeatureGeoJSON = {}

  // 是否是mapv热力图
  get isMapv() {
    return this.subjectData.style?.type === 'MAPV'
  }

  // 统计属性
  get countField() {
    return this.subjectData.field || 'count'
  }

  // 热力图配置项
  get options() {
    return {
      minOpacity: 0,
      maxOpacity: 1,
      gradient: {
        '0.25': 'rgb(0,0,255)',
        '0.55': 'rgb(0,255,0)',
        '0.85': 'rgb(241,241,15)',
        '1.0': 'rgb(255,0,0)'
      },
      ...(this.isMapv
        ? {
            cesium: {
              postRender: true,
              postRenderFrame: 10
            },
            context: '2d',
            draw: 'heatmap',
            max: 100, // 最大权重值
            size: 20 // 每个热力点半径大小
          }
        : {
            spacing: 1, // 边界周围的额外空间
            alpha: 1, // 透明度
            blur: 0.85, // 模糊值
            radius: 20, // 每个热力点半径大小
            useClustering: true // 是否聚合
          }),
      ...(this.subjectData.style || {})
    }
  }

  /**
   * 获取范围
   * Point | Polygon
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
   * 获取数据
   */
  getData(geojson: Feature.FeatureGeoJSON): HeatMapData {
    return geojson.features.map(
      ({ geometry: { coordinates }, properties }: Feature.GFeature) => {
        const countValue = properties[this.countField]
        const value = CommonUtil.isDef(countValue) ? countValue : 1
        const [x, y] = Array.isArray(coordinates[0])
          ? coordinates[0][0]
          : coordinates
        return {
          x,
          y,
          value
        }
      }
    )
  }

  /**
   * 获取数据范围min->max
   */
  getRange(data: HeatMapData) {
    const values = data.map(({ value }) => value)
    return [Math.min(...values) || 0, Math.max(...values) || 0]
  }

  /**
   * 创建原生热力图
   * @param 专题图层范围
   * @param geojson数据
   */
  createHeatMap(bounds, geojson) {
    const { viewer } = this.webGlobe
    const analysisManager = new this.CesiumZondy.Manager.AnalysisManager({
      viewer
    })
    if (!this.heatMapInstance) {
      const data = this.getData(geojson)
      const range = this.getRange(data)
      this.heatMapInstance = analysisManager.createHeatMap(
        bounds,
        ...range,
        data,
        this.options
      )
    }
  }

  /**
   * 移除原生热力图
   */
  removeHeatMap() {
    if (this.heatMapInstance) {
      this.heatMapInstance.removeLayer()
      this.heatMapInstance = null
    }
  }

  /**
   * 展示图层
   */
  showLayer() {
    if (this.geojson) {
      if (this.isMapv) {
        this.mapvData = { ...this.geojson }
      } else {
        this.removeHeatMap()
        this.getBounds().then(bounds =>
          this.createHeatMap(bounds, this.geojson)
        )
      }
    }
  }

  /**
   * 移除图层
   */
  removeLayer() {
    if (!this.isMapv) {
      this.removeHeatMap()
    } else if (this.mapvData) {
      this.mapvData = {}
    }
  }
}
</script>
<style lang="less" scoped></style>
