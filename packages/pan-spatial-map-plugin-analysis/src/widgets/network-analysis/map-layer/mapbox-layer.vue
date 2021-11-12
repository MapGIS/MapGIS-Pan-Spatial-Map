<template>
  <div>
    <!-- <mp-draw-pro ref="draw" @finished="onDrawFinished" /> -->
    <mapgis-marker v-if="marker" :coordinates="marker.center" anchor="bottom">
      <img slot="marker" :src="marker.img" />
    </mapgis-marker>
  </div>
</template>

<script lang="ts">
import {
  Component,
  Vue,
  Mixins,
  Emit,
  Prop,
  Watch
} from 'vue-property-decorator'
import { LayerType, WidgetMixin } from '@mapgis/web-app-framework'

@Component
export default class MapboxLayer extends Mixins(WidgetMixin) {
  @Prop() dataCoordinateArr: Record<string, any>

  @Prop() dataBarrierArr: Record<string, any>

  @Prop() marker: Record<string, any>

  @Prop() result: Record<string, any>

  @Prop() highResultSource: Record<string, any>

  @Prop() color: Record<string, any>

  pointResultSourceId = 'analysisPointSourceId'

  pointResultLayerId = 'analysisPointLayerId'

  lineResultSourceId = 'analysisLineSourceId'

  lineResultLayerId = 'analysisLineLayerId'

  lineResultClickSourceId = 'analysisClickLineSourceId'

  lineResultClickLayerId = 'analysisClickLineLayerId'

  circleColor = {
    'circle-radius': 6, // 半径
    'circle-color': '#FF9933', // 颜色
    'circle-opacity': 1, // 透明度
    'circle-stroke-color': '#ffffff',
    'circle-stroke-width': 1
  }

  // 点集图层ID
  pointLayerId = 'networkAnalysisCoordinate'

  // 点集资源ID
  pointSourceId = 'network-analysis-coordinate'

  // 障碍物图层ID
  barrierLayerId = 'networkAnalysisBarrier'

  // 障碍物资源ID
  barrierSourceId = 'network-analysis-barrier'

  mounted() {
    this.dataCoordinateArrChange()
    this.dataBarrierArrChange()
    this.resultChange()
    this.highResultSourceChange()
  }

  @Watch('result', { deep: true })
  resultChange() {
    this.clearResultLayer()
    const { layerPoint, layerLine } = this.result
    // 添加点图层
    this.map.addSource(this.pointResultSourceId, {
      type: 'geojson',
      data: layerPoint
    })
    this.map.addLayer({
      id: this.pointResultLayerId,
      type: 'circle',
      source: this.pointResultSourceId,
      paint: {
        'circle-radius': 5, // 半径
        'circle-color': this.circleColor['circle-color'], // 颜色
        'circle-opacity': this.circleColor['circle-opacity'] // 透明度
      }
    })

    // 添加线图层
    this.map.addSource(this.lineResultSourceId, {
      type: 'geojson',
      data: layerLine
    })
    this.map.addLayer({
      id: this.lineResultLayerId,
      type: 'line',
      source: this.lineResultSourceId,
      paint: {
        'line-color': this.color,
        'line-width': 4
      }
    })
  }

  @Watch('highResultSource', { deep: true })
  highResultSourceChange() {
    this.clearHighLayer()
    // 添加高亮图层
    this.map.addSource(this.lineResultClickSourceId, {
      type: 'geojson',
      data: this.highResultSource
    })
    this.map.addLayer({
      id: this.lineResultClickLayerId,
      type: 'line',
      source: this.lineResultClickSourceId,
      paint: {
        'line-color': 'blue',
        'line-width': 4
      }
    })
  }

  @Watch('dataCoordinateArr', { deep: true })
  dataCoordinateArrChange() {
    this.clearDataCoordinateArr()
    // 添加点图层
    this.map.addSource(this.pointSourceId, {
      type: 'geojson',
      data: this.dataCoordinateArr // 一开始的数据是空的,后面请求到了再更新
    })
    this.map.addLayer({
      id: this.pointLayerId,
      type: 'circle',
      source: this.pointSourceId,
      paint: this.circleColor
    })
  }

  @Watch('dataBarrierArr', { deep: true })
  dataBarrierArrChange() {
    this.clearDataBarrierArr()
    // 添加障碍物图层
    this.map.addSource(this.barrierSourceId, {
      type: 'geojson',
      data: this.dataBarrierArr // 一开始的数据是空的,后面请求到了再更新
    })
    this.map.addLayer({
      id: this.barrierLayerId,
      type: 'circle',
      source: this.barrierSourceId,
      paint: {
        ...this.circleColor,
        'circle-color': 'red'
      }
    })
  }

  clearDataBarrierArr() {
    if (this.map.getLayer(this.barrierLayerId)) {
      this.map.removeLayer(this.barrierLayerId)
    }
    if (this.map.getSource(this.barrierSourceId)) {
      this.map.removeSource(this.barrierSourceId)
    }
  }

  clearDataCoordinateArr() {
    if (this.map.getLayer(this.pointLayerId)) {
      this.map.removeLayer(this.pointLayerId)
    }
    if (this.map.getSource(this.pointSourceId)) {
      this.map.removeSource(this.pointSourceId)
    }
  }

  clearResultLayer() {
    if (this.map.getLayer(this.pointResultLayerId)) {
      this.map.removeLayer(this.pointResultLayerId)
      this.map.removeSource(this.pointResultSourceId)
    }
    if (this.map.getLayer(this.lineResultLayerId)) {
      this.map.removeLayer(this.lineResultLayerId)
      this.map.removeSource(this.lineResultSourceId)
    }
  }

  clearHighLayer() {
    if (this.map.getLayer(this.lineResultClickLayerId)) {
      this.map.removeLayer(this.lineResultClickLayerId)
      this.map.removeSource(this.lineResultClickSourceId)
    }
  }

  flyToHigh(val) {
    this.map.panTo(val)
  }

  beforeDestroy() {
    this.clearDataBarrierArr()
    this.clearDataCoordinateArr()
    this.clearResultLayer()
    this.clearHighLayer()
  }
}
</script>

<style scoped></style>
