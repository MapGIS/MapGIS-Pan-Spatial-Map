<template>
  <a-space class="swipe-setting" direction="vertical" style="flex: 1;">
    <!-- 上图层 -->
    <row :title="directionLayerTitle.aboveTitle">
      <a-select :value="aboveLayer.id" @change="onAboveChange">
        <a-select-option
          v-for="p in aboveLayers"
          :key="p.id"
          :value="p.id"
          :title="p.title"
          >{{ p.title }}</a-select-option
        ></a-select
      >
    </row>
    <!-- 下图层 -->
    <row :title="directionLayerTitle.belowTitle">
      <a-select :value="belowLayer.id" @change="onBelowChange">
        <a-select-option
          v-for="p in belowLayers"
          :key="p.id"
          :value="p.id"
          :title="p.title"
          >{{ p.title }}</a-select-option
        >
      </a-select>
    </row>
    <!-- 方向 -->
    <a-radio-group :value="direction" @change="onDirectionChange">
      <a-radio value="vertical"> 垂直 </a-radio>
      <a-radio value="horizontal" v-show="is2DMapMode"> 水平 </a-radio>
    </a-radio-group>
  </a-space>
</template>
<script lang="ts">
import { Mixins, Component, Prop, Watch } from 'vue-property-decorator'
import { AppMixin, Layer } from '@mapgis/web-app-framework'
import Row from './Row'

export type LayerDirect = 'above' | 'below'

export type Direction = 'vertical' | 'horizontal'

@Component({
  components: {
    Row
  }
})
export default class SwipeSetting extends Mixins(AppMixin) {
  @Prop() readonly isOpen!: boolean

  @Watch('isOpen')
  watchIsOpen(nV) {
    this.initMap(nV)
  }

  /**
   * 监听: defaultMap变化
   */
  @Watch('document.defaultMap', { deep: true })
  watchDefaultMap() {
    this.initMap(this.isOpen)
  }

  // 上级(左侧)图层
  aboveLayer: Layer | object = {}

  // 下级(右侧)图层
  belowLayer: Layer | object = {}

  // 上级(左侧)图层列表
  aboveLayers: Layer[] = []

  // 下级(右侧)图层列表
  belowLayers: Layer[] = []

  // 目录树勾选的图层
  layers: Layer[] = []

  // 卷帘方向
  direction: Direction = 'vertical'

  // 卷帘方向变化，同步更改图层选择框的标题
  get directionLayerTitle(): {
    aboveTitle: string
    belowTitle: string
  } {
    let aboveTitle = '左侧'
    let belowTitle = '右侧'
    if (this.direction !== 'vertical') {
      aboveTitle = '上级'
      belowTitle = '下级'
    }
    return {
      aboveTitle,
      belowTitle
    }
  }

  /**
   * 初始化图层列表
   */
  initMap(isOpen = false) {
    let _fId = ''
    let _sId = ''
    if (isOpen) {
      const _layers: Layer[] = this.document.defaultMap
        .clone()
        .getFlatLayers()
        .filter(v => v.isVisible)
      if (_layers && _layers.length > 1) {
        _fId = _layers[0].id
        _sId = _layers[1].id
      }
    }
    this.layers = _layers
    this.onAboveChange(_fId)
    this.onBelowChange(_sId)
  }

  /**
   * 上下图层选择变化时获取对应的图层逻辑
   * @param value 切换的值
   * @param layerkey
   * @param layersKey
   */
  getLayers(value: string, layerKey: LayerDirect, layersKey: LayerDirect) {
    const layer = this.layers.find(({ id }: Layer) => id === value) || {}
    const layers = this.layers.filter(({ id }: Layer) => id !== value)
    this[`${layerKey}Layer`] = layer
    this[`${layersKey}Layers`] = layers
    this.$emit(`on-${layerKey}-change`, layer, layerKey)
  }

  /**
   * 卷帘方向变化
   */
  onDirectionChange(e) {
    this.direction = e.target.value
    this.$emit('on-direct-change', this.direction)
  }

  /**
   * 上层(左侧)图层变化
   */
  onAboveChange(value: string) {
    this.getLayers(value, 'above', 'below')
  }

  /**
   * 下层(右侧)图层变化
   */
  onBelowChange(value: string) {
    this.getLayers(value, 'below', 'above')
  }
}
</script>
<style lang="less" scoped>
.swipe-setting {
  width: 100%;
  height: 100%;
}
</style>
