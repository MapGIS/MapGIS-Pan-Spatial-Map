import { Vue, Mixins, Component } from 'vue-property-decorator'
import { MapMixin, Objects } from '@mapgis/web-app-framework'
import { Rect } from './map-view-state'

@Component
export default class CesiumMixin extends Mixins<Record<string, any>>(MapMixin) {
  /**
   * 注册三维webGlobe
   */
  setWebGlobe() {
    const webGlobe =
      this.CesiumZondy.getWebGlobe(this.mapViewId) || this.webGlobe
    const controller = Objects.SceneController.getInstance(
      this.Cesium,
      this.CesiumZondy,
      webGlobe
    )
    this._webGlobe = webGlobe
    this.sceneController = controller.sceneController || controller
  }

  /**
   * 设置三维地图初始范围
   * 获取第一个地图的全图范围
   */
  setCesiumInitView() {
    const firstVueKey = 'split-screen-map-0'
    if (this.mapViewId === firstVueKey) {
      const subLayer = this.mapViewLayer.scenes[0].sublayers[0]
      const bound = this.sceneController.layerLocalExtentToGlobelExtent(
        subLayer
      )
      if (bound) {
        this.initView = bound
      }
      // console.log('setCesiumInitView1', bound)
    }
  }

  /**
   * 三维地图move
   */
  setCesiumMove({ west, east, north, south }) {
    // this.setActiveView({
    //   xmin: west,
    //   xmax: east,
    //   ymax: north,
    //   ymin: south
    // })
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
   * 三维拖拽开关
   * @param enable
   */
  toggle3dPan(enable = true) {
    this._webGlobe.viewer.scene.screenSpaceCameraController.enableZoom = enable
  }
}
