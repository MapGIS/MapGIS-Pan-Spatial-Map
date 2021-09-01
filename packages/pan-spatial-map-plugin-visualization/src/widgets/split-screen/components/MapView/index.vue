<template>
  <div class="map-view-wrap">
    <!-- 标题/工具栏 -->
    <tools :title="mapViewLayer.title" @on-click="mapViewHandlesAttached" />
    <!-- 二维地图 -->
    <mapbox-view
      v-if="is2dLayer"
      ref="mapboxView"
      @load="mapboxLoaded"
      @draw-finished="drawFinished"
      :layer="mapViewLayer"
      :document="mapViewDocument"
    />
    <!-- 三维地图 -->
    <cesium-view
      v-else
      ref="cesiumView"
      @load="cesiumLoaded"
      @draw-finished="drawFinished"
      @link-changed="linkChanged"
      :vue-key="mapViewId"
      :height="mapViewHeight"
      :layer="mapViewLayer"
      :document="mapViewDocument"
    />
    <!-- 高亮查询的要素 -->
    <mp-feature-highlight
      v-if="isMapLoaded && queryWindowVisible"
      :vue-key="mapViewId"
      :is-2d-layer="is2dLayer"
      :features="queryFeatures"
      :selected-features="querySelection"
      :normalize="({ key }) => ({ uid: key })"
    />
    <!-- 结果树 -->
    <mp-window
      title="查询结果"
      :width="200"
      :height="200"
      :visible.sync="queryWindowVisible"
      :vertical-offset="30"
      :full-screen-action="false"
    >
      <mp-query-result-tree
        v-if="queryWindowVisible"
        @on-node-loaded="loadQuery"
        @on-select="selectQuery"
        :geometry="queryGeometry"
        :layer="mapViewLayer"
        :vue-key="mapViewId"
      />
    </mp-window>
  </div>
</template>
<script lang="ts">
import { Mixins, Component, Prop, Watch, Inject } from 'vue-property-decorator'
import { Rectangle } from '@mapgis/webclient-es6-service/common/Rectangle'
import {
  Document,
  Layer,
  Layer3D,
  Rectangle3D,
  Objects,
  AppMixin,
  MarkerPlottingMixin
} from '@mapgis/web-app-framework'
import { MpQueryResultTree, MpFeatureHighlight } from '../../../../components'
import MapViewMixin from './mixins/map-view'
import MapboxView from './components/MapboxView'
import CesiumView from './components/CesiumView'
import Tools, { ToolType } from './components/Tools'

