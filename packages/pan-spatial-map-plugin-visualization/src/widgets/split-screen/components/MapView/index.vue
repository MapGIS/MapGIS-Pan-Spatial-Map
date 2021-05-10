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
      :visible.sync="queryVisible"
      :offset="[0, 30]"
      class="map-view-query-window"
    >
      <mp-query-result-tree :layer="mapViewLayer" :queryRect="queryRect" />
    </mp-window>
  </div>
</template>
<script lang="ts">
import { Mixins, Component, Prop, Watch } from 'vue-property-decorator'
import {
  WidgetMixin,
  MpMapboxView,
  Document,
  Layer
} from '@mapgis/web-app-framework'
import { Rectangle } from '@mapgis/webclient-es6-service/common/Rectangle'
import MpQueryResultTree from '../../../../components/QueryResultsTree'
import MapViewOperationMixin, {
  Rect
} from '../../mixins/map-view-operation-mixin'
import MapViewTools from '../MapViewTools'

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
export default class MapView extends Mixins<{
  [k: string]: any
}>(MapViewOperationMixin) {
  @Prop({ default: () => ({}) }) mapViewLayer!: Layer

  @Prop({ default: () => new Rectangle(0.0, 0.0, 0.0, 0.0) })
  mapFullExtent!: Rectangle

  @Prop({ default: false }) queryVisible!: boolean

  @Prop({ default: () => ({}) }) queryRect!: boolean

  isMapLoaded = false

  map: any = {}

  mapbox: any = {}

  mapboxBaseDrawer: any = null

  operationType: OperationType = 'UNKNOW'

  // 矩形区域绘制配置
  controls = {
    point: false,
    line_string: false,
    polygon: false,
    trash: false,
    combine_features: false,
    uncombine_features: false
  }

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

  // 获取地图document
  get document() {
    const _document: any = new Document(null, null, null, [])
    const defaultMap = _document.defaultMap
    defaultMap.remove(this.mapViewLayer)
    defaultMap.add(this.mapViewLayer)
    return _document
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
        this.activeDisplayRect = {
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
    this.mapboxBaseDrawer.delete(id)
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
    if (this.isMapLoaded) {
      this[fnName] && this[fnName]()
    }
  }

  /**
   * 启用绘制
   * @param drawer<object>
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
   * 查询
   */
  queryClick() {
    this.enableDrawer()
  }

  /**
   * 放大
   */
  zoomInClick() {
    this.enableDragPanMap(false)
    this.enableDrawer()
  }

  /**
   * 缩小
   */
  zoomOutClick() {
    this.zoomInClick()
  }

  /**
   * 复位
   */
  resortClick(displayRect: Rect) {
    const rect = displayRect || this.mapFullExtent
    this.map.fitBounds([
      [rect.xmax, rect.ymin],
      [rect.xmin, rect.ymax]
    ])
  }

  /**
   * 拖拽
   */
  panClick() {
    this.enableDragPanMap(true)
  }

  /**
   * 清除
   */
  clearClick() {}

  @Watch('activeDisplayRect', { deep: true })
  watchActiveDisplayRect(nV) {
    if (this.mapViewId !== this.activeMapViewId) {
      this.resortClick(nV)
    }
  }
}
</script>
<style lang="less" scoped>
@import './index.less';
</style>
