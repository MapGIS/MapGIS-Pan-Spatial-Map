import { Mixins, Vue, Component, Inject } from 'vue-property-decorator'
import { Objects } from '@mapgis/web-app-framework'
import { Rect } from '../store/map-view-state'

@Component
export default class MapViewCesiumMixin extends Mixins<Record<string, any>>(
  Vue
) {
  @Inject('Cesium') Cesium: any

  @Inject('CesiumZondy') CesiumZondy: any

  @Inject('webGlobe') webGlobe: any

  /**
   * 清除三维地图上的实体
   */
  clearWebGlobeEntities() {
    if (this._webGlobe) {
      this._webGlobe.viewer.entities.removeAll()
    }
  }

  /**
   * 设置webGlobe
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
   * 地图link change
   * @param 经纬度范围
   */
  link3dChanged({ west, east, north, south }) {
    this.setActiveMapView()
    this.setActiveBound({
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
  flyTo3d(destination: any) {
    this.sceneController.cameraFlyTo({ destination })
  }

  /**
   * 放大至指定范围
   * @param bound 经纬度范围
   */
  zoomInToRect3d(bound: Rect) {
    this.flyTo3d(this.sceneController.getRectangleFromDegrees(bound))
  }

  /**
   * 缩小至指定范围
   * @param bound 经纬度范围
   */
  zoomOutToRect3d({ xmin, ymin, xmax, ymax }: Rect) {
    this.flyTo3d(
      this.sceneController.getCartesian3FromDegrees(
        (xmin + xmax) / 2,
        (ymin + ymax) / 2,
        this.sceneController.getPositionCartographicHeight() * 2
      )
    )
  }
}
