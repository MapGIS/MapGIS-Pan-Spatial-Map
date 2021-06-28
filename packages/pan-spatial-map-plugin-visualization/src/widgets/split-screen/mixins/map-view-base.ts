import { Vue, Component, Prop, Mixins, Watch } from 'vue-property-decorator'
import { AppMixin, MapMixin, Layer3D, Objects } from '@mapgis/web-app-framework'
import mapViewStateInstance, { MapViewState, Rect } from './map-view-state'
// import { Layer3D } from '../../../../../MapGIS-Web-App-Framework/src/model'

export { Rect }

@Component
export default class MapViewMixin extends Mixins<Record<string, any>>(
  MapMixin,
  AppMixin
) {
  @Prop() mapViewId!: string

  // 公共状态
  activeMapViewState: MapViewState = mapViewStateInstance

  // 是否是二维图层
  get is2dLayer() {
    const is3dLayer = this.mapViewLayer instanceof Layer3D
    return typeof is3dLayer === 'boolean' ? !is3dLayer : this.is2DMapMode
  }

  // 获取地图视图的复位范围
  get initView() {
    return this.activeMapViewState.initView
  }

  get isCurrentView() {
    return this.activeMapViewId === this.mapViewId
  }

  // 获取当前激活的地图视图的ID
  get activeMapViewId(): string {
    return this.activeMapViewState.mapViewId
  }

  // 设置当前激活的地图视图的ID
  set activeMapViewId(id: string) {
    this.activeMapViewState.mapViewId = id
  }

  // 获取当前激活的地图视图的范围
  get activeView(): Rect {
    return this.activeMapViewState.activeView
  }

  // 设置当前激活的地图视图的范围
  set activeView(rect: Rect) {
    this.activeMapViewState.activeView = rect
  }

  /**
   * 监听: 更新地图视图范围
   */
  @Watch('activeView', { immediate: true, deep: true })
  watchActiveView(nV: Rect) {
    if (this.isMapLoaded && !this.isCurrentView) {
      this.resort(nV)
    }
  }

  /**
   * 二三维地图move
   */
  setMapMove(rect: Rect) {
    if (this.isMapLoaded && this.isCurrentView) {
      this.activeView = rect
    }
  }

  /**
   * 查询
   * @param {Rect} rect 指定区域
   */
  query(rect: Rect) {
    this.$emit('on-query', rect)
  }

  /**
   * 判断矩形范围是否可用
   * @param {Rect} rect
   */
  isValidRect(rect: Rect) {
    return rect && rect.xmin < rect.xmax && rect.ymin < rect.ymax
  }

  /**
   * 放大地图到指定区域的中心
   * @param {Rect} rect 指定区域
   */
  zoomIn(rect: Rect) {
    if (this.isValidRect(rect)) {
      if (this.is2dLayer) {
        this.zoomToRect(rect)
      } else {
        this.zoomToRect3d(rect)
      }
    } else {
      this.ssMap.zoomIn()
    }
  }

  /**
   * 缩小地图到指定区域的中心
   * @param {Rect} rect 指定区域
   */
  zoomOut(rect: Rect) {
    if (this.isValidRect(rect)) {
      if (this.is2dLayer) {
        this.zoomToRect(rect, 'out')
      } else {
        this.zoomToRect3d(rect, 'out')
      }
    } else {
      this.ssMap.zoomOut()
    }
  }

  /**
   * 复位
   * @param view 视图范围
   */
  resort(view: Rect) {
    const _view = view || this.initView
    if (this.is2dLayer) {
      this.zoomToRect(_view)
    } else {
      this.zoomToRect3d(_view)
    }
  }

  /**
   * 拖拽
   * @param enable
   */
  pan(enable?: boolean) {
    if (this.is2dLayer) {
      this.togglePan(enable)
    } else {
      this.toggle3dPan(enable)
    }
  }
}
