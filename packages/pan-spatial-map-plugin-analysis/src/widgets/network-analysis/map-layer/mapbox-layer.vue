<template>
  <div>
    <mp-draw-pro ref="draw" @finished="onDrawFinished" />
    <mapgis-marker
      v-if="marker"
      :coordinates="marker.coordinates"
      anchor="bottom"
    >
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

  circleColor = {
    'circle-radius': 5, // 半径
    'circle-color': '#FF9933', // 颜色
    'circle-opacity': 1 // 透明度
  }

  // 点集图层ID
  pointLayerId = 'networkAnalysisCoordinate'

  // 点集资源ID
  pointSourceId = 'network-analysis-coordinate'

  // 障碍物图层ID
  barrierLayerId = 'networkAnalysisBarrier'

  // 障碍物资源ID
  barrierSourceId = 'network-analysis-barrier'

  get drawComponent() {
    return this.$refs.draw
  }

  @Watch('dataCoordinateArr', { immediate: true, deep: true })
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

  @Watch('dataBarrierArr', { immediate: true, deep: true })
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

  // 打开绘制，点击图标激活对应类型的绘制功能
  private onOpenDraw() {
    this.drawComponent && this.drawComponent.openDraw('draw-point')
  }

  private stopDraw() {
    this.drawComponent && this.drawComponent.closeDraw()
  }

  @Emit()
  finishDraw(e) {}

  onDrawFinished(e) {
    this.finishDraw(e)
    window.setTimeout(() => {
      this.onOpenDraw()
    })
  }
}
</script>

<style scoped></style>
