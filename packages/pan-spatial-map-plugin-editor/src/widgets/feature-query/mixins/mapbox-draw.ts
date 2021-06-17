import { Component, Vue } from 'vue-property-decorator'
import { utilInstance, baseConfigInstance } from '@mapgis/pan-spatial-map-store'
import * as Zondy from '@mapgis/webclient-es6-service'

enum QueryType {
  Point = 'Point',
  Circle = 'Circle',
  Rectangle = 'Rectangle',
  Polygon = 'Polygon',
  LineString = 'LineString',
  PickModel = 'PickModel'
}

@Component
export default class MapboxDraw extends Vue {
  private queryType = ''

  // 绘制组件
  drawer = null

  geojsonData = null

  controls = {
    point: false,
    line_string: false,
    polygon: false,
    trash: false,
    combine_features: false,
    uncombine_features: false
  }

  beforeDestroy() {
    this.drawer = null
  }

  onAdded(e, data) {
    const { drawer, map } = e
    // 赋值绘制组件
    this.drawer = drawer || {}
    this.queryType = ''
  }

  onDrawFinish(e) {
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
    if (this.queryType === QueryType.Point) {
      bound = {
        x: coordinates[0],
        y: coordinates[1],
        nearDis
      }
    } else if (this.queryType === QueryType.LineString) {
      const arr = coordinates.map((item: Array<number>) => {
        return {
          x: item[0],
          y: item[1],
          nearDis
        }
      })
      bound = arr
    } else if (this.queryType === QueryType.Polygon) {
      const arr = coordinates[0].map((item: Array<number>) => {
        return {
          x: item[0],
          y: item[1],
          nearDis
        }
      })
      bound = arr
    } else if (
      this.queryType === QueryType.Circle ||
      this.queryType === QueryType.Rectangle
    ) {
      const { xmin, ymin, xmax, ymax } = utilInstance.getGeoJsonFeatureBound(
        e.features[0]
      )
      bound = {
        xmin,
        ymin,
        xmax,
        ymax
      }
    }
    this.queryLayer(bound)

    this.toggleDeleteAll()
  }

  togglePoint() {
    this.enableDrawer()
    this.queryType = QueryType.Point

    this.drawer && this.drawer?.changeMode('draw_point')
  }

  togglePolyline() {
    this.enableDrawer()
    this.queryType = QueryType.LineString

    this.drawer && this.drawer?.changeMode('draw_line_string')
  }

  togglePolygon() {
    this.enableDrawer()
    this.queryType = QueryType.Polygon

    this.drawer && this.drawer?.changeMode('draw_polygon')
  }

  toggleRect() {
    this.enableDrawer()
    this.queryType = QueryType.Rectangle
    this.drawer && this.drawer?.changeMode('draw_rectangle')
  }

  toggleCircle() {
    this.enableDrawer()
    this.queryType = QueryType.Circle

    this.drawer && this.drawer?.changeMode('draw_circle')
  }

  toggleDeleteAll() {
    this.queryType = ''

    this.drawer && this.drawer?.deleteAll()
  }

  clearMapboxDraw() {
    if (
      this.drawer &&
      [
        'draw_point',
        'draw_line_string',
        'draw_polygon',
        'draw_rectangle',
        'draw_circle'
      ].includes(this.drawer.getMode())
    ) {
      this.queryType = ''
      this.drawer.deleteAll()
      this.drawer.changeMode('simple_select')
    }
  }

  queryLayer(bound: Record<string, number>) {}

  private enableDrawer() {
    const component = this.$refs.drawer
    if (component) {
      component.enableDrawer()
    }
  }
}
