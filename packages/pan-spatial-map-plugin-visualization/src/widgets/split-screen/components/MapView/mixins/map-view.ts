import { Component, Mixins, Watch } from 'vue-property-decorator'
import { Rectangle } from '@mapgis/webclient-es6-service/common/Rectangle'
import { Rectangle3D } from '@mapgis/web-app-framework'
import mapViewStateInstance from '../store/map-view-state'
import MapViewMapboxMixin from './map-view-mapbox'
import MapViewCesiumMixin from './map-view-cesium'

@Component
export default class MapViewMixin extends Mixins(
  MapViewMapboxMixin,
  MapViewCesiumMixin
) {
  // 公共状态
  activeMapViewState = mapViewStateInstance

  // 获取地图视图的复位范围
  get initBound() {
    return this.activeMapViewState.initBound
  }

  // 获取地图视图的活动范围
  get activeBound() {
    return this.activeMapViewState.activeBound
  }

  set activeBound(bound: Rectangle) {
    this.activeMapViewState.activeBound = bound
  }

  // 是否为当前活动的地图
  get activeMapViewId() {
    return this.activeMapViewState.mapViewId
  }

  set activeMapViewId(id: string) {
    this.activeMapViewState.mapViewId = id
  }

  /**
   * 监听: 更新活动地图经纬度范围
   */
  @Watch('activeBound', { immediate: true, deep: true })
  watchActiveBound(nV: Rectangle) {
    if (this.isMapLoaded && this.activeMapViewId !== this.mapViewId) {
      this.zoomIn(nV)
    }
  }

  /**
   * 设置当前的活动地图
   */
  setActiveMapView() {
    if (this.isMapLoaded) {
      this.activeMapViewId = this.mapViewId
    }
  }

  /**
   * 更新动态变化的经纬度范围
   * @param {Rectangle} rect 经纬度范围
   */
  setActiveBound(rect: Rectangle) {
    if (this.isMapLoaded && this.activeMapViewId === this.mapViewId) {
      this.activeBound = rect
    }
  }

  /**
   * 查询要素
   * @param {Rectangle | Rectangle3D} geometry 经纬度范围或者三维坐标集合
   */
  query(geometry: Rectangle | Rectangle3D) {
    this.$emit('on-query', geometry)
  }

  /**
   * 复位
   * @param {boolean} restoreOtherViews 是否同步复位其他图层
   */
  restore(restoreOtherViews = false) {
    const _bound = { ...this.initBound }
    this.zoomIn(_bound)
    if (restoreOtherViews) {
      this.setActiveBound(_bound)
    }
  }

  /**
   * 放大地图到指定区域的中心
   * @param {Rectangle} rect 经纬度范围
   */
  zoomIn(rect: Rectangle) {
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
   * @param {Rectangle} rect 经纬度范围
   */
  zoomOut(rect: Rectangle) {
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
