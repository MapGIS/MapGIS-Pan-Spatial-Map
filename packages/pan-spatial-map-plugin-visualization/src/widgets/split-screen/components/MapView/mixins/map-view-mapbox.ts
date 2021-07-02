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
    this.ssMap.on('move', this.setMapBounds)
    this.ssMap.on('dragstart', this.startDragMap)
    this.ssMap.on('drag', this.setMapBounds)
    this.ssMap.on('dragend', this.endDragMap)
  }

  /**
   * 开始移动地图
   */
  startDragMap() {
    this.setIsMove(true)
  }

  /**
   * 结束移动地图
   */
  endDragMap() {
    this.setIsMove(false)
  }

  /**
   * 获取地图的范围并存入activeBound中
   */
  setMapBounds() {
    const { _sw, _ne } = this.ssMap.getBounds()
    this.setActiveBound({
      xmin: _sw.lng,
      ymin: _sw.lat,
      xmax: _ne.lng,
      ymax: _ne.lat
    })
  }

  /**
   * 平移至某个经纬度范围
   * @param 经纬度范围
   */
  panToRect({ xmin, xmax, ymin, ymax }: Rect) {
    this.ssMap.panTo([(xmin + xmax) / 2, (ymin + ymax) / 2], {
      animate: false
    })
  }

  /**
   * easing地图到指定范围
   * @param 经纬度范围
   */
  easingToRect({ xmin, xmax, ymin, ymax }: Rect) {
    this.ssMap.fitBounds([
      [xmax, ymin],
      [xmin, ymax]
    ])
  }

  /**
   *  放大至指定范围
   * @param 经纬度范围
   */
  zoomInToRect(rect: Rect) {
    if (this.isMove) {
      this.panToRect(rect)
    } else {
      this.easingToRect(rect)
    }
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
