<template>
  <div class="map-view-wrap">
    <!-- 标题/工具栏 -->
    <tools
      :title="mapViewLayer.title"
      :excludes="excludesTools"
      @on-click="mapHandleAttached"
    />
    <!-- 二维地图 -->
    <mapbox-view
      v-if="is2dLayer"
      ref="mapboxView"
      @load="mapboxLoaded"
      @draw-finished="drawFinished"
      :document="mapViewDocument"
    />
    <!-- 三维地图 -->
    <cesium-view
      v-else
      ref="cesiumView"
      @load="cesiumLoaded"
      @draw-finished="drawFinished"
      @link-changed="link3dChanged"
      :vue-key="mapViewId"
      :height="mapViewHeight"
      :document="mapViewDocument"
    />
    <!-- 高亮查询的要素 -->
    <mp-feature-highlight
      v-if="isMapLoaded && queryWindowVisible"
      :is-2d-layer="is2dLayer"
      :vue-key="mapViewId"
      :features="queryFeatures"
      :highlight-features="querySelection"
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
        @on-load-done="queryLoadDone"
        @on-select="querySelected"
        :query-rect="queryRect"
        :layer="mapViewLayer"
      />
    </mp-window>
  </div>
</template>
<script lang="ts">
import { Mixins, Component, Prop, Watch, Inject } from 'vue-property-decorator'
import { Document, Layer } from '@mapgis/web-app-framework'
import { MpQueryResultTree, MpFeatureHighlight } from '../../../../components'
import MapViewMixin, { Rect } from './mixins/map-view'
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
export default class MapView extends Mixins<Record<string, any>>(MapViewMixin) {
  @Inject('map') map: any

  @Inject('mapbox') mapbox: any

  // 需要resize
  @Prop() readonly resize!: string | boolean

  // 图层不需要的操作按钮
  @Prop() readonly excludesTools!: string | Array<ToolType>

  // 图层
  @Prop({ default: () => ({}) }) readonly mapViewLayer!: Layer

  // 查询弹框开关
  @Prop({ default: false }) readonly queryVisible!: boolean

  // 根据查询的范围显示标注
  @Prop({ default: () => ({}) }) readonly queryRect!: boolean

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
  queryFeatures: Record<string, any>[] = []

  // 结果树选中的节点
  querySelection: string[] = []

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
    this.isMapLoaded = true
    this.registerMapboxEvent()
    this.resort()
  }

  /**
   * 三维地图初始化
   */
  cesiumLoaded() {
    this.isMapLoaded = true
    this.setWebGlobe()
    this.resort()
  }

  /**
   * 二三维绘制结束操作
   * @param Rect 绘制范围
   */
  drawFinished({ mode, feature, shape, center }) {
    const { xmin, ymin, xmax, ymax }: Rect = shape
    const rect = new Rect(xmin, ymin, xmax, ymax)
    switch (this.operationType) {
      case 'query':
        this.clearQueryResults(false)
        this.query(rect)
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
   * 启用绘制
   */
  openDraw() {
    const ref = this.is2dLayer ? 'mapboxView' : 'cesiumView'
    this.$refs[ref].openDraw()
  }

  /*
   * 地图操作按钮触发
   * @param type 按钮类型
   */
  mapHandleAttached(type: ToolType) {
    this.operationType = type
    this.setActiveMapView()
    if (this.isMapLoaded) {
      switch (type) {
        case 'query':
        case 'zoomIn':
        case 'zoomOut':
          this.openDraw()
          break
        case 'resort':
          this.resort(true)
          break
        case 'clear':
          this.clearQueryResults()
          break
        default:
          break
      }
    }
  }

  /**
   * 结果树弹框开关设置
   */
  toggleQueryWindow(visible: boolean) {
    this.queryWindowVisible = visible
  }

  /**
   * 结果树某一个节点加载完成
   * @param loadKeys
   * @param loadNode 选中的树节点
   */
  queryLoadDone(loadKeys, { children }) {
    this.queryFeatures = children
  }

  /**
   * 结果树选中
   * @param selectedKeys 选中的要素id集合
   */
  querySelected(selectedKeys: string[]) {
    this.querySelection = selectedKeys
  }

  /**
   * 清除查询结果
   */
  clearQueryResults(closeWin = true) {
    this.queryFeatures = []
    this.querySelection = []
    if (!this.is2dLayer) {
      this.clearWebGlobeEntities()
    }
    if (closeWin) {
      this.toggleQueryWindow(false)
      this.$emit('update:queryVisible', false)
    } else if (this.is2dLayer) {
      this.toggleQueryWindow(true)
    }
  }

  /**
   * resize
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
   * 监听:  窗口变化
   */
  @Watch('resize', { immediate: true })
  watchResizeOrigin() {
    this.onResize()
  }

  /**
   * 监听: 结果树开关
   */
  @Watch('queryVisible', { immediate: true })
  watchQueryVisible(nV) {
    if (nV) {
      this.toggleQueryWindow(nV)
    }
  }

  /**
   * 监听: 图层变化
   */
  @Watch('mapViewLayer.id', { immediate: true })
  watchMapViewLayer(nV: string) {
    if (nV) {
      this.initDocument()
    }
  }

  mounted() {
    this.initDocument()
    this.onResize()
    window.onresize = this.onResize
  }

  beforeDestroyed() {
    this.isMapLoaded = false
    this.mapHandleAttached('clear')
  }
}
</script>
<style lang="less" scoped>
@import './index.less';
</style>
