<template>
  <div class="mp-widget-split-screen">
    <!-- 分屏地图 -->
    <split-screen-map v-bind="bindProps" />
    <!-- 分屏设置 -->
    <split-screen-setting
      v-bind="bindProps"
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
   * 屏数变化
   * @param screenCount<number>
   */
  onScreenCountChange(screenCount: number) {
    this.setLayers(screenCount)
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
  height: 100%;
  display: flex;
}
</style>
