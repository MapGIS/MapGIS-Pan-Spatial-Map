import { Vue, Component, Prop, Mixins, Watch } from 'vue-property-decorator'
import { AppMixin, Layer3D, Objects } from '@mapgis/web-app-framework'
import mapViewStateInstance, { Rect } from '../store/map-view-state'
import MapViewMapboxMixin from './map-view-mapbox'
import MapViewCesiumMixin from './map-view-cesium'

export { Rect }

@Component
export default class MapViewMixin extends Mixins<Record<string, any>>(
  MapViewMapboxMixin,
  MapViewCesiumMixin,
  AppMixin
) {
  @Prop() mapViewId!: string

  // 公共状态
  activeMapViewState = mapViewStateInstance

  // 是否是二维图层
  get is2dLayer() {
    const is3dLayer = this.mapViewLayer instanceof Layer3D
    return typeof is3dLayer === 'boolean' ? !is3dLayer : this.is2DMapMode
  }

  // 获取地图视图的复位范围
  get initBound() {
    return this.activeMapViewState.initBound
  }

  // 是否为当前活动的地图
  get isActiveMapView() {
    return this.activeMapViewState.mapViewId === this.mapViewId
  }

  // 是否移动地图
  get isMove() {
    return this.activeMapViewState.isMove
  }

  /**
   * 监听: 更新活动地图经纬度范围
   */
  @Watch('activeMapViewState.activeBound', { immediate: true, deep: true })
  watchActiveBound(nV: Rect) {
    if (this.isMapLoaded && !this.isActiveMapView) {
      this.zoomIn(nV)
    }
  }

  /**
   * 设置当前的活动地图
   */
  setActiveMapView() {
    if (!this.isActiveMapView) {
      this.activeMapViewState.mapViewId = this.mapViewId
    }
  }

  /**
   * 更新动态变化的经纬度范围
   * @param rect 经纬度范围
   */
  setActiveBound(rect: Rect) {
    if (this.isMapLoaded && this.isActiveMapView) {
      this.activeMapViewState.activeBound = rect
    }
  }

  /**
   * 是否是移动地图
   * @param isMove
   */
  setIsMove(isMove: boolean) {
    this.activeMapViewState.isMove = isMove
  }

  /**
   * 查询要素
   * @param {Rect} rect 经纬度范围
   */
  query(rect: Rect) {
    this.$emit('on-query', rect)
  }

  /**
   * 复位
   * @param  resortOtherViews 是否同步复位其他图层
   */
  resort(resortOtherViews = false) {
    const { initBound } = this
    this.zoomIn({ ...initBound })
    if (resortOtherViews) {
      this.setActiveBound({ ...initBound })
    }
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
}
