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
   * 三维地图move
   * @param 经纬度范围
   */
  setCesiumMove({ west, east, north, south }) {
    this.setActiveView({
      xmin: west,
      xmax: east,
      ymax: north,
      ymin: south
    })
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
   * 三维放大/缩小至指定范围
   * @param bound 经纬度范围
   * @param type zoomIn|zoomOut
   */
  zoomToRect3d(bound: Rect, type: 'zoomIn' | 'zoomOut' = 'zoomIn') {
    let destination: any
    console.log('zoomToRect3d', bound)
    if (type === 'zoomIn') {
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
