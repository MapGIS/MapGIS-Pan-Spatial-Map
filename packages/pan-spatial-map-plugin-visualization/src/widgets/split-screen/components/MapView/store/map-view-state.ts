import { CommonUtil } from '@mapgis/web-app-framework'
import { Rectangle } from '@mapgis/webclient-es6-service/common/Rectangle'

// 初始范围
export const initRectangle = new Rectangle(0.0, 0.0, 0.0, 0.0)

/**
 * 地图视图状态类.记录地图的ID、显示范围信息
 */
export class MapViewState {
  // 地图视图的ID
  private _mapViewId = ''

  // 二三维维地图复位时的经纬度范围
  private _initBound = initRectangle

  // 二三维当前活动的地图经纬度范围
  private _activeBound: Rectangle = initRectangle

  get mapViewId(): string {
    return this._mapViewId
  }

  set mapViewId(id: string) {
    this._mapViewId = id
  }

  get activeBound() {
    return this._activeBound
  }

  set activeBound(rect: Rectangle) {
    if (this.isValidRect(rect)) {
      this._activeBound = rect
    }
  }

  get initBound() {
    return this._initBound
  }

  set initBound(rect: Rectangle) {
    if (this.isValidRect(rect)) {
      this._initBound = rect
    }
  }

  /**
   * 判断矩形范围是否可用
   * @param {object} Rectangle
   */
  isValidRect(rect: Rectangle) {
    if (!CommonUtil.isEmpty(rect)) {
      const boundKeys = ['xmin', 'xmax', 'ymin', 'ymax']
      const hasBoundKeys = boundKeys.every(v => v in rect)
      return hasBoundKeys && rect.xmin <= rect.xmax && rect.ymin <= rect.ymax
    }
    return !0
  }
}

const mapViewStateInstance: MapViewState = new MapViewState()

export default mapViewStateInstance
