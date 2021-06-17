<template>
  <div class="mp-widget-swipe" v-if="isOpen">
    <mapbox-compare v-show="is2DMapMode" />
    <cesium-compare v-show="!is2DMapMode" />
  </div>
</template>

<script lang="ts">
import {
  Mixins,
  Component,
  Watch,
  ProvideReactive
} from 'vue-property-decorator'
import { WidgetMixin, AppMixin } from '@mapgis/web-app-framework'
import MapboxCompare from './components/MapboxCompare'
import CesiumCompare from './components/CesiumCompare'

type Direction = 'vertical' | 'horizontal'

@Component({
  name: 'MpSwipe',
  components: {
    MapboxCompare,
    CesiumCompare
  }
})
export default class MpSwipe extends Mixins(WidgetMixin, AppMixin) {
  @ProvideReactive()
  get swipe() {
    return this
  }

  // 卷帘功能弹框开关
  isOpen = false

  // 卷帘方向
  direction: Direction = 'vertical'

  // 上级(左侧)图层
  aboveLayer: Layer | object = {}

  // 下级(右侧)图层
  belowLayer: Layer | object = {}

  // 目录树勾选的图层
  layers: Layer[] = []

  /**
   * 重置图层信息
   */
  resetLayer() {
    this.layers = []
    this.aboveLayer = {}
    this.belowLayer = {}
  }

  /**
   * 图层初始化和重置操作
   */
  initLayer() {
    const _layers = this.document.defaultMap
      .clone()
      .getFlatLayers()
      .filter(v => v.isVisible)
    if (_layers && _layers.length > 1) {
      const [bLayer, aLayer] = _layers
      if (this.aboveLayer.id !== aLayer.id) {
        this.aboveLayer = aLayer
      }
      if (this.belowLayer.id !== bLayer.id) {
        this.belowLayer = bLayer
      }
      this.layers = _layers
    } else {
      this.resetLayer()
    }
  }

  /**
   * 获取对应的图层
   */
  getLayer(layerId: string) {
    return this.layers.find(({ id }: Layer) => id === layerId) || {}
  }

  /**
   * 上层(左侧)图层变化
   */
  onAboveChange(layerId: string) {
    this.aboveLayer = this.getLayer(layerId)
  }

  /**
   * 下层(右侧)图层变化
   */
  onBelowChange(layerId: string) {
    this.belowLayer = this.getLayer(layerId)
  }

  /**
   * 卷帘方向变化
   */
  onDirectChange(direct: Direction) {
    this.direction = direct
  }

  /**
   * 卷帘弹框打开操作
   */
  onOpen() {
    this.isOpen = true
    this.initLayer()
  }

  /**
   * 卷帘弹框关闭操作
   */
  onClose() {
    this.isOpen = false
    this.resetLayer()
  }

  /**
   * 监听: mapRender变化
   */
  @Watch('mapRender', { immediate: true })
  mapRenderChange() {
    this.$set(
      this.widget.manifest.properties,
      'windowSize',
      this.is2DMapMode ? 'max' : 'normal'
    )
  }

  /**
   * 监听: defaultMap变化
   */
  @Watch('document.defaultMap', { deep: true })
  watchDefaultMap() {
    if (this.isOpen) {
      this.initLayer()
    }
  }
}
</script>

<style lang="less" scoped>
@import './swipe.less';
</style>
