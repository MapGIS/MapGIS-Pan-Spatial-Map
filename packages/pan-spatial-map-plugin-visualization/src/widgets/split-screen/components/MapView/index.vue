<template>
  <div class="map-view-wrap">
    <!-- 标题/工具栏 -->
    <tools :title="mapViewLayer.title" @on-icon-click="onIconClick" />
    <!-- 二维地图 -->
    <mapbox-view
      v-if="is2dLayer"
      ref="maboxView"
      @on-load="onMapboxLoad"
      @on-created="onDrawCreated"
      :document="mapViewDocument"
    />
    <!-- 三维地图 -->
    <cesium-view
      v-else
      ref="cesiumView"
      @on-load="onCesiumLoad"
      @on-create="onDrawCreated"
      :vue-key="mapViewId"
      :height="mapViewHeight"
      :document="mapViewDocument"
    />
    <!-- 标注 -->
    <mp-markers-highlight-popup
      v-if="isMapLoaded"
      :is-2d="is2dLayer"
      :vue-key="mapViewId"
      :features="queryFeatures"
      :highlight-ids="querySelection"
      :normalize="({ key }) => ({ uid: key })"
    />
    <!-- 结果树 -->
    <mp-window
      title="查询结果"
      :width="200"
      :height="200"
      :visible.sync="windowVisible"
      :vertical-offset="30"
      :full-screen-action="false"
    >
      <mp-query-result-tree
        v-if="windowVisible"
        @on-load-done="onQueryLoadDone"
        @on-select="onQuerySelect"
        :query-rect="queryRect"
        :layer="mapViewLayer"
      />
    </mp-window>
  </div>
</template>
<script lang="ts">
import { Mixins, Component, Prop, Watch } from 'vue-property-decorator'
import { Document, Layer } from '@mapgis/web-app-framework'
import {
  MpQueryResultTree,
  MpMarkersHighlightPopup
} from '../../../../components'
import MapViewMixin, { Rect } from '../../mixins/map-view'
import MapboxView from './components/MapboxView'
import CesiumView from './components/CesiumView'
import Tools, { OperationType, OperationFn } from './components/Tools'

@Component({
  components: {
    Tools,
    MapboxView,
    CesiumView,
    MpQueryResultTree,
    MpMarkersHighlightPopup
  },
  provide() {
    const self = this
    return {
      get mapbox() {
        return self.ssMapbox
      },
      get map() {
        return self.ssMap
      }
    }
  }
})
export default class MapView extends Mixins<Record<string, any>>(MapViewMixin) {
  // 图层
  @Prop({ default: () => ({}) }) readonly mapViewLayer!: Layer

  // 地图高度
  @Prop() readonly mapViewHeight!: number

  // 双向绑定弹框开关
  @Prop({ default: false }) readonly queryVisible!: boolean

  // 查询范围
  @Prop({ default: () => ({}) }) readonly queryRect!: boolean

  mapViewDocument: Document | null = null

  ssMap: any = this.map

  ssMapbox: any = this.mapbox

  // 地图是否加载完成
  isMapLoaded = false

  // 操作按钮类型
  operationType: OperationType = 'UNKNOW'

  // 结果树弹框开关
  windowVisible = false

  // 结果树中展开的节点的所有子节点
  queryFeatures: Record<string, any>[] = []

  // 结果树选中的节点
  querySelection: string[] = []

  /**
   * 初始化图层
   */
  onInit() {
    if (!this.mapViewDocument) {
      this.mapViewDocument = new Document()
    }
    const { defaultMap } = this.mapViewDocument
    defaultMap.removeAll()
    defaultMap.add(this.mapViewLayer)
  }

  /**
   * 二维地图初始化
   * @param payload
   */
  onMapboxLoad({ map, mapbox }) {
    this.ssMap = map
    this.ssMapbox = mapbox
    this.isMapLoaded = true
    this.registerMapboxEvent()
    this.resort()
  }

  /**
   * 三维地图初始化
   */
  onCesiumLoad() {
    this.isMapLoaded = true
    this.resort()
  }

  /**
   * 创建二三维绘制
   * @param Rect 绘制范围
   */
  onDrawCreated({ xmin, ymin, xmax, ymax }: Rect) {
    const rect = new Rect(xmin, ymin, xmax, ymax)
    switch (this.operationType) {
      case 'QUERY':
        this.onClear(true)
        this.query(rect)
        break
      case 'ZOOMIN':
        this.zoomIn(rect)
        break
      case 'ZOOMOUT':
        this.zoomOut(rect)
        break
      default:
        break
    }
  }

  /**
   * 启用绘制
   */
  enableDrawer() {
    const ref = this.is2dLayer ? 'maboxView' : 'cesiumView'
    this.$refs[ref].enableDrawer()
  }

  /**
   * 查询点击
   */
  onQuery() {
    this.enableDrawer()
  }

  /**
   * 放大点击
   */
  onZoomIn() {
    this.pan(false)
    this.enableDrawer()
  }

  /**
   * 缩小点击
   */
  onZoomOut() {
    this.onZoomIn()
  }

  /**
   * 复位点击
   */
  onResort() {
    this.resort()
  }

  /**
   * 拖拽点击, 通过滚轮控制放大缩小
   * @param enable
   */
  onPan() {
    this.pan()
  }

  /**
   * 清除点击, 清除图层上的标注
   * @param visible
   */
  onClear(visible = false) {
    this.windowVisible = visible
    this.queryFeatures = []
    this.querySelection = []
    this.clear()
  }

  /**
   * 操作按钮点击
   * @param operationType 按钮类型
   * @param fnName 按钮事件名
   */
  onIconClick(operationType: OperationType, fnName: OperationFn) {
    this.operationType = operationType
    if (this.isMapLoaded && this[fnName]) {
      this[fnName]()
    }
  }

  /**
   * 结果树某一个节点加载完成
   * @param loadKeys
   * @param loadNode
   */
  onQueryLoadDone(loadKeys, { children }) {
    this.queryFeatures = children || []
  }

  /**
   * 结果树选中
   * @param selectedKeys
   */
  onQuerySelect(selectedKeys: string[]) {
    this.querySelection = selectedKeys
  }

  /**
   * 监听: 结果树开关
   */
  @Watch('queryVisible')
  watchQueryVisible(nV) {
    if (nV) {
      this.windowVisible = nV
    }
  }

  /**
   * 监听: 结果树弹框关闭按钮点击, 重置标注和弹框
   */
  @Watch('windowVisible')
  watchWindowVisible(nV) {
    if (!nV) {
      this.onClear()
      this.$emit('update:queryVisible', false)
    }
  }

  /**
   * 监听: 图层变化
   */
  @Watch('mapViewLayer.id')
  watchMapViewLayer(nV: string, oV: string) {
    if (nV && nV !== oV) {
      this.onInit()
    }
  }

  created() {
    this.onInit()
  }

  beforeDestroyed() {
    this.onClear()
  }
}
</script>
<style lang="less" scoped>
@import './index.less';
</style>
