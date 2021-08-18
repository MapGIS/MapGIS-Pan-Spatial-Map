<template>
  <!-- 热力图 -->
  <!-- <mapgis-3d-mapv-layer :geojson="geojsonPoint" :options="heatMapOptions" :count-field="countField" /> -->
  <span />
</template>
<script lang="ts">
import { Mixins, Component } from 'vue-property-decorator'
import {
  Feature,
  LayerType,
  LoadStatus,
  CommonUtil
} from '@mapgis/web-app-framework'
import { DataCatalogManager } from '@mapgis/pan-spatial-map-store'
import BaseMinxin from '../../mixins/base'

@Component({
  inject: ['webGlobe', 'CesiumZondy']
})
export default class CesiumHeatMap extends Mixins(BaseMinxin) {
  // geojsonPoint = {}

  get countField() {
    return this.subjectData.field || 'count'
  }

  // get options() {
  //   return {
  //     cesium: {
  //       postRender: true,
  //       postRenderFrame: 10
  //     },
  //     context: '2d',
  //     draw: 'heatmap',
  //     max: 60, // 最大权重值
  //     size: 13, // 每个热力点半径大小
  //     gradient: {
  //       // 热力图渐变色
  //       '0.25': 'rgb(0,0,255)',
  //       '0.55': 'rgb(0,255,0)',
  //       '0.85': 'yellow',
  //       '1.0': 'rgb(255,0,0)'
  //     },
  //     animation: { // 动画
  //       type: 'time',
  //       stepsRange: {
  //         start: 0,
  //         end: 100
  //       },
  //       trails: 10,
  //       duration: 4
  //     },
  //     ...(this.subjectData.style || {})
  //   }
  // }

  get options() {
    return {
      blur: 0.5, // 模糊值
      radius: 8, // 每个热力点半径大小
      useClustering: true, // 是否聚合
      radiusArray: [2, 5, 10, 20, 40, 80], // 聚合使用的半径值数组
      radiusRange: [0, 20, 100, 200, 300, 500, 1000], // 聚合使用的半径区间
      gradient: {
        // 热力图渐变色
        '0.9': 'red',
        '0.8': 'orange',
        '0.7': 'yellow',
        '0.5': 'blue',
        '0.3': 'green'
      },
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
  getData(): Array<{ x: number; y: number; value: number }> {
    return this.geojson.features.map(
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
  getRange() {
    const values = this.getData().map(({ value }) => value)
    return [Math.min(...values) || 0, Math.max(...values) || 0]
  }

  /**
   * 展示图层
   */
  showLayer() {
    if (this.geojson) {
      // this.geojsonPoin = this.geojson
      this.getBounds().then(bounds => {
        this.removeLayer()
        const { viewer } = this.webGlobe
        const analysisManager = new this.CesiumZondy.Manager.AnalysisManager({
          viewer
        })
        if (!window.heatMapInstance) {
          window.heatMapInstance = analysisManager.createHeatMap(
            bounds,
            ...this.getRange(),
            this.getData(),
            this.options
          )
        }
      })
    }
  }

  /**
   * 移除图层
   */
  removeLayer() {
    // if (this.geojsonPoint) {
    //   this.geojsonPoint.features = []
    // }
    if (window.heatMapInstance) {
      window.heatMapInstance.removeLayer()
      window.heatMapInstance = null
    }
  }
}
</script>
<style lang="less" scoped></style>
