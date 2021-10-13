import { Component, Mixins, Watch } from 'vue-property-decorator'
import { Rectangle } from '@mapgis/webclient-es6-service/common/Rectangle'
import { Rectangle3D } from '@mapgis/web-app-framework'
import mapViewState, { OperationType } from '../store/map-view-state'
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

  // 激活操作类型
  get activeOperationType() {
    return this.mapViewState._activeOperationType
  }

  set activeOperationType(type: keyof typeof OperationType) {
    this.mapViewState._activeOperationType = type
  }

  // 活动视图范围
  get activeBound() {
    return this.mapViewState._activeBound
  }

  set activeBound(bound) {
    this.mapViewState._activeBound = bound
  }

  // 三维活动视图范围
  get active3dBound() {
    return this.mapViewState._active3dBound
  }

  set active3dBound(bound) {
    this.mapViewState._active3dBound = bound
  }

  // 查询的几何范围
  get queryGeometry() {
    return this.mapViewState._queryGeometry
  }

  set queryGeometry(geometry) {
    this.mapViewState._queryGeometry = geometry
  }

  // 是否时候三维屏拖拽操作
  get isActive3dDrag() {
    return this.activeOperationType === OperationType.CESIUMDRAG
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
      this.zoomTo(rect)
    }
  }

  /**
   * 设置当前的活动地图
   */
  setActiveMapView(type: keyof typeof OperationType) {
    if (this.isMapLoaded) {
      this.activeId = this.mapViewId
      if (this.activeOperationType !== type) {
        this.activeOperationType = type
      }
    }
  }

  /**
   * 更新动态变化的经纬度范围
   * @param {Rectangle} bound 经纬度范围
   * @param {object} bound3d 三维视图范围
   */
  setActiveBound(bound: Rectangle, bound3d?) {
    if (this.isMapLoaded && this.isActiveMapView) {
      this.activeBound = bound
      this.active3dBound = bound3d
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
    this.queryGeometry = geometry
  }

  /**
   * 复位
   * @param {Rectangle} rect 经纬度范围
   */
  restore(rect: Rectangle) {
    this.setActiveBound(rect)
    this.zoomTo(rect)
  }

  /**
   * 放大地图到指定区域的中心
   * @param {Rectangle} rect 经纬度范围
   */
  zoomIn(rect: Rectangle) {
    if (!this.mapViewState.isValidRect(rect)) {
      this.ssMap.zoomIn()
    } else if (this.is2dLayer) {
      this.zoomInToRect(rect)
    } else if (!this.isActive3dDrag) {
      this.zoomInToRect3d(rect)
    }
  }

  /**
   * 缩小地图到指定经纬度范围的中心
   * @param {Rectangle} rect 经纬度范围
   */
  zoomOut(rect: Rectangle) {
    if (!this.mapViewState.isValidRect(rect)) {
      this.ssMap.zoomOut()
    } else if (this.is2dLayer) {
      this.zoomOutToRect(rect)
    } else if (!this.isActive3dDrag) {
      this.zoomOutToRect3d(rect)
    }
  }

  /**
   * 视角跳转
   * @param {Rectangle} rect 经纬度范围
   * @param {string} type
   */
  zoomTo(rect: Rectangle, type = OperationType.ZOOMIN) {
    switch (type) {
      case OperationType.ZOOMIN:
        this.zoomIn(rect)
        break
      case OperationType.ZOOMOUT:
        this.zoomOut(rect)
        break
      default:
        break
    }
  }
}
