import { Vue, Component, Prop } from 'vue-property-decorator'
import { Rect } from './map-view-state'

/**
 * 二维地图操作混入,提供操作地图的常用接口
 */
@Component
export default class MapViewOperation extends Vue {
  private map: any = {}

  private mapbox: any = {}

  /**
   * 查询地图
   * @param {Rect} rect 指定区域
   * @param {string} mapViewId 图层id
   */
  query(rect: Rect, mapViewId: string) {
    this.$emit('on-query', rect, mapViewId)
  }

  /**
   * 放大地图到指定区域的中心
   * @param {Rect} rect 指定区域
   */
  zoomIn(rect: Rect) {
    if (this.isValidRect(rect)) {
      this.map.fitBounds([
        [rect.xmax, rect.ymin],
        [rect.xmin, rect.ymax]
      ])
    } else {
      this.map.zoomIn()
    }
  }

  /**
   * 缩小地图到指定区域的中心
   * @param {Rect} rect 指定区域
   */
  zoomOut(rect: Rect) {
    if (this.isValidRect(rect)) {
      this.map.flyTo({
        zoom: this.map.getZoom() - 1,
        center: [(rect.xmin + rect.xmin) / 2, (rect.ymin + rect.ymax) / 2]
      })
    }
  }

  /**
   * 判断矩形范围是否可用
   * @param {Rect} rect
   */
  isValidRect(rect: Rect) {
    return rect && rect.xmin < rect.xmax && rect.ymin < rect.ymax
  }
}
