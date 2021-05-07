/**
 * 矩形区域对象
 * @export
 * @class Rect
 */
export class Rect {
  /**
   * X坐标最小值
   *
   * @memberof Rect
   */
  public xMin = 0.0

  /**
   * Y坐标最小值
   *
   * @memberof Rect
   */
  public yMin = 0.0

  /**
   * X坐标最大值
   *
   * @memberof Rect
   */
  public xMax = 0.0

  /**
   * Y坐标最大值
   *
   * @memberof Rect
   */
  public yMax = 0.0

  /**
   * Creates an instance of Rect.
   * @param {number} xMin X坐标最小值
   * @param {number} yMin Y坐标最小值
   * @param {number} xMax X坐标最大值
   * @param {number} yMax Y坐标最大值
   * @memberof Rect
   */
  constructor(xMin: number, yMin: number, xMax: number, yMax: number) {
    this.xMin = xMin
    this.xMax = xMax
    this.yMin = yMin
    this.yMax = yMax
  }
}

/**
 * 地图视图状态类.记录地图的ID、显示范围信息
 * @export
 * @class MapViewState
 */
export class MapViewState {
  /**
   * 地图当前的显示范围
   *
   * @private
   * @type {Rect}
   * @memberof MapViewState
   */
  private _displayRect: Rect = new Rect(0.0, 0.0, 0.0, 0.0)

  /**
   * 地图复位时的范围
   *
   * @private
   * @type {Rect}
   * @memberof MapViewState
   */
  private _initDisplayRect: Rect = new Rect(0.0, 0.0, 0.0, 0.0)

  /**
   * 地图视图的ID
   *
   * @private
   * @memberof MapViewState
   */
  private _mapViewID = ''

  constructor() {}

  public set displayRect(displayRect: Rect) {
    this._displayRect = displayRect
  }

  public get displayRect(): Rect {
    return this._displayRect
  }

  public set initDisplayRect(initDisplayRect: Rect) {
    this._initDisplayRect = initDisplayRect
  }

  public get initDisplayRect(): Rect {
    return this._initDisplayRect
  }

  public set mapViewID(ID: string) {
    this._mapViewID = ID
  }

  public get mapViewID(): string {
    return this._mapViewID
  }
}

const mapViewStateInstance: MapViewState = new MapViewState()

export default mapViewStateInstance
