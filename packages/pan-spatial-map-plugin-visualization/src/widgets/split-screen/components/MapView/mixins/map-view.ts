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
      this.zoomIn(rect)
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
        console.log(`激活操作：${this.mapViewId}-${type}`)
      }
    }
  }

  /**
   * 更新动态变化的经纬度范围
   * @param {Rectangle} bound 经纬度范围
   */
  setActiveBound(bound: Rectangle) {
    if (this.isMapLoaded && this.isActiveMapView) {
      this.activeBound = bound
      console.log(`设置${this.mapViewId}激活范围`, bound)
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
   * @param {boolean} restoreOtherViews 是否同步复位其他图层
   */
  restore(restoreOtherViews = false) {
    const _bound = { ...this.initBound }
    console.log(`点击${this.mapViewId}重置`)
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
        console.log(`二维${this.mapViewId}跳转`)
        this.zoomInToRect(rect)
      } else if (!this.isActive3dDrag) {
        console.log(`三维${this.mapViewId}跳转`)
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
      } else if (!this.isActive3dDrag) {
        this.zoomOutToRect3d(rect)
      }
    } else {
      this.ssMap.zoomOut()
    }
  }
}
