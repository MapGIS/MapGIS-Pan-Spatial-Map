import { Vue, Component, Prop } from 'vue-property-decorator'

import mapViewStateInstance, { MapViewState, Rect } from './map-view-state'

/**
 * 二维地图操作混入,提供操作地图的常用接口
 * @export
 * @class MpMapViewOperationMixin
 * @extends {Vue}
 */
@Component
export default class MapViewOperationMixin extends Vue {
  map: any = {}

  mapbox: any = {}

  activeMapViewState: MapViewState = mapViewStateInstance

  showQueryResult = false

  queryRect: Rect | object = {}

  // 获取当前激活的地图视图的范围
  get activeMapViewDisplayRect(): Rect {
    return this.activeMapViewState.displayRect
  }

  // 设置当前激活的地图视图的范围
  set activeMapViewDisplayRect(displayRect: Rect) {
    this.activeMapViewState.displayRect = displayRect
  }

  // 获取地图视图的复位范围
  get initDisplayRect(): Rect {
    return this.activeMapViewState.initDisplayRect
  }

  // 设置地图视图的复位范围
  set initDisplayRect(initDisplayRect: Rect) {
    this.activeMapViewState.initDisplayRect = initDisplayRect
  }

  // 设置当前激活的地图视图的ID
  set activeMapViewID(ID: string) {
    this.activeMapViewState.mapViewID = ID
  }

  // 获取当前激活的地图视图的ID
  get activeMapViewID(): string {
    return this.activeMapViewState.mapViewID
  }

  /**
   * 判断矩形范围是否可用
   * @private
   * @param {Rect} rect
   * @return {*} false:不可用,true:可用
   * @memberof MpMapViewOperationMixin
   */
  isValidRect(rect: Rect) {
    return rect && rect.xMin < rect.xMax && rect.yMin < rect.yMax
  }

  /**
   * 查询地图
   * @param {Rect} rect 指定区域
   */
  query(rect: Rect) {
    this.showQueryResult = true
    this.queryRect = rect
  }

  /**
   * 放大地图到指定区域的中心
   * @param {Rect} rect 指定区域
   */
  zoomIn(rect: Rect) {
    if (this.isValidRect(rect)) {
      this.map.fitBounds([
        [rect.xMax, rect.yMin],
        [rect.xMin, rect.yMax]
      ])
    } else {
      this.map.zoomIn()
    }
  }

  /**
   * 缩小地图到指定区域的中心
   * @param {Rect} rect 指定区域
   */
  zoomOut(rect: Rect) {
    if (this.isValidRect(rect)) {
      this.map.flyTo({
        zoom: this.map.getZoom() - 1,
        center: [(rect.xMin + rect.xMin) / 2, (rect.yMin + rect.yMax) / 2]
      })
    }
  }
}
