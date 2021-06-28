import { Mixins, Vue, Component } from 'vue-property-decorator'
import { Rect } from './map-view-state'

@Component
export default class MapboxMixin extends Mixins<Record<string, any>>(Vue) {
  /**
   * 二维地图mousemove
   */
  setMapboxMouseMove() {
    this.activeMapViewId = this.mapViewId
  }

  /**
   * 二维地图move
   */
  setMapboxMove(rect: Rect) {
    const { _sw, _ne } = this.ssMap.getBounds()
    this.setActiveView({
      xmin: _sw.lng,
      ymin: _sw.lat,
      xmax: _ne.lng,
      ymax: _ne.lat
    })
  }

  setMapboxInitView() {
    if (!this.initView) {
      this.initView = this.mapViewLayer.fullExtent
    }
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
}
