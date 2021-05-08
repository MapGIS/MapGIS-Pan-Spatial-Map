<template>
  <div class="map-view-wrap">
    <div class="map-view">
      <a-tooltip v-for="item in tools" :key="item.label" :title="item.label">
        <a-icon :type="item.icon" @click.stop="onSettingIconClick(item)" />
      </a-tooltip>
    </div>
    <mp-mapbox-view
      :document="document"
      :mapStyle="mapStyle"
      @map-load="onMapLoad"
      v-if="document"
    />
    <mapgis-draw
      v-if="isMapLoaded"
      ref="mapboxBaseDrawer"
      :controls="controls"
      @added="onAdded"
      @drawCreate="onGraphicCreated"
    />
  </div>
</template>
<script lang="ts">
import { Mixins, Component, Prop, Watch } from 'vue-property-decorator'
import {
  Document,
  WidgetMixin,
  MpMapboxView,
  Layer
} from '@mapgis/web-app-framework'
import mapViewOperationMixin from '../../mixins/map-view-operation-mixin'
import { Rect } from '../../mixins/map-view-state'

type Noop = (l: Layer) => void

type OperationType =
  | 'UNKNOW'
  | 'QUERY'
  | 'ZOOMIN'
  | 'ZOOMOUT'
  | 'RESORT'
  | 'PAN'
  | 'CLEAR'

interface ITool {
  label: string
  icon: string
  operationType: OperationType
}

@Component({
  components: {
    MpMapboxView
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
}>(mapViewOperationMixin) {
  @Prop() mapViewID!: string

  @Prop({ default: () => ({}) }) layer!: Layer

  map: any = {}

  mapbox: any = {}

  isMapLoaded = false

  operationType: OperationType = 'UNKNOW'

  controls = {
    point: false,
    line_string: false,
    polygon: false,
    trash: false,
    combine_features: false,
    uncombine_features: false
  }

  mapboxBaseDrawer: any = null

  mapboxBaseDrawComponent: any = null

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

  // 工具按钮
  tools: ITool[] = [
    {
      label: '查询',
      icon: 'search',
      operationType: 'query'
    },
    {
      label: '放大',
      icon: 'zoom-in',
      operationType: 'zoomIn'
    },
    {
      label: '缩小',
      icon: 'zoom-out',
      operationType: 'zoomOut'
    },

    {
      label: '复位',
      icon: 'redo',
      operationType: 'resort'
    },
    {
      label: '移动',
      icon: 'drag',
      operationType: 'pan'
    },
    {
      label: '清除',
      icon: 'delete',
      operationType: 'clear'
    }
  ]

  /**
   * 获取地图
   */
  get document() {
    const document: any = new Document()
    const defaultMap = document.defaultMap
    defaultMap.remove(this.layer)
    defaultMap.add(this.layer)
    return document
  }

  /**
   * 设置图标点击操作
   * @param item<object>
   */
  onSettingIconClick(item: ITool) {
    const fn: Noop = this[`${item.operationType}Click`]
    if (typeof fn === 'function') {
      this.operationType = item.operationType.toUpperCase()
      fn()
    }
  }

  /**
   * 地图初始化
   * @param payload<object>
   */
  onMapLoad({ map, mapbox }) {
    this.map = map
    this.mapbox = mapbox
    this.map.on('mousemove', () => (this.activeMapViewID = this.mapViewID))
    this.map.on('move', () => {
      if (this.mapViewID && this.activeMapViewID === this.mapViewID) {
        const { _sw, _ne } = this.map.getBounds()
        this.activeMapViewDisplayRect = {
          xMin: _sw.lng,
          yMin: _sw.lat,
          xMax: _ne.lng,
          yMax: _ne.lat
        }
      }
    })
    this.isMapLoaded = true
    this.onRestoreBtnClicked()
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
    this.$delete(this.mapboxBaseDrawer, id)
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
      case 'RESORT':
        break
      case 'PAN':
        break
      case 'CLEAR':
        break
      default:
        break
    }
  }

  /**
   * 启用绘制
   */
  enableDrawer() {
    this.mapboxBaseDrawComponent = this.$refs.mapboxBaseDrawer
    if (this.mapboxBaseDrawComponent) {
      this.mapboxBaseDrawComponent.enableDrawer()
    }

    if (this.mapboxBaseDrawer) {
      this.mapboxBaseDrawer.changeMode('draw_rectangle')
    }
  }

  /**
   * 启用拖拽,该函数在MapboxBaseDraw开启时不起作用。
   * @param isEnable<boolean>
   */
  enableDragPanMap(isEnable: boolean) {
    if (this.isMapLoaded) {
      if (isEnable) {
        this.map.dragPan.enable()
      } else {
        this.map.dragPan.disable()
      }
    }
  }

  /**
   * 跳转值矩形区域
   * @param displayRect<object>
   */
  jumpToRect(displayRect: Rect) {
    if (this.isMapLoaded) {
      this.map.fitBounds([
        [displayRect.xMax, displayRect.yMin],
        [displayRect.xMin, displayRect.yMax]
      ])
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
  resortClick() {
    this.jumpToRect(this.initDisplayRect)
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

  @Watch('activeMapViewDisplayRect', { deep: true })
  onActiveMapViewDisplayRectChanged(nV) {
    if (this.mapViewID !== this.activeMapViewID) {
      this.jumpToRect(nV)
    }
  }
}
</script>
<style lang="less" scoped>
@import './index.less';
</style>
