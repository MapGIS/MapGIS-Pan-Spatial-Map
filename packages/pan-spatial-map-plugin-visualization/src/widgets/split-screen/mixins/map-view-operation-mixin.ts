import { Vue, Component, Prop } from 'vue-property-decorator'

import { Rect } from './map-view-state'

/**
 * 二维地图操作混入,提供操作地图的常用接口
 * @export
 * @class MpMapViewOperationMixin
 * @extends {Vue}
 */
@Component
export default class MapViewOperationMixin extends Vue {
  private map: any = {}

  private mapbox: any = {}

  /**
   * 放大地图到指定区域
   * 可用于拉框放大
   * @param {Rect} rect 指定区域
   * @memberof MpMapViewOperationMixin
   */
  public zoomIn(rect: Rect) {
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
   * @memberof MpMapViewOperationMixin
   */
  public zoomOut(rect: Rect) {
    if (this.isValidRect(rect)) {
      this.map.flyTo({
        zoom: this.map.getZoom() - 1,
        center: [(rect.xMin + rect.xMin) / 2, (rect.yMin + rect.yMax) / 2]
      })
    }
  }

  /**
   * 判断矩形范围是否可用
   * @private
   * @param {Rect} rect
   * @return {*} false:不可用,true:可用
   * @memberof MpMapViewOperationMixin
   */
  private isValidRect(rect: Rect) {
    return rect && rect.xMin < rect.xMax && rect.yMin < rect.yMax
  }
}
