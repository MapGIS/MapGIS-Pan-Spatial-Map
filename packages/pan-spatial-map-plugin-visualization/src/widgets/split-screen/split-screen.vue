<template>
  <row-flex
    class="mp-widget-split-screen"
    align="top"
    justify="space-between"
    :span="[19, 5]"
  >
    <!-- 分屏地图 -->
    <template #label>
      <split-screen-map :mapSpan="mapSpan" :layers="layers" />
    </template>
    <!-- 分屏设置 -->
    <split-screen-setting
      :mapSpan="mapSpan"
      :layers="layers"
      :layersOrigin="layersOrigin"
      @on-screen-count-change="onScreenCountChange"
      @on-layer-change="onLayerChange"
    />
  </row-flex>
</template>

<script lang="ts">
import { Mixins, Component, Watch } from 'vue-property-decorator'
import { WidgetMixin, WidgetState, Layer } from '@mapgis/web-app-framework'
import RowFlex from './components/RowFlex'
import SplitScreenMap from './components/SplitScreenMap'
import SplitScreenSetting from './components/SplitScreenSetting'

@Component({
  name: 'MpSplitScreen',
  components: {
    RowFlex,
    SplitScreenMap,
    SplitScreenSetting
  }
})
export default class MpSplitScreen extends Mixins<{
  [k: string]: any
}>(WidgetMixin) {
  isOpen = false

  // 整合的图层信息列表数据
  layers: Layer[] = []

  // 整合的图层信息原始列表数据
  layersOrigin: Layer[] = []

  // 可见图层
  get flatLayers() {
    return this.document.defaultMap.getFlatLayers().filter(v => v.isVisible)
  }

  // 地图排列
  get mapSpan() {
    const { length } = this.layers
    const height = length > 2 ? '50%' : '100%'
    let span = 24
    switch (length) {
      case 2:
      case 3:
      case 4:
        span = 12
        break
      case 5:
      case 6:
        span = 8
        break
      default:
        break
    }
    return {
      span,
      height
    }
  }

  /**
   * 获取深拷贝数据
   * @param data<array>
   */
  getDeepCloneData(data) {
    return JSON.parse(JSON.stringify(data))
  }

  /**
   * 初始化地图信息
   */
  setLayers() {
    const max = this.flatLayers.length < 7 ? this.flatLayers.length : 6
    this.layers = new Array(max).fill().map((v, i) => this.flatLayers[i])
    this.layersOrigin = this.getDeepCloneData(this.layers)
  }

  /**
   * 弹框开启
   */
  onOpen() {
    this.isOpen = true
    this.setLayers()
  }

  /**
   * 弹框关闭
   */
  onClose() {
    this.isOpen = false
  }

  /**
   * 屏数变化
   * @param screenCount<number>
   */
  onScreenCountChange(screenCount: number) {
    const cloneData = this.getDeepCloneData(this.layersOrigin)
    this.layers = cloneData.slice(0, screenCount)
  }

  /**
   * 图层选择变化
   * @param oldLayerIndex<number>
   * @param newLayer<object>
   */
  onLayerChange(oldLayerIndex, newLayer) {
    this.layers.splice(oldLayerIndex, 1, this.getDeepCloneData(newLayer))
    // this.layers = [...this.layers]
    this.$$forceUpdate()
  }

  /**
   * 监听: 图层列表变化
   */
  @Watch('flatLayers', { deep: true })
  watchFlatLayers(nV) {
    if (this.isOpen) {
      this.setLayers()
    }
  }
}
</script>

<style lang="less">
.mp-widget-split-screen {
  width: 100%;
  height: 100%;
  > .ant-col {
    height: 100%;
  }
}
</style>
