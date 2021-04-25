<template>
  <div class="mp-widget-swipe">
    <a-row type="flex" class="swipe-row">
      <a-col span="18" class="swipe-col1">
        <!-- 卷帘组件 -->
        <mapgis-compare :orientation="direction" v-if="isOpen">
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
  WidgetState,
  Layer
} from '@mapgis/web-app-framework'

type Direction = 'vertical' | 'horizontal'

interface IVueExtend {
  [k: string]: any
}

@Component({
  name: 'MpSwipe',
  components: {
    MpMapboxView
  }
})
export default class MpSwipe extends Mixins<IVueExtend>(WidgetMixin) {
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
    const currenLayer = this.layers.find(v => v.id === value)
    const _document = this[`${valuekey}Document`]
    _document.defaultMap.remove(currenLayer)
    _document.defaultMap.add(currenLayer)
  }
}
</script>

<style lang="less" scoped>
.mp-widget-swipe,
.swipe-row {
  width: 100%;
  height: 100%;
}

.swipe-col1 {
  height: 100%;
  overflow: auto;
  position: relative;
  padding-right: 12px;
}
.swipe-col2 {
  height: 100%;
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
