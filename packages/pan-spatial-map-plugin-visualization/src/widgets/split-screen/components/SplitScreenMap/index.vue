<template>
  <div class="split-screen-map">
    <transition name="fade">
      <a-empty
        v-if="!screenNums.length"
        description="请在数据目录中选择需要分屏的数据"
      />
      <a-row v-else :gutter="[5, 5]">
        <a-col
          v-for="s in screenNums"
          :key="s"
          :span="mapSpan"
          :style="mapSpanStyle"
        >
          <map-view
            @on-query="query"
            :queryVisible.sync="queryVisible"
            :query-geometry="queryGeometry"
            :map-view-id="`split-screen-map-${s}`"
            :map-view-layer="mapViewLayer(s)"
            :resize="resize"
          />
        </a-col>
      </a-row>
    </transition>
  </div>
</template>
<script lang="ts">
import { Component, Prop, Mixins } from 'vue-property-decorator'
import { Rectangle } from '@mapgis/webclient-es6-service/common/Rectangle'
import {
  MapMixin,
  Layer,
  Layer3D,
  Objects,
  Rectangle3D
} from '@mapgis/web-app-framework'
import mapViewStateInstance from '../MapView/store/map-view-state'
import MapView from '../MapView'

@Component({
  components: {
    MapView
  }
})
export default class SplitScreenMap extends Mixins(MapMixin) {
  @Prop() readonly resize!: string

  @Prop({ default: 12 }) readonly mapSpan!: number

  @Prop({ default: () => [] }) readonly screenNums!: number[]

  @Prop({ default: () => [] }) readonly layerIds!: string[]

  @Prop({ default: () => [] }) readonly layers!: Layer[]

  queryVisible = false

  queryGeometry = null

  // 每个屏的高度设置
  get mapSpanStyle() {
    const height = this.screenNums.length > 2 ? '50%' : '100%'
    return { height }
  }

  // 获取初始地图视图的复位范围
  get initBound() {
    return mapViewStateInstance.initBound
  }

  // 设置初始地图视图的复位范围
  set initBound(bound: Rectangle) {
    mapViewStateInstance.initBound = bound
  }

  // 每屏的图层
  get mapViewLayer() {
    return s => this.layers.find(({ id }) => this.layerIds[s] === id)
  }

  /**
   * 获取初始经纬度坐标范围
   */
  getInitBound() {
    const layer = this.layers[0]
    const { fullExtent, activeScene = {} } = layer
    if (layer instanceof Layer3D) {
      const sceneController = Objects.SceneController.getInstance(
        this.Cesium,
        this.CesiumZondy,
        this.webGlobe
      )
      if (activeScene.sublayers) {
        return sceneController.layerLocalExtentToGlobelExtent(
          activeScene.sublayers.find(({ visible }) => !!visible) ||
            activeScene.sublayers[0]
        )
      }
    }
    return fullExtent
  }

  /**
   * 每屏的查询结果
   * @param {Rectangle | Rectangle3D} geometry 查询的几何范围
   */
  query(geometry: Rectangle | Rectangle3D) {
    this.queryVisible = true
    this.queryGeometry = geometry
  }

  created() {
    if (this.screenNums.length) {
      this.initBound = this.getInitBound()
    }
  }

  beforeDestroy() {
    this.queryVisible = false
    this.queryGeometry = null
  }
}
</script>
<style lang="less" scoped>
@import './index.less';
</style>
