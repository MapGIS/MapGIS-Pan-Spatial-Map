import { Vue, Component, Prop, Mixins, Watch } from 'vue-property-decorator'
import { AppMixin, Layer3D, Objects } from '@mapgis/web-app-framework'
import mapViewStateInstance, { MapViewState, Rect } from './map-view-state'
import MapboxMixin from './map-view-mapbox'
import CesiumMixin from './map-view-cesium'

export { Rect }

@Component
export default class MapViewMixin extends Mixins<Record<string, any>>(
  MapboxMixin,
  CesiumMixin,
  AppMixin
) {
  @Prop() mapViewId!: string

  // 公共状态
  activeMapViewState: MapViewState = mapViewStateInstance

  // 是否是二维图层
  get is2dLayer() {
    const is3dLayer = this.mapViewLayer instanceof Layer3D
    return typeof is3dLayer === 'boolean' ? !is3dLayer : this.is2DMapMode
  }

  // 获取当前激活的地图视图的ID
  get activeMapViewId(): string {
    return this.activeMapViewState.mapViewId
  }

  set activeMapViewId(id: string) {
    this.activeMapViewState.mapViewId = id
  }

  // 获取地图视图的复位范围
  get initBound() {
    return this.activeMapViewState.initBound
  }

  // 当前激活的地图视图的范围
  get activeMapViewBound(): Rect {
    return this.activeMapViewState.activeMapViewBound
  }

  set activeMapViewBound(rect: Rect) {
    this.activeMapViewState.activeMapViewBound = rect
  }

  // 是否为当前活动的地图
  get isActiveMapView() {
    return this.activeMapViewId === this.mapViewId
  }

  /**
   * 监听: 更新活动地图经纬度范围
   */
  @Watch('activeMapViewBound', { immediate: true, deep: true })
  watchActiveView(nV: Rect) {
    if (this.isMapLoaded && !this.isActiveMapView) {
      this.resort(nV)
    }
  }

  /**
   * 设置活动地图
   */
  setActiveMapView() {
    this.activeMapViewId = this.mapViewId
  }

  /**
   * 更新活动地图视图经纬度范围
   * @param rect 经纬度范围
   */
  updateActiveMapViewBound(rect: Rect) {
    if (this.isMapLoaded && this.isActiveMapView) {
      this.activeMapViewBound = rect
    }
  }

  /**
   * 查询要素
   * @param {Rect} rect 经纬度范围
   */
  query(rect: Rect) {
    this.$emit('on-query', rect)
  }

  /**
   * 放大地图到指定区域的中心
   * @param {Rect} rect 经纬度范围
   */
  zoomIn(rect: Rect) {
    if (this.activeMapViewState.isValidRect(rect)) {
      if (this.is2dLayer) {
        this.zoomInToRect(rect)
      } else {
        this.zoomInToRect3d(rect)
      }
    } else {
      this.ssMap.zoomIn()
    }
  }

  /**
   * 缩小地图到指定经纬度范围的中心
   * @param {Rect} rect 经纬度范围
   */
  zoomOut(rect: Rect) {
    if (this.activeMapViewState.isValidRect(rect)) {
      if (this.is2dLayer) {
        this.zoomOutToRect(rect)
      } else {
        this.zoomOutToRect3d(rect)
      }
    } else {
      this.ssMap.zoomOut()
    }
  }

  /**
   * 复位
   * @param bound 经纬度范围
   */
  resort(bound: Rect = this.initBound) {
    if (this.is2dLayer) {
      this.zoomInToRect(bound)
    } else {
      this.zoomInToRect3d(bound)
    }
  }

  /**
   * 拖拽
   * @param enable
   */
  pan(enable?: boolean) {
    if (this.is2dLayer) {
      this.togglePan(enable)
    } else {
      this.togglePan3d(enable)
    }
  }
}
