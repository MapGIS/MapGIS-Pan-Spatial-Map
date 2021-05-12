import { Component, Vue } from 'vue-property-decorator'
import { utilInstance, baseConfigInstance } from '@mapgis/pan-spatial-map-store'
import * as Zondy from '@mapgis/webclient-es6-service'

@Component({
  components: {}
})
export default class MapboxDraw extends Vue {
  // -1 空状态、0  点、1  线、2   面、3  矩形
  private type = -1

  private clickType = ''

  // 绘制组件
  drawer = {}

  geojsonData = null

  controls = {
    point: false,
    line_string: false,
    polygon: false,
    trash: false,
    combine_features: false,
    uncombine_features: false
  }

  handleAdded(e, data) {
    const { drawer, map } = e
    // 赋值绘制组件
    this.drawer = drawer || {}
    this.type = -1
  }

  enableDrawer() {
    const component = this.$refs.drawer
    if (component) {
      component.enableDrawer()
    }
  }

  togglePoint() {
    this.enableDrawer()
    this.type = 0

    this.drawer && this.drawer.changeMode('draw_point')
  }

  togglePolyline() {
    this.enableDrawer()
    this.type = 1

    this.drawer && this.drawer.changeMode('draw_line_string')
  }

  togglePolygon() {
    this.enableDrawer()
    this.type = 2

    this.drawer && this.drawer.changeMode('draw_polygon')
  }

  toggleRect() {
    this.enableDrawer()
    this.type = 3

    this.drawer && this.drawer.changeMode('draw_rectangle')
  }

  toggleDeleteAll() {
    this.type = -1

    this.drawer && this.drawer.deleteAll()
  }

  drawFinish(e) {
    const { coordinates } = e.features[0].geometry
    let nearDis = this.limits * 1000
    const { projectionName } = baseConfigInstance.config
    if (
      projectionName.indexOf('度') !== -1 ||
      projectionName.indexOf('分') !== -1 ||
      projectionName.indexOf('秒') !== -1
    ) {
      const distanceUnits = 103133.845
      nearDis /= distanceUnits
    }

    let bound: any
    if (this.type === 0) {
      bound = new Zondy.Common.Point2D(coordinates[0], coordinates[1], {
        nearDis
      })
    } else if (this.type === 1) {
      const arr = coordinates.map((item: Array<number>) => {
        return new Zondy.Common.Point2D(item[0], item[1], {
          nearDis
        })
      })
      bound = new Zondy.Common.PolyLine(arr, { nearDis })
    } else if (this.type === 2) {
      const arr = coordinates[0].map((item: Array<number>) => {
        return new Zondy.Common.Point2D(item[0], item[1], {
          nearDis
        })
      })
      bound = new Zondy.Common.Polygon(arr)
    } else if (this.type === 3) {
      const { xmin, ymin, xmax, ymax } = utilInstance.getGeoJsonFeatureBound(
        e.features[0]
      )
      bound = new Zondy.Common.Rectangle(xmin, ymin, xmax, ymax)
    }
    this.toggleDeleteAll()

    this.clickType = ''

    this.queryLayer(bound)
  }

  queryLayer(bound: Record<string, number>) {}

  clearMapboxDraw() {
    if (
      this.drawer &&
      [
        'draw_point',
        'draw_line_string',
        'draw_polygon',
        'draw_rectangle'
      ].includes(this.drawer.getMode())
    ) {
      this.type = -1
      this.clickType = ''
      this.drawer.deleteAll()
      this.drawer.changeMode('simple_select')
    }
  }
}
