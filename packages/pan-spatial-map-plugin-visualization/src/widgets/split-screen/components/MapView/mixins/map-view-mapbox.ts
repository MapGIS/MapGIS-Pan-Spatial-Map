import { Mixins, Vue, Component } from 'vue-property-decorator'
import { Rect } from '../store/map-view-state'

@Component
export default class MapViewMapboxMixin extends Mixins<Record<string, any>>(
  Vue
) {
  /**
   * 地图事件注册
   */
  registerMapboxEvent() {
    this.ssMap.on('mousemove', this.setActiveMapView)
    this.ssMap.on('move', () => {
      const { _sw, _ne } = this.ssMap.getBounds()
      this.setActiveBound({
        xmin: _sw.lng,
        ymin: _sw.lat,
        xmax: _ne.lng,
        ymax: _ne.lat
      })
    })
  }

  /**
   *  放大至指定范围
   * @param 经纬度范围
   */
  zoomInToRect({ xmin, ymin, xmax, ymax }: Rect) {
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
   * @param 经纬度范围
   */
  zoomOutToRect({ xmin, ymin, xmax, ymax }: Rect) {
    this.ssMap.setZoom(this.ssMap.getZoom() - 1)
    if (xmin !== xmax) {
      this.ssMap.setCenter([(xmin + xmax) / 2, (ymin + ymax) / 2])
    }
  }
}
