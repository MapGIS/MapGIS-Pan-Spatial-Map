import { Vue, Component, Prop } from 'vue-property-decorator'

export class Rect {
  /**
   * Creates an instance of Rect.
   * @param {number} xmin X坐标最小值
   * @param {number} ymin Y坐标最小值
   * @param {number} xmax X坐标最大值
   * @param {number} ymax Y坐标最大值
   */
  constructor(
    public xmin: number = 0.0,
    public ymin: number = 0.0,
    public xmax: number = 0.0,
    public ymax: number = 0.0
  ) {
    this.xmin = xmin
    this.xmax = xmax
    this.ymin = ymin
    this.ymax = ymax
  }
}

/**
 * 二维地图操作混入,提供操作地图的常用接口
 */
@Component({
  name: 'MapViewOperationMixin'
})
export default class MapViewOperationMixin extends Vue {
  @Prop({ default: '' }) mapViewId!: string

  map: any = {}

  mapbox: any = {}

  activeMapViewId = ''

  activeDisplayRect: Rect | object = {}

  /**
   * 查询地图
   * @param {Rect} rect 指定区域
   * @param {string} mapViewId 图层id
   */
  query(rect: Rect, mapViewId: string) {
    this.$emit('on-query', rect, mapViewId, true)
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
