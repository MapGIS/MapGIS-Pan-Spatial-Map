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

const initRectangle = new Common.Rectangle(0.0, 0.0, 0.0, 0.0)
/**
 * 地图视图状态类.记录地图的ID、显示范围信息
 */
export class MapViewState {
  // 地图视图的ID
  private _mapViewId = ''

  // 二三维维地图复位时的视图范围
  private _initView = initRectangle

  // 二维地图当前的显示视图范围
  private _mapboxView: Rect = initRectangle

  get mapViewId(): string {
    return this._mapViewId
  }

  set mapViewId(id: string) {
    this._mapViewId = id
  }

  get mapboxView(): Rect {
    return this._mapboxView
  }

  set mapboxView(rect: Rect) {
    this._mapboxView = rect
  }

  get initView() {
    return this._initView
  }

  set initView(view) {
    this._initView = view
  }
}

const mStateInstance: MapViewState = new MapViewState()

export default mStateInstance
