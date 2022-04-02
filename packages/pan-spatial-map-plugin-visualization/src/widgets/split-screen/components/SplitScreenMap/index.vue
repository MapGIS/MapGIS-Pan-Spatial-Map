<template>
  <div class="split-screen-map">
    <transition name="fade">
      <a-empty
        v-if="!layerIds.length"
        description="请在数据目录中选择需要分屏的数据"
      />
      <a-row v-else :gutter="[5, 5]">
        <a-col
          v-for="(id, i) in layerIds"
          :key="`screen${i}-${id}`"
          :span="mapSpan"
          :style="mapSpanStyle"
        >
          <map-view
            :is-all3d="isAll3d"
            :init-bound="initBound"
            :map-view-id="`split-screen-map-${i}`"
            :map-view-layer="mapViewLayer(id)"
            :resize="resize"
          />
        </a-col>
      </a-row>
    </transition>
  </div>
</template>
<script lang="ts">
import { Component, Prop, Mixins, Watch } from 'vue-property-decorator'
import { Rectangle } from '@mapgis/webclient-es6-service/common/Rectangle'
import {
  MapMixin,
  Layer,
  Layer3D,
  Objects,
  Rectangle3D
} from '@mapgis/web-app-framework'
import MapView from '../MapView'

@Component({
  components: {
    MapView
  }
})
export default class SplitScreenMap extends Mixins(MapMixin) {
  @Prop() readonly resize!: string

  @Prop({ default: 12 }) readonly mapSpan!: number

  @Prop({ default: () => [] }) readonly layerIds!: string[]

  @Prop({ default: () => [] }) readonly layers!: Layer[]

  @Watch('layerIds')
  layerIdsChanged(nIds, oIds = []) {
    if (nIds.length && nIds[0] !== oIds[0]) {
      this.setInitBound()
    }
  }

  // 获取初始地图视图的复位范围
  initBound = new Rectangle(0.0, 0.0, 0.0, 0.0)

  // 每个屏的高度设置
  get mapSpanStyle() {
    const height = this.layerIds.length > 2 ? '50%' : '100%'
    return { height }
  }

  // 每屏的图层
  get mapViewLayer() {
    return layerId => this.layers.find(({ id }) => layerId === id)
  }

  // 是否全部是三维
  get isAll3d() {
    return this.layers.every(layer => layer instanceof Layer3D)
  }

  /**
   * 获取初始经纬度坐标范围
   */
  setInitBound() {
    const layer = this.layers[0]
    const { fullExtent, activeScene = {} } = layer
    let _initBound = fullExtent
    if (layer instanceof Layer3D) {
      const sceneController = Objects.SceneController.getInstance(
        this.Cesium,
        this.vueCesium,
        this.viewer
      )
      if (activeScene.sublayers) {
        _initBound = sceneController.layerExtentToGlobelExtent(
          activeScene.sublayers.find(({ visible }) => !!visible) ||
            activeScene.sublayers[0],
          activeScene.sceneMode
        )
      }
    }
    this.initBound = _initBound
  }

  created() {
    if (this.layerIds.length) {
      this.setInitBound()
    }
  }
}
</script>
<style lang="less" scoped>
@import './index.less';
</style>
