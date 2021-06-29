import { Mixins, Vue, Component } from 'vue-property-decorator'
import _debounce from 'lodash/debounce'
import { Rect } from './map-view-state'

@Component
export default class MapboxMixin extends Mixins<Record<string, any>>(Vue) {
  /**
   * 地图事件注册
   */
  registerMapboxEvent() {
    this.ssMap.on('mousemove', this.setActiveMapView)
    this.ssMap.on('move', _debounce(this.onMapboxMove, 400))
  }

  /**
   * 地图move
   */
  onMapboxMove() {
    const { _sw, _ne } = this.ssMap.getBounds()
    this.updateActiveMapViewBound({
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
      zoom: this.ssMap.getZoom() - 1,
      center: [(xmin + xmin) / 2, (ymin + ymax) / 2]
    })
  }

  /**
   * 拖拽
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
}
