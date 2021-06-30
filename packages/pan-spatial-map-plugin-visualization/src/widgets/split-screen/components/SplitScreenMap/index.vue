<template>
  <div class="split-screen-map">
    <a-empty
      description="请在数据目录中选择需要分屏的数据"
      v-if="!screenNums.length"
    />
    <a-row :gutter="[5, 5]" v-else>
      <a-col
        v-for="s in screenNums"
        :key="s"
        :span="mapSpan"
        :style="mapSpanStyle"
      >
        <map-view
          @on-query="onQuery"
          :queryVisible.sync="queryVisible"
          :query-rect="queryRect"
          :map-view-id="`split-screen-map-${s}`"
          :map-view-layer="mapViewLayer(s)"
          :excludes-tools="excludesTools(s)"
          :resize="resize"
        />
      </a-col>
    </a-row>
  </div>
</template>
<script lang="ts">
import { Component, Prop, Mixins } from 'vue-property-decorator'
import { MapMixin, Layer, Layer3D, Objects } from '@mapgis/web-app-framework'
import mapViewStateInstance, { Rect } from '../MapView/mixins/map-view-state'
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

  queryRect: Rect = {}

  // 每个屏的高度
  get mapSpanStyle() {
    const height = this.screenNums.length > 2 ? '50%' : '100%'
    return { height }
  }

  // 获取初始地图视图的复位范围
  get initBound() {
    return mapViewStateInstance.initBound
  }

  // 设置初始地图视图的复位范围
  set initBound(bound: Rect) {
    mapViewStateInstance.initBound = bound
  }

  get mapViewLayer() {
    return s => this.layers.find(({ id }) => this.layerIds[s] === id)
  }

  get excludesTools() {
    return s => {
      const _layer = this.mapViewLayer(s)
      if (_layer instanceof Layer3D) {
        return 'query'
      }
    }
  }

  /**
   * 获取初始经纬度坐标范围
   */
  getInitBound() {
    const layer = this.layers[0]
    const { fullExtent, scenes } = layer
    if (layer instanceof Layer3D) {
      if (scenes) {
        const controller = Objects.SceneController.getInstance(
          this.Cesium,
          this.CesiumZondy,
          this.webGlobe
        )
        const sceneController = controller.sceneController || controller
        const subLayer = scenes[0].sublayers[0]
        return sceneController.layerLocalExtentToGlobelExtent(subLayer)
      }
    }
    return fullExtent
  }

  /**
   * 某个地图的查询抛出的事件
   * @param result 查询结果
   */
  onQuery(result: Rect) {
    this.queryVisible = true
    this.queryRect = result
  }

  created() {
    if (this.screenNums.length) {
      this.initBound = this.getInitBound()
    }
  }

  beforeDestroyed() {
    this.queryVisible = false
    this.queryRect = {}
  }
}
</script>
<style lang="less" scoped>
@import './index.less';
</style>
