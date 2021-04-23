<template>
  <div class="mp-widget-swipe">
    <a-row type="flex">
      <a-col span="18" class="swipe-col1">
        <!-- 卷帘组件 -->
        <mapgis-compare-control
          ref="compare"
          :orientation="direction"
          v-if="isOpen"
        >
          <mp-mapbox-view
            class="mapbox-view-cls"
            :document="aboveLayerDocument"
            :mapStyle="defaultStyle"
            @onMapLoaded="handleMapLoad($event, 'above')"
          />
          <mp-mapbox-view
            class="mapbox-view-cls"
            :document="belowLayerDocument"
            :mapStyle="defaultStyle"
            @onMapLoaded="handleMapLoad($event, 'below')"
          />
        </mapgis-compare-control>
      </a-col>
      <a-col span="6" class="swipe-col2">
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
  WidgetState,
  Layer
} from '@mapgis/web-app-framework'
// import { MapgisCompareControl } from '@mapgis/webclient-vue-mapboxgl'

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
    // MapgisCompareControl,
    MpMapboxView
  }
})
export default class MpSwipe extends Mixins<IVueExtend>(WidgetMixin) {
  isOpen = false

  aboveLayer = ''

  belowLayer = ''

  aboveLayers: Layer[] = []

  belowLayers: Layer[] = []

  aboveLayerDocument = new Document()

  belowLayerDocument = new Document()

  layers: Layer[] = []

  direction: Direction = 'vertical'

  defaultStyle = {
    version: 8,
    sources: {},
    layers: []
  }

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
    this.isOpen = true
    this.initLayers()
  }

  /**
   * 卷帘弹框关闭操作
   */
  onClose() {
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
      const [{ id: fId }, { id: sId }, ...others] = layers
      this.layers = layers
      if (layers.length > 1) {
        this.getLayers(fId, 'aboveLayer', 'belowLayers')
        this.getLayers(sId, 'belowLayer', 'aboveLayers')
      } else {
        this.aboveLayer = fId
        this.aboveLayers = layers
      }
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
   * @param payload<object>
   * @param subMap<string>
   */
  handleMapLoad({ map }: any, subMap: 'above' | 'below') {
    const compareRef: IVueExtend = this.$refs.compare
    const results: any[] = [];
    results[ISubMap[subMap]] = map
    if (compareRef && typeof compareRef.handleMap === 'function') {
      compareRef.handleMap(results, compareRef)
    }
  }
}
</script>

<style lang="less" scoped>
.mp-widget-swipe {
  width: 1000px;
  height: 600px;
  overflow: auto;
  > div {
    width: 100%;
    height: 100%;
  }
}
.swipe-col1 {
  overflow: auto;
  position: relative;
}
.swipe-col2 {
  overflow: hidden;
  border-left: 1px solid #f0f0f0;
  padding-left: 12px;
  /deep/ .ant-col:first-of-type {
    line-height: 28px;
    + .ant-col {
      margin-bottom: 12px;
    }
  }
}
.swipe-select {
  width: 100%;
}
.mapbox-view-cls {
  position: absolute;
  top: 0;
  bottom: 0;
  width: 100%;
  height: 100%;
}
</style>
