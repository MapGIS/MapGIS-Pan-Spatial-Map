import { Vue, Component, Prop, Mixins, Watch } from 'vue-property-decorator'
import { AppMixin, MapMixin } from '@mapgis/web-app-framework'
import { cesiumUtilInstance } from '@mapgis/pan-spatial-map-store'
import mStateInstance, { MapViewState, Rect } from './map-view-state'

export { Rect }
@Component
export default class MapViewMixin extends Mixins<Record<string, any>>(
  MapMixin,
  AppMixin
) {
  @Prop() mapViewId!: string

  // 公共状态
  activeMapViewState: MapViewState = mStateInstance

  // 是否是二维图层
  get is2dLayer() {
    return this.mapViewLayer.is3d || this.is2DMapMode
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
   * 获取三维viewer
   */
  getWebGlobe() {
    return cesiumUtilInstance.findWebGlobe(this.mapViewId)
  }

  /**
   * 二维地图注册事件
   */
  registerMapboxEvent() {
    this.ssMap.on('mousemove', () => (this.activeMapViewId = this.mapViewId))
    this.ssMap.on('move', () => {
      if (this.mapViewId && this.activeMapViewId === this.mapViewId) {
        const { _sw, _ne } = this.ssMap.getBounds()
        this.activeMapboxView = {
          xmin: _sw.lng,
          ymin: _sw.lat,
          xmax: _ne.lng,
          ymax: _ne.lat
        }
      }
    })
  }

  /**
   * 三维跳转
   * @param destination
   */
  flyTo3d(destination: any) {
    const globe = this.getWebGlobe()
    globe.viewer.camera.flyTo({ destination })
  }

  /**
   * 二维拖拽开关
   * @param enable
   */
  togglePan(enable = true) {
    const { dragPan } = this.ssMap
    if (enable) {
      dragPan.enable()
    } else {
      dragPan.disable()
    }
  }

  /**
   * 三维拖拽开关
   * @param enable
   */
  toggle3dPan(enable = true) {
    const globe = this.getWebGlobe()
    globe.viewer.scene.screenSpaceCameraController.enableZoom = enable
  }

  /**
   * 三维放大至指定范围
   */
  zoomInToRect3d(rect: Rect) {
    this.flyTo3d(cesiumUtilInstance.getRect(rect))
  }

  /**
   *  二维缩小至指定范围
   */
  zoomOutToRect3d({ xmin, xmax, ymin, ymax }: Rect) {
    const globe = this.getWebGlobe()
    const destination = cesiumUtilInstance.getCartesian3(
      (xmin + xmax) / 2,
      (ymin + ymax) / 2,
      globe.viewer.camera.positionCartographic.height * 2
    )
    this.flyTo3d(destination)
  }

  /**
   *  二维放大至指定范围
   */
  zoomInToRect({ xmin, xmax, ymin, ymax }: Rect) {
    this.ssMap.fitBounds([
      [xmax, ymin],
      [xmin, ymax]
    ])
  }

  /**
   *  二维缩小至指定范围
   */
  zoomOutToRect({ xmin, xmax, ymin, ymax }: Rect) {
    this.ssMap.flyTo({
      zoom: this.ssMap.getZoom() - 1,
      center: [(xmin + xmin) / 2, (ymin + ymax) / 2]
    })
  }

  /**
   * 判断矩形范围是否可用
   * @param {Rect} rect
   */
  isValidRect(rect: Rect) {
    return rect && rect.xmin < rect.xmax && rect.ymin < rect.ymax
  }

  /**
   * 查询
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
      if (this.is2dLayer) {
        this.zoomInToRect(rect)
      } else {
        this.zoomInToRect3d(rect)
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
        this.zoomOutToRect(rect)
      } else {
        this.zoomOutToRect3d(rect)
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
      this.zoomInToRect(_view)
    } else {
      this.zoomInToRect3d(_view)
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

  /**
   * 清除地图上的实体
   */
  clear() {
    const globe = this.getWebGlobe()
    globe.viewer.entities.removeAll()
  }
}
