<template>
  <div class="mp-widget-split-screen" :class="mode" v-if="isOpen">
    <!-- 分屏地图 -->
    <split-screen-map
      v-bind="bindProps"
      :resize="resize"
      :is-full-screen="isFullScreen"
    />
    <!-- 分屏设置 -->
    <split-screen-setting
      v-bind="bindProps"
      @on-setting-panel-toggle="setResize"
      @on-full-screen="setFullScreen"
      @on-screen-count-change="onScreenCountChange"
      @on-layer-change="onLayerChange"
    />
  </div>
</template>

<script lang="ts">
import { Mixins, Component, Watch } from 'vue-property-decorator'
import { WidgetMixin, WidgetState, Layer } from '@mapgis/web-app-framework'
import SplitScreenMap from './components/SplitScreenMap'
import SplitScreenSetting from './components/SplitScreenSetting'

type Mode = 'normal' | 'max'

@Component({
  name: 'MpSplitScreen',
  components: {
    SplitScreenMap,
    SplitScreenSetting
  }
})
export default class MpSplitScreen extends Mixins<Record<string, any>>(
  WidgetMixin
) {
  isOpen = false

  isFullScreen = false

  resize = ''

  mode: Mode = 'max'

  // 分屏数量
  screenNums: number[] = []

  // 屏索引和图层id的数据集合
  layerIds: string[] = []

  // 目录树可见图层
  layers: Layer[] = []

  // 地图排列
  get mapSpan() {
    let span = 24
    switch (this.screenNums.length) {
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
    return span
  }

  get bindProps() {
    const { mapSpan, screenNums, layerIds, layers } = this
    return {
      mapSpan,
      screenNums,
      layerIds,
      layers
    }
  }

  /**
   * 设置是否resize
   */
  setResize() {
    this.resize = `${(Math.random() * 10000).toFixed(0)}`
  }

  /**
   * 设置全屏
   */
  setFullScreen() {
    this.isFullScreen = true
    const timer = setTimeout(() => {
      this.isFullScreen = false
      clearTimeout(timer)
    }, 200)
  }

  /**
   * 初始化地图信息
   */
  setLayers(screenNums?: number) {
    this.screenNums = []
    this.layerIds = []
    for (let i = 0; i < screenNums; i++) {
      this.screenNums.push(i)
      this.layerIds.push(this.layers[i].id)
    }
  }

  /**
   * 初始化图层
   */
  initLayers() {
    this.layers = this.document.defaultMap
      .clone()
      .getFlatLayers()
      .filter(v => v.isVisible)
    const { length } = this.layers
    if (length) {
      this.setLayers(length < 7 ? length : 6)
    }
  }

  /**
   * 弹框开启
   */
  onOpen() {
    this.isOpen = true
    this.setResize()
    this.initLayers()
  }

  /**
   * 弹框关闭
   */
  onClose() {
    this.isOpen = false
    this.screenNums = []
    this.layerIds = []
  }

  /**
   * 面板窗口size变化
   */
  onWindowSize(mode: Mode) {
    if (this.mode !== mode) {
      this.mode = mode
      this.setResize()
    }
  }

  /**
   * 屏数变化
   * @param screenCount<number>
   */
  onScreenCountChange(screenCount: number) {
    this.setLayers(screenCount)
    this.setResize()
  }

  /**
   * 图层选择变化
   * @param layerId
   * @param index
   */
  onLayerChange(layerId: string, index: number) {
    this.layerIds.splice(index, 1, layerId)
  }

  @Watch('document.defaultMap', { deep: true })
  watchDefaultMap() {
    if (this.isOpen) {
      this.initLayers()
    }
  }
}
</script>

<style lang="less" scoped>
.mp-widget-split-screen {
  width: 100%;
  display: flex;
  &.max {
    height: 100%;
  }
  &.normal {
    height: 500px;
  }
}
</style>
