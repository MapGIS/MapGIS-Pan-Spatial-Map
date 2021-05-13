<template>
  <div class="mp-widget-swipe">
    <a-row type="flex" class="swipe-row">
      <a-col span="18" class="swipe-col1">
        <!-- 卷帘组件 -->
        <mapgis-compare
          :orientation="direction"
          v-if="aboveLayer && belowLayer"
        >
          <mp-mapbox-view
            slot="beforeMap"
            :document="aboveLayerDocument"
            :mapStyle="mapStyle"
          />
          <mp-mapbox-view
            slot="afterMap"
            :document="belowLayerDocument"
            :mapStyle="mapStyle"
          />
        </mapgis-compare>
        <!-- 空数据提示 -->
        <div class="swipe-no-data-tip" v-else>
          <a-empty description="卷帘分析功能至少需要选择2个图层" />
        </div>
      </a-col>
      <a-col span="6" class="swipe-col2">
        <!-- 上图层 -->
        <a-row>
          <a-col> {{ directionLayerTitle.aboveTitle }}图层： </a-col>
          <a-col>
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
          </a-col>
        </a-row>
        <!-- 下图层 -->
        <a-row>
          <a-col> {{ directionLayerTitle.belowTitle }}图层： </a-col>
          <a-col>
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
          </a-col>
        </a-row>
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
      </a-col>
    </a-row>
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
    name: '空样式',
    sources: {
      Default: {
        type: 'vector',
        tiles: [
          'http://localhost:6163/igs/rest/mrms/tile/IGServer/{z}/{y}/{x}?type=cpbf'
        ],
        minZoom: 0,
        maxZoom: 15
      }
    },
    sprite: 'http://localhost:6163/igs/rest/mrms/vtiles/sprite',
    glyphs:
      'http://localhost:6163/igs/rest/mrms/vtiles/fonts/{fontstack}/{range}.pbf',
    layers: [
      {
        id: '背景',
        type: 'background',
        paint: {
          'background-color': {
            stops: [
              [6, '#4a5768'],
              [8, '#424d5c']
            ]
          }
        }
      }
    ]
  }

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
