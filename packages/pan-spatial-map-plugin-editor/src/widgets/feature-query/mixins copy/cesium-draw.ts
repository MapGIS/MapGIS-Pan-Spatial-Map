import { Component, Vue, Mixins } from 'vue-property-decorator'
import { WidgetMixin } from '@mapgis/web-app-framework'
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
export default class CesiumDraw extends Mixins(WidgetMixin) {
  // -1 空状态、0  点、1  线、2   面、3  矩形、 4圆形

  webGlobe = null

  limits = 0

  queryType = ''

  drawer3d = null

  beforeDestroy() {
    this.drawer3d = null
  }

  handleDrawLoad(drawer) {
    this.drawer3d = drawer
  }

  handleCreate(cartesian3, lnglat) {
    console.group()
    console.log('cartesian3:', cartesian3)
    console.log('lnglat:', lnglat)
    console.groupEnd()
    // window.setTimeout(() => {
    this.setBound(cartesian3)
    this.clearCesiumDraw3D()
    // }, 300)
  }

  setLonLat(cartesian) {
    const cartographic = this.Cesium.Cartographic.fromCartesian(cartesian)
    const lng = this.Cesium.Math.toDegrees(cartographic.longitude)
    const lat = this.Cesium.Math.toDegrees(cartographic.latitude)
    return [lng, lat]
  }

  setBound(cartesian3) {
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
      const coordinates = this.setLonLat(cartesian3)
      console.log(coordinates)
      bound = new Zondy.Common.Point2D(coordinates[0], coordinates[1], {
        nearDis
      })
    } else if (this.queryType === QueryType.LineString) {
      const arr = cartesian3.map((item: Array<number>) => {
        const coordinates = this.setLonLat(item)
        return new Zondy.Common.Point2D(coordinates[0], coordinates[1], {
          nearDis
        })
      })
      bound = new Zondy.Common.PolyLine(arr, { nearDis })
    } else if (this.queryType === QueryType.Polygon) {
      const arr = cartesian3.map((item: Array<number>) => {
        const coordinates = this.setLonLat(item)
        return new Zondy.Common.Point2D(coordinates[0], coordinates[1], {
          nearDis
        })
      })
      const coordinates = this.setLonLat(cartesian3[0])
      arr.push(
        new Zondy.Common.Point2D(coordinates[0], coordinates[1], {
          nearDis
        })
      )
      bound = new Zondy.Common.Polygon(arr)
    } else if (this.queryType === QueryType.Rectangle) {
      if (cartesian3.length === 2) {
        const [xmin, ymax] = this.setLonLat(cartesian3[0])
        const [xmax, ymin] = this.setLonLat(cartesian3[1])
        bound = new Zondy.Common.Rectangle(xmin, ymin, xmax, ymax)
      }
    }

    this.queryType = ''
    this.queryLayer(bound)
  }

  togglePoint3D() {
    this.clearCesiumDraw3D()
    this.queryType = QueryType.Point
    this.drawer3d?.enableDrawPoint()
  }

  togglePolyline3D() {
    this.clearCesiumDraw3D()
    this.queryType = QueryType.LineString
    this.drawer3d?.enableDrawLine()
  }

  togglePolygon3D() {
    this.clearCesiumDraw3D()
    this.queryType = QueryType.Polygon
    this.drawer3d?.enableDrawPolygon()
  }

  toggleRect3D() {
    this.clearCesiumDraw3D()
    this.queryType = QueryType.Rectangle
    this.drawer3d?.enableDrawRectangle()
  }

  clearCesiumDraw3D() {
    this.queryType = ''
    this.drawer3d?.getDrawElement(this.webGlobe).stopDrawing()
    this.drawer3d?.removeEntities()
  }
}
