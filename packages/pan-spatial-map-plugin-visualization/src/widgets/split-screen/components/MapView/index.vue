<template>
  <div class="map-view-wrap">
    <!-- 标题/工具栏 -->
    <tools :title="mapViewLayer.title" @on-click="onIconAttached" />
    <!-- 二维地图 -->
    <mapbox-view
      v-if="is2dLayer"
      ref="mapboxView"
      @load="onMapboxLoaded"
      @draw-finished="onDrawFinished"
      :layer="mapViewLayer"
      :document="mapViewDocument"
    />
    <!-- 三维地图 -->
    <cesium-view
      v-else
      ref="cesiumView"
      @load="onCesiumLoaded"
      @draw-finished="onDrawFinished"
      @link-changed="onLinkChanged"
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
    />
    <!-- 结果树 -->
    <mp-window
      title="查询结果"
      :width="200"
      :height="200"
      :visible.sync="queryWindowVisible"
      :vertical-offset="32"
      :full-screen-action="false"
      :has-padding="false"
    >
      <mp-query-result-tree
        v-if="queryWindowVisible"
        @on-node-loaded="onQueryLoaded"
        @on-select="onQuerySelected"
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
  AppMixin
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
export default class MapView extends Mixins(AppMixin, MapViewMixin) {
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
  querySelection: Array<Record<string, unknown>> = []

  // 是否是二维图层
  get is2dLayer() {
    const is3dLayer = this.mapViewLayer instanceof Layer3D
    return typeof is3dLayer === 'boolean' ? !is3dLayer : this.is2DMapMode
  }

  // 二维或三维地图组件
  get mapComponent() {
    return this.$refs[`${this.is2dLayer ? 'mapboxView' : 'cesiumView'}`]
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
   * 二维地图初始化
   * @param payload
   */
  onMapboxLoaded({ map, mapbox }) {
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
  onCesiumLoaded(webGlobe, sceneController) {
    this.sceneController = sceneController
    this.isMapLoaded = true
    this.restore()
  }

  /**
   * 地图联动变化
   * @param {object} 范围
   */
  onLinkChanged({ west, east, north, south }) {
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
   * @param {object} geometry 绘制几何
   * @param {object} rect 绘制经纬度范围
   */
  onDrawFinished({
    geometry,
    rect
  }: {
    geometry: Rectangle | Rectangle3D
    rect: Rectangle
  }) {
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

  /*
   * 地图操作按钮触发
   * @param type 按钮类型
   */
  onIconAttached(type: ToolType) {
    this.operationType = type
    this.setActiveMapView()
    if (this.isMapLoaded) {
      switch (type) {
        case 'query':
          this.mapComponent.openDraw()
          break
        case 'zoomIn':
        case 'zoomOut':
          this.mapComponent.openDraw('draw-rectangle')
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
   * 结果树加载的要素集合
   * @param {array} loadedKeys 已经加载的父节点key
   * @param {array} loadedChildNodes 已经加载的所有子节点
   */
  onQueryLoaded(
    loadedKeys: Array<string>,
    loadedNodes: Array<Record<string, unknown>>
  ) {
    this.queryFeatures = loadedNodes
  }

  /**
   * 结果树选中
   * @param {array} selectedKeys 选中的要素id集合
   * @param {array} selectedNodes 选中的要素集合
   */
  onQuerySelected(
    selectedKeys: Array<string>,
    selectedData: Array<Record<string, unknown>>
  ) {
    this.querySelection = selectedData
  }

  /**
   * 结果树弹框开关设置
   */
  toggleQueryWindow(visible: boolean) {
    this.queryWindowVisible = visible
    this.queryFeatures = []
    this.querySelection = []
    if (!visible) {
      this.$emit('update:queryVisible', false)
    }
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
   * 监听: 图层变化
   */
  @Watch('mapViewLayer.id', { immediate: true })
  watchMapViewLayer(id: string) {
    if (id) {
      this.initDocument()
    }
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

  mounted() {
    this.onResize()
    window.onresize = this.onResize
  }

  beforeDestroy() {
    this.isMapLoaded = false
    this.onIconAttached('clear')
  }
}
</script>
<style lang="less" scoped>
@import './index.less';
</style>
