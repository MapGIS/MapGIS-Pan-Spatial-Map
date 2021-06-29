import { Mixins, Component } from 'vue-property-decorator'
import { MapMixin, Objects } from '@mapgis/web-app-framework'
import { Rect } from './map-view-state'

@Component
export default class CesiumMixin extends Mixins<Record<string, any>>(MapMixin) {
  /**
   * 清除三维地图上的实体
   */
  clearWebGlobeEntities() {
    if (!this.is2dLayer && this._webGlobe) {
      this._webGlobe.viewer.entities.removeAll()
    }
  }

  /**
   * 注册webGlobe
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
   * 地图change
   * @param 经纬度范围
   */
  onCesiumChanged({ west, east, north, south }) {
    this.setActiveMapView()
    this.updateActiveMapViewBound({
      xmin: west,
      xmax: east,
      ymax: north,
      ymin: south
    })
  }

  /**
   * flyTo
   * @param destination
   */
  flyTo(destination: any) {
    this.sceneController.cameraFlyTo({ destination })
  }

  /**
   * 放大至指定范围
   * @param bound 经纬度范围
   */
  zoomInToRect3d(bound: Rect) {
    this.flyTo(this.sceneController.getRectangleFromDegrees(bound))
  }

  /**
   * 缩小至指定范围
   * @param bound 经纬度范围
   */
  zoomOutToRect3d({ xmin, ymin, xmax, ymax }: Rect) {
    this.flyTo(
      this.sceneController.getCartesian3FromDegrees(
        (xmin + xmax) / 2,
        (ymin + ymax) / 2,
        this.sceneController.getPsitionCartographicHeight * 2
      )
    )
  }

  /**
   * 拖拽
   * @param enable
   */
  togglePan3d(enable = true) {
    this._webGlobe.viewer.scene.screenSpaceCameraController.enableZoom = enable
  }
}
