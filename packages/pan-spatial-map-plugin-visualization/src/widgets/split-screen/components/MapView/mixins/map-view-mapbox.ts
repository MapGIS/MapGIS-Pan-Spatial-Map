import { Vue, Component } from 'vue-property-decorator'
import { Rectangle } from '@mapgis/webclient-es6-service/common/Rectangle'

@Component
export default class MapViewMapboxMixin extends Vue {
  /**
   *  放大至指定范围
   * @param {Rectangle} 经纬度范围
   */
  zoomInToRect({ xmin, ymin, xmax, ymax }: Rectangle) {
    if (xmin == xmax) {
      this.ssMap.setZoom(this.ssMap.getZoom() + 1)
    } else {
      this.ssMap.fitBounds(
        [
          [xmax, ymin],
          [xmin, ymax]
        ],
        {
          animate: false
        }
      )
    }
  }

  /**
   *  缩小至指定范围
   * @param {Rectangle} 经纬度范围
   */
  zoomOutToRect({ xmin, ymin, xmax, ymax }: Rectangle) {
    this.ssMap.setZoom(this.ssMap.getZoom() - 1)
    if (xmin !== xmax) {
      this.ssMap.setCenter([(xmin + xmax) / 2, (ymin + ymax) / 2])
    }
  }
}
