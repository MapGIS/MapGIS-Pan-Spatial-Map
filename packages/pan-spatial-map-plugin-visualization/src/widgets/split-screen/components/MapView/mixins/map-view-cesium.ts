import { Vue, Component } from 'vue-property-decorator'
import { Rectangle } from '@mapgis/webclient-es6-service/common/Rectangle'

@Component
export default class MapViewCesiumMixin extends Vue {
  /**
   * 放大至指定范围
   * @param {Rectangle} bound 经纬度范围
   */
  zoomInToRect3d(bound: Rectangle) {
    this.sceneController.cameraSetView({
      destination: this.sceneController.getRectangleFromDegrees(bound)
    })
  }

  /**
   * 缩小至指定范围
   * @param {Rectangle} 经纬度范围
   */
  zoomOutToRect3d({ xmin, ymin, xmax, ymax }: Rectangle) {
    this.sceneController.cameraSetView({
      destination: this.sceneController.getCartesian3FromDegrees(
        (xmin + xmax) / 2,
        (ymin + ymax) / 2,
        this.sceneController.getPositionCartographicHeight() * 2
      )
    })
  }
}
