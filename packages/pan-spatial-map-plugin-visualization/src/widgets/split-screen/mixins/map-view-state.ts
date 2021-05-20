import { Rectangle } from '@mapgis/webclient-es6-service/common/Rectangle'

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

/**
 * 地图视图状态类.记录地图的ID、显示范围信息
 */
export class MapViewState {
  // 地图视图的ID
  private _mapViewId = ''

  // 地图当前的显示范围
  private _displayRect: Rect = new Rectangle(0.0, 0.0, 0.0, 0.0)

  // 地图复位时的范围
  private _initDisplayRect: Rect = new Rectangle(0.0, 0.0, 0.0, 0.0)

  get mapViewId(): string {
    return this._mapViewId
  }

  set mapViewId(id: string) {
    this._mapViewId = id
  }

  get displayRect(): Rect {
    return this._displayRect
  }

  set displayRect(displayRect: Rect) {
    this._displayRect = displayRect
  }

  get initDisplayRect(): Rect {
    return this._initDisplayRect
  }

  set initDisplayRect(initDisplayRect: Rect) {
    this._initDisplayRect = initDisplayRect
  }
}

const mapViewStateInstance: MapViewState = new MapViewState()

export default mapViewStateInstance
