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
    <!-- 区域绘制 -->
    <mapgis-draw
      v-if="isMapLoaded"
      ref="mapboxBaseDrawer"
      :controls="controls"
      @added="onAdded"
      @drawCreate="onGraphicCreated"
    />
    <!-- 联合查询结果集 -->
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
        v-if="windowVisible"
      />
    </mp-window>
  </div>
</template>
<script lang="ts">
import { Mixins, Component, Prop, Watch } from 'vue-property-decorator'
import { MpMapboxView, Document, Layer } from '@mapgis/web-app-framework'
import { dataCatalogManagerInstance } from '@mapgis/pan-spatial-map-store'
import { Rectangle } from '@mapgis/webclient-es6-service/common/Rectangle'
import defaultStyle from '../../../../assets/style/default-style.json'
import MpQueryResultTree from '../../../../components/QueryResultsTree'
import { Rect } from '../../mixins/map-view-state'
import MapViewMixin from '../../mixins/map-view'
import MapViewTools from '../MapViewTools'

interface IVueExtend {
  [k: string]: any
}

type OperationType =
  | 'UNKNOW'
  | 'QUERY'
  | 'ZOOMIN'
  | 'ZOOMOUT'
  | 'RESORT'
  | 'PAN'
  | 'CLEAR'

@Component({
  components: {
    MapViewTools,
    MpMapboxView,
    MpQueryResultTree
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
export default class MapView extends Mixins<IVueExtend>(MapViewMixin) {
  // 双向绑定弹框开关
  @Prop({ default: false }) value!: boolean

  // 图层
  @Prop({ default: () => ({}) }) mapViewLayer!: Layer

  // 查询范围
  @Prop({ default: () => ({}) }) queryRect!: boolean

  map: any = {}

  mapbox: any = {}

  mapboxBaseDrawer: any = null

  mapboxBaseDrawerEl: any = null

  // 地图是否加载完成
  isMapLoaded = false

  // 操作按钮类型
  operationType: OperationType = 'UNKNOW'

  // 图层样式
  mapStyle: any = defaultStyle

  // 矩形区域绘制配置
  controls = {
    point: false,
    line_string: false,
    polygon: false,
    trash: false,
    combine_features: false,
    uncombine_features: false
  }

  // 获取document
  get document() {
    const _document: any = new Document(null, null, null, [])
    const defaultMap = _document.defaultMap
    defaultMap.removeAll()
    defaultMap.add(this.mapViewLayer)
    return _document
  }

  // 结果树弹框开关
  get windowVisible() {
    return this.value
  }

  set windowVisible(nV) {
    this.$emit('input', nV)
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
    this.mapboxBaseDrawer = e.drawer
  }

  /**
   * 创建绘制
   */
  onGraphicCreated(e) {
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
        this.query(rect, this.mapViewId)
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
   * 启用绘制
   */
  enableDrawer() {
    const drawerEl: any = this.$refs.mapboxBaseDrawer
    if (drawerEl) {
      this.mapboxBaseDrawerEl = drawerEl
      this.mapboxBaseDrawerEl.enableDrawer()
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
   * 跳转至某个范围
   * @param displayRect
   */
  jumpToRect(displayRect: Rect) {
    this.map.fitBounds([
      [displayRect.xmax, displayRect.ymin],
      [displayRect.xmin, displayRect.ymax]
    ])
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
   * 清除点击, 清除图层上的结果树中点中的节点图层
   */
  clearClick() {}

  /**
   * 监听: 更新复位范围
   */
  @Watch('activeMapViewDisplayRect', { deep: true })
  watchActiveMapViewDisplayRect(nV) {
    if (this.isMapLoaded && this.mapViewId !== this.activeMapViewId) {
      this.jumpToRect(nV)
    }
  }
}
</script>
<style lang="less" scoped>
@import './index.less';
</style>
