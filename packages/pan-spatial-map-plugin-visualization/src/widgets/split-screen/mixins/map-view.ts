import { Vue, Component, Prop } from 'vue-property-decorator'
import mapViewStateInstance, { MapViewState, Rect } from './map-view-state'

export { Rect }

@Component
export default class MapViewMixin extends Vue {
  @Prop({ default: '' }) mapViewId!: string

  private map: any = {}

  private mapbox: any = {}

  // 公共状态
  private activeMapViewState: MapViewState = mapViewStateInstance

  // 获取当前激活的地图视图的ID
  get activeMapViewId(): string {
    return this.activeMapViewState.mapViewId
  }

  // 设置当前激活的地图视图的ID
  set activeMapViewId(id: string) {
    this.activeMapViewState.mapViewId = id
  }

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

  /**
   * 查询地图
   * @param {Rect} rect 指定区域
   * @param {string} mapViewId 图层id
   */
  query(rect: Rect, mapViewId: string) {
    this.$emit('on-query', rect, mapViewId)
  }

  /**
   * 放大地图到指定区域的中心
   * @param {Rect} rect 指定区域
   */
  zoomIn(rect: Rect) {
    if (this.isValidRect(rect)) {
      this.map.fitBounds([
        [rect.xmax, rect.ymin],
        [rect.xmin, rect.ymax]
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
        center: [(rect.xmin + rect.xmin) / 2, (rect.ymin + rect.ymax) / 2]
      })
    }
  }

  /**
   * 判断矩形范围是否可用
   * @param {Rect} rect
   */
  isValidRect(rect: Rect) {
    return rect && rect.xmin < rect.xmax && rect.ymin < rect.ymax
  }
}
