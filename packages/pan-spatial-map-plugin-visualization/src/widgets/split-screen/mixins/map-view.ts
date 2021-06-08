import { Vue, Component, Prop, Mixins } from 'vue-property-decorator'
import { AppMixin } from '@mapgis/web-app-framework'
import mStateInstance, { MapViewState, Rect } from './map-view-state'

export { Rect }
@Component
export default class MapViewMixin extends Mixins<Record<string, any>>(
  AppMixin
) {
  @Prop({ default: 1 }) mapIndex!: number

  @Prop({ default: '' }) mapViewId!: string

  private map: any = {}

  private mapbox: any = {}

  // 公共状态
  private activeMapViewState: MapViewState = mStateInstance

  // 获取当前激活的地图视图的ID
  get activeMapViewId(): string {
    return this.activeMapViewState.mapViewId
  }

  // 设置当前激活的地图视图的ID
  set activeMapViewId(id: string) {
    this.activeMapViewState.mapViewId = id
  }

  // 获取当前激活的地图视图的范围
  get activeMapboxView(): Rect {
    return this.activeMapViewState.mapboxView
  }

  // 设置当前激活的地图视图的范围
  set activeMapboxView(rect: Rect) {
    this.activeMapViewState.mapboxView = rect
  }

  // 获取地图视图的复位范围
  get initView() {
    return this.activeMapViewState.initView
  }

  // 设置地图视图的复位范围
  set initView(view) {
    this.activeMapViewState.initView = view
  }

  /**
   * 三维转至指定范围
   */
  jumpToRect3d({ xmin, xmax, ymin, ymax }) {
    // const Rectangle = new this.Cesium.Rectangle.fromDegrees(
    //   xmin,
    //   ymin,
    //   xmax,
    //   ymax
    // )
    // drawWebGlobe.viewer.camera.flyTo({
    //   destination: Rectangle
    // })
  }

  /**
   *  二维跳转至指定范围
   */
  jumpToRect({ xmin, xmax, ymin, ymax }: Rect) {
    this.map.fitBounds([
      [xmax, ymin],
      [xmin, ymax]
    ])
  }

  /**
   * 判断矩形范围是否可用
   * @param {Rect} rect
   */
  isValidRect(rect: Rect) {
    return rect && rect.xmin < rect.xmax && rect.ymin < rect.ymax
  }

  /**
   * 查询地图
   * @param {Rect} rect 指定区域
   */
  query(rect: Rect) {
    this.$emit('on-query', rect)
  }

  /**
   * 放大地图到指定区域的中心
   * @param {Rect} rect 指定区域
   */
  zoomIn(rect: Rect) {
    if (this.isValidRect(rect)) {
      if (this.is2DMapMode) {
        this.jumpToRect(rect)
      } else {
        this.jumpToRect3d(rect)
      }
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
      if (this.is2DMapMode) {
        this.map.flyTo({
          zoom: this.map.getZoom() - 1,
          center: [(rect.xmin + rect.xmin) / 2, (rect.ymin + rect.ymax) / 2]
        })
      } else {
        this.jumpToRect3d(rect)
      }
    }
  }
}
