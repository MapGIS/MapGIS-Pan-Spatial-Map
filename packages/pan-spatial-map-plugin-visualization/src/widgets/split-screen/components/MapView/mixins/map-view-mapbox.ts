import { Mixins, Vue, Component } from 'vue-property-decorator'
import { Rect } from './map-view-state'

@Component
export default class MapViewMapboxMixin extends Mixins<Record<string, any>>(
  Vue
) {
  /**
   * 地图事件注册
   */
  registerMapboxEvent() {
    this.ssMap.on('mousemove', this.setActiveMapView)
    this.ssMap.on('move', this.moveMapbox)
  }

  /**
   * 地图move
   */
  moveMapbox() {
    const { _sw, _ne } = this.ssMap.getBounds()
    this.updateActiveBound({
      xmin: _sw.lng,
      ymin: _sw.lat,
      xmax: _ne.lng,
      ymax: _ne.lat
    })
  }

  /**
   *  放大至指定范围
   * @param 经纬度范围
   */
  zoomInToRect({ xmin, xmax, ymin, ymax }: Rect) {
    this.ssMap.fitBounds([
      [xmax, ymin],
      [xmin, ymax]
    ])
  }

  /**
   *  缩小至指定范围
   * @param 经纬度范围
   */
  zoomOutToRect({ xmin, xmax, ymin, ymax }: Rect) {
    this.ssMap.flyTo({
      speed: 0.2,
      zoom: this.ssMap.getZoom() - 1,
      center: [(xmin + xmin) / 2, (ymin + ymax) / 2]
    })
  }
}
