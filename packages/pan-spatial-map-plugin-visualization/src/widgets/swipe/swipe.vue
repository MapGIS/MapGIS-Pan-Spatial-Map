<template>
  <div class="mp-widget-swipe">
    <div class="swipe-container">
      <mapbox-compare
        :aboveLayer="aboveLayer"
        :belowLayer="belowLayer"
        :direction="direction"
      />
      <a-drawer
        title="设置"
        placement="right"
        :closable="false"
        :visible="settingPanelVisible"
        :get-container="false"
        :wrap-style="{ position: 'absolute' }"
        :header-style="{ display: 'none' }"
        :body-style="{ display: 'flex', padding: '12px' }"
        :mask="false"
      >
        <div
          class="swipe-setting-handle"
          slot="handle"
          @click="onToggleSettingPanel"
        >
          <a-icon :type="settingPanelVisible ? 'right' : 'left'" />
        </div>
        <a-space
          class="swipe-setting-panel"
          direction="vertical"
          style="flex: 1;"
        >
          <!-- 上图层 -->
          <row :title="directionLayerTitle.aboveTitle">
            <a-select :value="aboveLayer.id" @change="onAboveChange">
              <a-select-option
                v-for="p in aboveLayers"
                :key="p.id"
                :value="p.id"
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
      </a-drawer>
    </div>
  </div>
</template>

<script lang="ts">
import { Mixins, Component, Watch } from 'vue-property-decorator'
import { WidgetMixin, AppMixin, Layer } from '@mapgis/web-app-framework'
import Row from './components/Row'
import MapboxCompare, { Direction } from './components/MapboxCompare'
import CesiumCompare from './components/CesiumCompare'

@Component({
  name: 'MpSwipe',
  components: {
    Row,
    MapboxCompare,
    CesiumCompare
  }
})
export default class MpSwipe extends Mixins(WidgetMixin, AppMixin) {
  // 卷帘功能弹框开关
  isOpen = false

  // 目录树勾选的图层
  layers: Layer[] = []

  // 上级(左侧)图层
  aboveLayer: Layer | object = {}

  // 下级(右侧)图层
  belowLayer: Layer | object = {}

  // 上级(左侧)图层列表
  aboveLayers: Layer[] = []

  // 下级(右侧)图层列表
  belowLayers: Layer[] = []

  // 卷帘方向
  direction: Direction = 'vertical'

  // 弹框开关
  settingPanelVisible = true

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
   * 上下图层选择变化时获取对应的图层逻辑
   * @param value 切换的值
   * @param layerkey 'aboveLayer' | 'belowLayer'
   * @param layersKey 'aboveLayers' | 'belowLayers'
   */
  getLayers(
    value: string,
    layerkey: 'aboveLayer' | 'belowLayer',
    layersKey: 'aboveLayers' | 'belowLayers'
  ) {
    let layer: Layer | object = {}
    let layers: Layer[] = []
    if (value) {
      layer = this.layers.find(({ id }: Layer) => id === value)
      layers = this.layers.filter(({ id }: Layer) => id !== value)
    }
    this[layerkey] = layer
    this[layersKey] = layers
  }

  /**
   * 卷帘方向变化
   */
  onDirectionChange(e) {
    this.direction = e.target.value
  }

  /**
   * 上层(左侧)图层变化
   */
  onAboveChange(value: string) {
    this.getLayers(value, 'aboveLayer', 'belowLayers')
  }

  /**
   * 下层(右侧)图层变化
   */
  onBelowChange(value: string) {
    this.getLayers(value, 'belowLayer', 'aboveLayers')
  }

  onCloseSettingPanel() {
    this.settingPanelVisible = false
  }

  onToggleSettingPanel() {
    this.settingPanelVisible = !this.settingPanelVisible
  }

  /**
   * 初始化图层列表
   */
  initMap() {
    let _fId = ''
    let _sId = ''
    const _layers: Layer[] = this.document.defaultMap
      .clone()
      .getFlatLayers()
      .filter(v => v.isVisible)
    if (_layers && _layers.length > 1) {
      _fId = _layers[0].id
      _sId = _layers[1].id
    }
    this.layers = _layers
    this.onAboveChange(_fId)
    this.onBelowChange(_sId)
  }

  /**
   * 卷帘弹框打开操作
   */
  onOpen() {
    this.isOpen = true
    this.initMap()
  }

  /**
   * 卷帘弹框关闭操作
   */
  onClose() {
    this.isOpen = false
  }

  /**
   * 监听: defaultMap变化
   */
  @Watch('document.defaultMap', { deep: true })
  watchDefaultMap() {
    if (this.isOpen) {
      this.initMap()
    }
  }
}
</script>

<style lang="less" scoped>
@import './swipe.less';
</style>
