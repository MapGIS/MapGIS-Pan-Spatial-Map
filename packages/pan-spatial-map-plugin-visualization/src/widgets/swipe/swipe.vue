<template>
  <div class="mp-widget-swipe">
    <div class="swipe-container">
      <div class="swipe-content">
        <!-- 卷帘组件 -->
        <mapgis-compare
          :orientation="direction"
          v-if="aboveLayer && belowLayer"
        >
          <mp-web-map-pro
            slot="beforeMap"
            :document="aboveLayerDocument"
            :map-style="mapStyle"
          />
          <mp-web-map-pro
            slot="afterMap"
            :document="belowLayerDocument"
            :map-style="mapStyle"
          />
        </mapgis-compare>
        <!-- 空数据提示 -->
        <div class="swipe-no-data-tip" v-else>
          <a-empty description="卷帘分析功能至少需要选择2个图层" />
        </div>
      </div>
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
          <a-row>
            <label>{{ directionLayerTitle.aboveTitle }}图层</label>
          </a-row>
          <a-row>
            <a-select
              class="swipe-select"
              :value="aboveLayer"
              @change="getLayers($event, 'aboveLayer', 'belowLayers')"
            >
              <a-select-option
                v-for="item in aboveLayers"
                :value="item.id"
                :key="item.id"
                >{{ item.title }}
              </a-select-option>
            </a-select>
          </a-row>
          <!-- 下图层 -->
          <a-row>
            <label> {{ directionLayerTitle.belowTitle }}图层</label>
          </a-row>
          <a-row>
            <a-select
              class="swipe-select"
              :value="belowLayer"
              @change="getLayers($event, 'belowLayer', 'aboveLayers')"
            >
              <a-select-option
                v-for="item in belowLayers"
                :value="item.id"
                :key="item.id"
                >{{ item.title }}
              </a-select-option>
            </a-select>
          </a-row>
          <a-row>
            <!-- 方向 -->
            <a-radio-group
              class="swipe-radio-group"
              :value="direction"
              @change="onDirectionChange"
            >
              <a-radio value="vertical">
                垂直
              </a-radio>
              <a-radio value="horizontal" v-show="is2DMapMode">
                水平
              </a-radio>
            </a-radio-group>
          </a-row>
        </a-space>
      </a-drawer>
    </div>
  </div>
</template>

<script lang="ts">
import { Mixins, Component, Watch } from 'vue-property-decorator'
import {
  Document,
  MpMapboxView,
  WidgetMixin,
  AppMixin,
  Layer
} from '@mapgis/web-app-framework'

type Direction = 'vertical' | 'horizontal'

@Component({
  name: 'MpSwipe',
  components: {
    MpMapboxView
  }
})
export default class MpSwipe extends Mixins<Record<string, any>>(
  WidgetMixin,
  AppMixin
) {
  // 卷帘功能弹框开关
  isOpen = false

  // 选中的上级图层
  aboveLayer = ''

  // 选中的下级图层
  belowLayer = ''

  // 上级图层列表
  aboveLayers: Layer[] = []

  // 下级图层列表
  belowLayers: Layer[] = []

  // 上级地图Document
  aboveLayerDocument = new Document()

  // 下级地图Document
  belowLayerDocument = new Document()

  // 目录树勾选的图层
  layers: Layer[] = []

  // 卷帘方向
  direction: Direction = 'vertical'

  // 图层样式
  mapStyle: any = {
    version: 8,
    sources: {},
    layers: [],
    glyphs:
      'http://develop.smaryun.com:6163/igs/rest/mrms/vtiles/fonts/{fontstack}/{range}.pbf'
  }

  settingPanelVisible = true

  /**
   * 卷帘方向变化，同步更改图层选择框的标题
   */
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
   * 监听: defaultMap变化
   */
  @Watch('document.defaultMap', { deep: true })
  watchDefaultMap() {
    if (this.isOpen) {
      this.initLayers()
    }
  }

  /**
   * 卷帘弹框打开操作
   */
  onOpen() {
    this.isOpen = true
    this.initLayers()
  }

  /**
   * 卷帘弹框关闭操作
   */
  onClose() {
    this.isOpen = false
    this.direction = 'vertical'
  }

  /**
   * 卷帘方向变化
   * @param e<object>
   */
  onDirectionChange(e) {
    this.direction = e.target.value
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
  initLayers() {
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
    this.getLayers(_fId, 'aboveLayer', 'belowLayers')
    this.getLayers(_sId, 'belowLayer', 'aboveLayers')
  }

  /**
   * 上下图层选择变化时获取对应的图层逻辑
   * @param value<string> 切换的值
   * @param valuekey<string>
   * @param layersKey<string>
   */
  getLayers(
    value: string,
    valuekey: 'aboveLayer' | 'belowLayer',
    layersKey: 'aboveLayers' | 'belowLayers'
  ) {
    this[valuekey] = value
    this[layersKey] = [...this.layers.filter(({ id }) => value && id !== value)]
    const currenLayer = this.layers.find(v => value && v.id === value)
    const _defaultMap = this[`${valuekey}Document`].defaultMap
    if (currenLayer) {
      _defaultMap.removeAll()
      _defaultMap.add(currenLayer)
    } else {
      _defaultMap.removeAll()
    }
  }
}
</script>

<style lang="less" scoped>
@import './swipe.less';
</style>

<style lang="less">
.mp-widget-swipe {
  .mapboxgl-compare {
    user-select: none;
    border: 1px solid @primary-color;
    background-color: @border-color;
    .compare-swiper-vertical,
    .compare-swiper-horizontal {
      background-color: @primary-color;
    }
  }
  .ant-drawer-right.ant-drawer-open .ant-drawer-content-wrapper {
    box-shadow: none;
    border-left: 1px solid @primary-color;
  }
}
</style>
