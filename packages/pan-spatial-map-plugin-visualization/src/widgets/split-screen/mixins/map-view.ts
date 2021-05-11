import { Mixins, Component, Prop } from 'vue-property-decorator'
import mapViewStateInstance, { MapViewState, Rect } from './map-view-state'
import MapViewOperation from './map-view-operation'

@Component
export default class MapViewMixin extends Mixins(MapViewOperation) {
  @Prop({ default: '' }) mapViewId!: string

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
}
