<template>
  <div class="map-view-wrap">
    <!-- 标题/工具栏 -->
    <map-view-tools :title="mapViewLayer.title" @on-icon-click="onIconClick" />
    <!-- 地图 -->
    <mp-mapbox-view
      :document="document"
      :mapStyle="mapStyle"
      @map-load="onMapLoad"
      v-if="document"
    />
    <template v-if="isMapLoaded">
      <!-- 区域绘制 -->
      <mapgis-draw
        ref="mapboxBaseDrawer"
        :controls="controls"
        @added="onAdded"
        @drawCreate="onGraphicCreated"
      />
      <!-- 地图标注 -->
      <mp-markers-highlight-popup
        :features="queryFeatures"
        :highlightIds="querySelection"
        :normalize="({ key }) => ({ uid: key })"
      />
    </template>
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
import { MpMapboxView, Document, Layer } from '@mapgis/web-app-framework'
import { Rectangle } from '@mapgis/webclient-es6-service/common/Rectangle'
import defaultStyle from '../../../../assets/style/default-style.json'
import {
  MpQueryResultTree,
  MpMarkersHighlightPopup
} from '../../../../components'
import MapViewTools, { OperationType } from '../MapViewTools'
import MapViewMixin, { Rect } from '../../mixins/map-view'

@Component({
  components: {
    MapViewTools,
    MpMapboxView,
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

  document = null

  map: any = {}

  mapbox: any = {}

  // 图层样式
  mapStyle: any = defaultStyle

  // basedraw对象
  mapboxBaseDrawer: any = null

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

  // 矩形区域绘制配置
  controls = {
    point: false,
    line_string: false,
    polygon: false,
    trash: false,
    combine_features: false,
    uncombine_features: false
  }

  /**
   * 初始化图层
   */
  onInitDocument() {
    const _document: Document = new Document(null, null, null, [])
    const defaultMap = _document.defaultMap
    defaultMap.removeAll()
    defaultMap.add(this.mapViewLayer)
    this.document = _document
    this.clearClick()
  }

  /**
   * 地图初始化
   * @param payload<object>
   */
  onMapLoad({ map, mapbox }) {
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
    this.resortClick()
  }

  /**
   * 添加绘制
   */
  onAdded(e) {
    if (!this.isMapLoaded) return
    this.mapboxBaseDrawer = e.drawer
  }

  /**
   * 创建绘制
   */
  onGraphicCreated(e) {
    if (!this.isMapLoaded) return
    const { id, geometry } = e.features[0]
    if (this.mapboxBaseDrawer) {
      this.mapboxBaseDrawer.delete(id)
    }
    let xmin: number
    let xmax: number
    let ymin: number
    let ymax: number
    geometry.coordinates[0].forEach(([lng, lat]) => {
      if (!xmin || lng < xmin) {
        xmin = lng
      }
      if (!xmax || lng > xmax) {
        xmax = lng
      }
      if (!ymin || lat < ymin) {
        ymin = lat
      }
      if (!ymax || lat > ymax) {
        ymax = lat
      }
    })
    const rect: Rect = new Rect(xmin, ymin, xmax, ymax)
    switch (this.operationType) {
      case 'QUERY':
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
   * 操作按钮点击
   * @param operationType<string> 按钮类型
   * @param fnName<string> 按钮事件名
   */
  onIconClick(operationType, fnName) {
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
  onQueryLoadDone(loadKeys, loadNode) {
    this.queryFeatures = loadNode.children || []
  }

  /**
   * 结果树选中
   * @param selectedKeys
   */
  onQuerySelect(selectedKeys: string[]) {
    this.querySelection = selectedKeys
  }

  /**
   * 启用绘制
   */
  enableDrawer() {
    const drawerEl: any = this.$refs.mapboxBaseDrawer
    if (drawerEl) {
      drawerEl.enableDrawer()
    }

    if (this.mapboxBaseDrawer) {
      this.mapboxBaseDrawer.changeMode('draw_rectangle')
    }
  }

  /**
   * 启用拖拽,该函数在MapboxBaseDrawer开启时不起作用。
   * @param isEnable<boolean>
   */
  enableDragPanMap(isEnable: boolean) {
    const dragPan = this.map.dragPan
    if (isEnable) {
      dragPan.enable()
    } else {
      dragPan.disable()
    }
  }

  /**
   * 查询点击
   */
  queryClick() {
    this.enableDrawer()
  }

  /**
   * 放大点击
   */
  zoomInClick() {
    this.enableDragPanMap(false)
    this.enableDrawer()
  }

  /**
   * 缩小点击
   */
  zoomOutClick() {
    this.zoomInClick()
  }

  /**
   * 复位点击
   */
  resortClick() {
    this.jumpToRect(this.initDisplayRect)
  }

  /**
   * 拖拽点击, 通过滚轮控制放大缩小
   */
  panClick() {
    this.enableDragPanMap(true)
  }

  /**
   * 清除点击, 清除图层上的标注
   */
  clearClick(windowVisible = false) {
    this.windowVisible = windowVisible
    this.queryFeatures = []
    this.querySelection = []
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
      this.clearClick()
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
