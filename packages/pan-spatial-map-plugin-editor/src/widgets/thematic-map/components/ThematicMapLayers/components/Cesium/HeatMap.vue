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

type HeatMapData = Array<{ x: number; y: number; value: number }>

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
      blur: 0.75, // 模糊值
      radius: 60, // 每个热力点半径大小
      useClustering: true, // 是否聚合
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
   * 创建热力图
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
   * 测试贴膜型
   */
  //   showLayer() {
  //     const drawElement = new this.Cesium.DrawElement(this.webGlobe.viewer)
  //
  //     drawElement.startDrawingExtent({
  //       callback: positions => {
  //         try {
  //           const east = (positions.east * 180) / Math.PI
  //           const west = (positions.west * 180) / Math.PI
  //           const north = (positions.north * 180) / Math.PI
  //           const south = (positions.south * 180) / Math.PI
  //           const bounds = {
  //             west,
  //             east,
  //             north,
  //             south
  //           }
  //           const [pointX, pointY] = this.Cesium.Cartesian3.fromDegreesArray([
  //             west,
  //             north,
  //             west,
  //             south,
  //             east,
  //             south,
  //             east,
  //             north
  //           ])
  //           const boundsHeight = this.Cesium.Cartesian3.distance(pointX, pointY)
  //           const boundsWidth = this.Cesium.Cartesian3.distance(pointX, pointY)
  //           const step = Math.ceil((boundsHeight / 20) * (boundsWidth / 20))
  //           const count = step > 10000 ? 10000 : step
  //           const pointArr = this.Cesium.CommonFunction.getRandomPointByRect(
  //             west,
  //             south,
  //             east,
  //             north,
  //             count
  //           )
  //           const features = pointArr.map(({ x, y }) => ({
  //             type: 'Feature',
  //             properties: {
  //               [this.countField]: (Math.random() * 100).toFixed(2)
  //             },
  //             geometry: {
  //               coordinates: [x, y]
  //             }
  //           }))
  //           const geojson = {
  //             type: 'FeatureCollection',
  //             dataCount: features.length,
  //             features
  //           }
  //           this.removeLayer()
  //           this.createHeatMap(bounds, geojson)
  //         } catch (e) {
  //         } finally {
  //           drawElement.stopDrawing()
  //         }
  //       }
  //     })
  //   }

  /**
   * 展示图层
   */
  showLayer() {
    if (this.geojson) {
      // this.geojsonPoin = this.geojson
      this.getBounds().then(bounds => {
        this.removeLayer()
        this.createHeatMap(bounds, this.geojson)
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
    if (this.heatMapInstance) {
      this.heatMapInstance.removeLayer()
      this.heatMapInstance = null
    }
  }
}
</script>
<style lang="less" scoped></style>