@Component({
  components: {
    Tools,
    MapboxView,
    CesiumView,
    MpQueryResultTree,
    MpFeatureHighlight
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
export default class MapView extends Mixins(
  AppMixin,
  MapViewMixin,
  MarkerPlottingMixin
) {
  @Inject('map') map: any

  @Inject('mapbox') mapbox: any

  // 当前活动的窗口ID
  @Prop() mapViewId!: string

  // 当前活动的窗口的图层
  @Prop({ default: () => ({}) }) readonly mapViewLayer!: Layer

  // 查询弹框开关
  @Prop() readonly queryVisible!: boolean

  // 根据查询的范围显示标注
  @Prop() readonly queryGeometry!: Rectangle | Rectangle3D

  // 需要resize
  @Prop() readonly resize!: string | boolean

  // document
  mapViewDocument: Document | null = null

  // 地图高度
  mapViewHeight = 0

  // 分屏二维地图
  ssMap: any = this.map

  // 分屏二维mapbox
  ssMapbox: any = this.mapbox

  // 地图是否加载完成
  isMapLoaded = false

  // 操作按钮类型
  operationType: ToolType = ''

  // 结果树弹框开关
  queryWindowVisible = false

  // 结果树中展开的节点的所有子节点
  queryFeatures: Array<Record<string, unknown>> = []

  // 结果树选中的节点
  querySelection: Array<string> = []

  // 是否是二维图层
  get is2dLayer() {
    const is3dLayer = this.mapViewLayer instanceof Layer3D
    return typeof is3dLayer === 'boolean' ? !is3dLayer : this.is2DMapMode
  }

  /**
   * 初始化图层
   */
  initDocument() {
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
  mapboxLoaded({ map, mapbox }) {
    this.ssMap = map
    this.ssMapbox = mapbox
    this.ssMap.on('mousemove', this.setActiveMapView)
    this.ssMap.on('move', () => {
      const { _sw, _ne } = this.ssMap.getBounds()
      this.setActiveBound({
        xmin: _sw.lng,
        ymin: _sw.lat,
        xmax: _ne.lng,
        ymax: _ne.lat
      })
    })
    this.isMapLoaded = true
    this.restore()
  }

  /**
   * 三维地图初始化
   */
  cesiumLoaded(webGlobe, sceneController) {
    // this._webGlobe = webGlobe
    this.sceneController = sceneController
    this.isMapLoaded = true
    this.restore()
  }

  /**
   * 地图联动变化
   * @param {object} 范围
   */
  linkChanged({ west, east, north, south }) {
    this.setActiveMapView()
    this.setActiveBound({
      xmin: west,
      xmax: east,
      ymax: north,
      ymin: south
    })
  }

  /**
   * 二三维绘制结束操作
   * @param {object|array} geometry 绘制几何
   * @param {object} Rectangle 绘制经纬度范围
   */
  drawFinished(geometry: Rectangle | Rectangle3D, rect: Rectangle) {
    switch (this.operationType) {
      case 'query':
        this.toggleQueryWindow(true)
        this.query(geometry)
        break
      case 'zoomIn':
        this.zoomIn(rect)
        break
      case 'zoomOut':
        this.zoomOut(rect)
        break
      default:
        break
    }
  }

  /**
   * 清除三维球上的实体内容
   */
  // clearWebGlobeEntities() {
  //   if (!this.is2dLayer && this._webGlobe) {
  //     this._webGlobe.viewer.entities.removeAll()
  //   }
  // }

  /**
   * 清除结果树查询结果
   */
  clearQueryResults() {
    this.queryFeatures = []
    this.querySelection = []
    // this.clearWebGlobeEntities()
  }

  /**
   * 结果树弹框开关设置
   */
  toggleQueryWindow(visible: boolean) {
    this.queryWindowVisible = visible
    this.clearQueryResults()
    if (!visible) {
      this.$emit('update:queryVisible', false)
    }
  }

  /**
   * 结果树加载的要素集合
   * @param {array} loadedKeys 已经加载的父节点key
   * @param {array} loadedChildNodes 已经加载的所有子节点
   */
  loadQuery(
    loadedKeys: Array<string>,
    loadedChildNodes: Array<Record<string, unknown>>
  ) {
    this.queryFeatures = loadedChildNodes
  }

  /**
   * 结果树选中
   * @param {array} selectedKeys 选中的要素id集合
   */
  selectQuery(selectedKeys: Array<string>) {
    this.querySelection = selectedKeys
  }

  /*
   * 地图操作按钮触发
   * @param type 按钮类型
   */
  mapViewHandlesAttached(type: ToolType) {
    this.operationType = type
    this.setActiveMapView()
    if (this.isMapLoaded) {
      switch (type) {
        case 'query':
        case 'zoomIn':
        case 'zoomOut':
          this.$refs[
            `${this.is2dLayer ? 'mapboxView' : 'cesiumView'}`
          ].openDraw()
          break
        case 'restore':
          this.restore(true)
          break
        case 'clear':
          this.toggleQueryWindow(false)
          break
        default:
          break
      }
    }
  }

  /**
   * 分屏窗口变化
   */
  onResize() {
    this.$nextTick(() => {
      if (!this.is2dLayer) {
        this.mapViewHeight = this.$el.clientHeight - 32
      } else if (this.ssMap) {
        this.ssMap.resize()
      }
    })
  }

  /**
   * 监听: 结果树开关
   */
  @Watch('queryVisible', { immediate: true })
  watchQueryVisible(visible: boolean) {
    if (visible) {
      this.toggleQueryWindow(visible)
    }
  }

  /**
   * 监听:  窗口变化
   */
  @Watch('resize', { immediate: true })
  watchResizeOrigin() {
    this.onResize()
  }

  /**
   * 监听: 图层变化
   */
  @Watch('mapViewLayer.id', { immediate: true })
  watchMapViewLayer(id: string) {
    if (id) {
      this.initDocument()
    }
  }

  mounted() {
    this.initDocument()
    this.onResize()
    window.onresize = this.onResize
  }

  beforeDestroy() {
    this.isMapLoaded = false
    this.mapViewHandlesAttached('clear')
    this.unregisterHighlightEvent()
    this.unregisterClearHighlightEvent()
    this.unregisterClearSelectionEvent()
  }
}
</script>
<style lang="less" scoped>
@import './index.less';
</style>
