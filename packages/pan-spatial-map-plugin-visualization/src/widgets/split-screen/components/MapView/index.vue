<template>
  <div class="map-view-wrap">
    <!-- 标题/工具栏 -->
    <tools :title="mapViewLayer.title" @on-icon-click="onIconClick" />
    <!-- 二维地图 -->
    <mapbox-view
      v-if="is2DMapMode"
      ref="maboxView"
      :mapIndex="mapIndex"
      :mapViewId="mapViewId"
      :mapViewDocument="mapViewDocument"
      @on-load="onMapboxLoad"
      @on-created="onDrawCreated"
    />
    <!-- 三维地图 -->
    <cesium-view
      v-else
      ref="cesiumView"
      :mapViewDocument="mapViewDocument"
      @on-load="onCesiumLoad"
      @on-create="onDrawCreated"
    />
    <!-- 标注 -->
    <mp-markers-highlight-popup
      v-if="isMapLoaded"
      :features="queryFeatures"
      :highlightIds="querySelection"
      :normalize="({ key }) => ({ uid: key })"
    />
    <!-- 联合查询结果树 -->
    <mp-window
      title="查询结果"
      :width="200"
      :height="200"
      :visible.sync="windowVisible"
      :verticalOffset="30"
      :fullScreenAction="false"
    >
      <mp-query-result-tree
        :layer="mapViewLayer"
        :queryRect="queryRect"
        @on-load-done="onQueryLoadDone"
        @on-select="onQuerySelect"
        v-if="windowVisible"
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
        return self.mapbox
      },
      get map() {
        return self.map
      }
    }
  }
})
export default class MapView extends Mixins<Record<string, any>>(MapViewMixin) {
  // 图层
  @Prop({ default: () => ({}) }) mapViewLayer!: Layer

  // 双向绑定弹框开关
  @Prop({ default: false }) queryVisible!: boolean

  // 查询范围
  @Prop({ default: () => ({}) }) queryRect!: boolean

  mapViewDocument: Document | null = null

  map: any = {}

  mapbox: any = {}

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
  onInitDocument() {
    if (!this.mapViewDocument) {
      this.mapViewDocument = new Document()
    }
    const { defaultMap } = this.mapViewDocument
    defaultMap.removeAll()
    defaultMap.add(this.mapViewLayer)
    this.onClear()
  }

  /**
   * 二维地图初始化
   */
  onMapboxLoad({ map, mapbox }) {
    this.map = map
    this.mapbox = mapbox
    this.map.on('mousemove', () => (this.activeMapViewId = this.mapViewId))
    this.map.on('move', () => {
      if (this.mapViewId && this.activeMapViewId === this.mapViewId) {
        const { _sw, _ne } = this.map.getBounds()
        this.activeMapViewDisplayRect = {
          xmin: _sw.lng,
          ymin: _sw.lat,
          xmax: _ne.lng,
          ymax: _ne.lat
        }
      }
    })
    this.isMapLoaded = true
    this.onResort()
  }

  /**
   * 三维地图初始化
   */
  onCesiumLoad(e) {
    this.isMapLoaded = true
  }

  /**
   * 创建二三维绘制
   */
  onDrawCreated(rect: Rect) {
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
    const ref = this.is2DMapMode ? 'maboxView' : 'cesiumView'
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
    this.onPan(false)
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
    if (this.is2DMapMode) {
      this.jumpToRect(this.initDisplayRect)
    } else {
      // todo 三维复位
      // window.webGlobe.viewer.scene.camera.setView(this.initDisplayRect)
    }
  }

  /**
   * 拖拽点击, 通过滚轮控制放大缩小
   */
  onPan(enable = true) {
    const dragPan = this.map.dragPan
    if (enable) {
      dragPan.enable()
    } else {
      dragPan.disable()
    }
  }

  /**
   * 清除点击, 清除图层上的标注
   */
  onClear(windowVisible = false) {
    this.windowVisible = windowVisible
    this.queryFeatures = []
    this.querySelection = []
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
      this.onInitDocument()
    }
  }

  /**
   * 监听: 更新地图视图范围
   */
  @Watch('activeMapViewDisplayRect', { deep: true })
  watchActiveMapViewDisplayRect(nV) {
    if (this.isMapLoaded && this.activeMapViewId !== this.mapViewId) {
      this.jumpToRect(nV)
    }
  }

  created() {
    this.onInitDocument()
  }
}
</script>
<style lang="less" scoped>
@import './index.less';
</style>
