import { CommonUtil } from '@mapgis/web-app-framework'
import { Common } from '@mapgis/webclient-es6-service'

export class Rect {
  /**
   * Creates an instance of Rect.
   * @param {number} xmin X坐标最小值
   * @param {number} ymin Y坐标最小值
   * @param {number} xmax X坐标最大值
   * @param {number} ymax Y坐标最大值
   */
  constructor(
    public xmin: number = 0.0,
    public ymin: number = 0.0,
    public xmax: number = 0.0,
    public ymax: number = 0.0
  ) {
    this.xmin = xmin
    this.xmax = xmax
    this.ymin = ymin
    this.ymax = ymax
  }
}

export const initRectangle = new Common.Rectangle(0.0, 0.0, 0.0, 0.0)
/**
 * 地图视图状态类.记录地图的ID、显示范围信息
 */
export class MapViewState {
  // 地图视图的ID
  private _mapViewId = ''

  // 二三维维地图复位时的经纬度范围
  private _initBound = initRectangle

  // 二三维当前活动的地图经纬度范围
  private _activeBound: Rect = initRectangle

  get mapViewId(): string {
    return this._mapViewId
  }

  set mapViewId(id: string) {
    this._mapViewId = id
  }

  get activeBound(): Rect {
    return this._activeBound
  }

  set activeBound(rect: Rect) {
    if (this.isValidRect(rect)) {
      this._activeBound = rect
    }
  }

  get initBound() {
    return this._initBound
  }

  set initBound(rect: Rect) {
    if (this.isValidRect(rect)) {
      this._initBound = rect
    }
  }

  /**
   * 判断矩形范围是否可用
   * @param {Rect} rect
   */
  isValidRect(rect: Rect) {
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