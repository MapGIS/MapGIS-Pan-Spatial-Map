import { Component, Mixins, Watch } from 'vue-property-decorator'
import { Rectangle } from '@mapgis/webclient-es6-service/common/Rectangle'
import { Rectangle3D } from '@mapgis/web-app-framework'
import mapViewState from '../store/map-view-state'
import MapViewMapboxMixin from './map-view-mapbox'
import MapViewCesiumMixin from './map-view-cesium'

@Component
export default class MapViewMixin extends Mixins(
  MapViewMapboxMixin,
  MapViewCesiumMixin
) {
  mapViewState = mapViewState

  // 活动视图
  get activeId() {
    return this.mapViewState._activeId
  }

  set activeId(id) {
    this.mapViewState._activeId = id
  }

  // 活动视图范围
  get activeBound() {
    return this.mapViewState._activeBound
  }

  set activeBound(bound) {
    this.mapViewState._activeBound = bound
  }

  // 查询的几何范围
  get queryGeometry() {
    return this.mapViewState._queryGeometry
  }

  set queryGeometry(geometry) {
    this.mapViewState._queryGeometry = geometry
  }

  // 是否当前活动视图
  get isActiveMapView() {
    return this.activeId === this.mapViewId
  }

  /**
   * 监听: 查询的几何范围
   */
  @Watch('queryGeometry', { deep: true })
  queryGeometryChanged(geometry: Rectangle | Rectangle3D) {
    if (geometry) {
      this.queryVisible = !!geometry
    } else {
      this.onQueryClear()
    }
  }

  /**
   * 监听: 活动范围
   * @param rect
   */
  @Watch('activeBound', { deep: true })
  boundChanged(rect: Rectangle) {
    if (this.isMapLoaded && !this.isActiveMapView) {
      this.zoomIn(rect)
    }
  }

  /**
   * 设置当前的活动地图
   */
  setActiveMapView() {
    if (this.isMapLoaded) {
      this.activeId = this.mapViewId
    }
  }

  /**
   * 更新动态变化的经纬度范围
   * @param {Rectangle} bound 经纬度范围
   */
  setActiveBound(bound: Rectangle) {
    if (this.isMapLoaded && this.isActiveMapView) {
      this.activeBound = bound
    }
  }

  /**
   * 清除
   */
  clear() {
    this.onQueryClear()
    this.queryGeometry = null
  }

  /**
   * 查询要素
   * @param {Rectangle | Rectangle3D} geometry 经纬度范围或者三维坐标集合
   */
  query(geometry: Rectangle | Rectangle3D) {
    this.onQueryClear()
    this.queryGeometry = geometry
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
    if (this.mapViewState.isValidRect(rect)) {
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
    if (this.mapViewState.isValidRect(rect)) {
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
