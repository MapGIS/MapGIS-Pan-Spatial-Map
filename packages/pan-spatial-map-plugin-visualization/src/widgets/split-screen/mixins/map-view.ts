import { Vue, Component, Prop, Mixins, Watch } from 'vue-property-decorator'
import { AppMixin, MapMixin, Objects } from '@mapgis/web-app-framework'
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

  // 获取地图视图的复位范围
  get initView() {
    return this.activeMapViewState.initView
  }

  // 设置地图视图的复位范围
  set initView(view) {
    this.activeMapViewState.initView = view
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
    if (this.isMapLoaded && this.activeMapViewId !== this.mapViewId) {
      this.resort(nV)
    }
  }

  /**
   * 二维地图注册事件
   */
  registerMapboxEvent() {
    this.ssMap.on('mousemove', () => {
      this.activeMapViewId = this.mapViewId
    })
    this.ssMap.on('move', () => {
      if (this.mapViewId && this.activeMapViewId === this.mapViewId) {
        const { _sw, _ne } = this.ssMap.getBounds()
        this.activeView = {
          xmin: _sw.lng,
          ymin: _sw.lat,
          xmax: _ne.lng,
          ymax: _ne.lat
        }
      }
    })
  }

  /**
   * 注册三维webGlobe
   */
  setWebGlobe() {
    const webGlobe =
      this.CesiumZondy.getWebGlobe(this.mapViewId) || this.webGlobe
    this._webGlobe = webGlobe
    this.sceneController = Objects.SceneController.getInstance(
      this.Cesium,
      this.CesiumZondy,
      webGlobe
    ).sceneController
  }

  /**
   * 清除三维地图上的实体
   */
  clearWebGlobeEntities() {
    if (!this.is2dLayer && this._webGlobe) {
      this._webGlobe.viewer.entities.removeAll()
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
   * 三维放大至指定范围
   */
  zoomToRect3d(bound: Rect, type = 'in') {
    let destination: any
    if (type === 'in') {
      destination = this.sceneController.getRectangleFromDegrees(bound)
    } else {
      const { xmin, ymin, xmax, ymax } = bound
      destination = this.sceneController.getCartesian3FromDegrees(
        (xmin + xmax) / 2,
        (ymin + ymax) / 2,
        this.sceneController.getPsitionCartographicHeight * 2
      )
    }
    this.sceneController.cameraFlyTo({ destination })
  }

  /**
   *  二维放大至指定范围
   */
  zoomToRect({ xmin, xmax, ymin, ymax }: Rect, type = 'in') {
    if (type === 'in') {
      this.ssMap.fitBounds([
        [xmax, ymin],
        [xmin, ymax]
      ])
    } else {
      this.ssMap.flyTo({
        zoom: this.ssMap.getZoom() - 1,
        center: [(xmin + xmin) / 2, (ymin + ymax) / 2]
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
    this._webGlobe.viewer.scene.screenSpaceCameraController.enableZoom = enable
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
