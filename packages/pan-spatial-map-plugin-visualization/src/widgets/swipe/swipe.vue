<template>
  <div class="mp-widget-swipe">
    <!-- 上图层 -->
    <a-row class="swipe-row">
      <a-col>
        上级图层：
      </a-col>
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
    <a-row class="swipe-row">
      <a-col>
        下级图层：
      </a-col>
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
    <!-- 卷帘组件 -->
    <mapgis-compare ref="compare" :orientation="direction">
      <mp-mapbox-view
        :document="aboveLayerDocument"
        :mapStyle="defaultStyle"
        @onMapLoaded="handleMapLoad('above')"
      />
      <mp-mapbox-view
        :document="belowLayerDocument"
        :mapStyle="defaultStyle"
        @onMapLoaded="handleMapLoad('below')"
      />
    </mapgis-compare>
  </div>
</template>

<script lang="ts">
import { Mixins, Component, Watch } from 'vue-property-decorator'
import {
  Document,
  MpMapboxView,
  WidgetMixin,
  WidgetState,
  Layer
} from '@mapgis/web-app-framework'
import defaultStyle from '../../../../MapGIS-Web-App-Framework/src/assets/style/default-style.json'

const { MapgisCompare } = require('@mapgis/webclient-vue-mapboxgl')

type Direction = 'vertical' | 'horizontal'

interface IVueExtend {
  [k: string]: any
}

enum ISubMap {
  above = 0,
  below = 1
}

@Component({
  name: 'MpSwipe',
  components: {
    MapgisCompare,
    MpMapboxView
  }
})
export default class MpSwipe extends Mixins<IVueExtend>(WidgetMixin) {
  map: any[] = []

  aboveLayer = ''

  belowLayer = ''

  aboveLayers: Layer[] = []

  belowLayers: Layer[] = []

  aboveLayerDocument = new Document()

  belowLayerDocument = new Document()

  layers: Layer[] = []

  direction: Direction = 'vertical'

  defaultStyle = defaultStyle

  /**
   * 获取选中目录树下的叶子节点图层中的可见图层
   */
  get flatLayers() {
    const _layers = this.document.defaultMap
      .getFlatLayers()
      .filter((v: Layer) => v.isVisible)
    return _layers
  }

  @Watch('flatLayers')
  watchFlatLayers(nV: Layer[]) {
    if ([WidgetState.OPENED, WidgetState.ACTIVE].includes(this.widget.state)) {
      this.initLayers(nV)
    }
  }

  /**
   * 卷帘弹框打开操作
   */
  onOpen() {
    this.initLayers()
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
   * @param layers<array>
   */
  initLayers(layers?: Layer[]) {
    layers = layers || this.flatLayers

    if (layers && layers.length) {
      const id = layers[0].id
      this.aboveLayer = id
      this.belowLayer = id
      this.aboveLayers = layers
      this.belowLayers = layers
      this.layers = layers
    }
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
    this[layersKey] = [...this.layers.filter(({ id }) => id !== value)]
    this[`${valuekey}Document`].defaultMap.add(
      this.layers.find(v => v.id === value)
    )
  }

  /**
   * 地图初始化
   * @param subMap<string>
   */
  handleMapLoad(subMap: 'above' | 'below') {
    const that = this
    const compareRef: IVueExtend = that.$refs.compare
    console.log('卷帘组件', compareRef)
    return ({ map }: any) => {
      that.map[ISubMap[subMap]] = map
      compareRef.handleMap(that.map, compareRef.$el)
    }
  }
}
</script>

<style lang="less" scoped>
.swipe-select {
  width: 100%;
}
/deep/ .ant-col:first-of-type {
  line-height: 28px;
  + .ant-col {
    margin-bottom: 12px;
  }
}
</style>
