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

  queryType = ''

  drawer3d = null

  beforeDestroy() {
    this.drawer3d = null
  }

  handleDrawLoad(drawer) {
    this.drawer3d = drawer
  }

  handleCreate(cartesian3, lnglat) {
    debugger
    // window.setTimeout(() => {
    this.setBound(lnglat)
    this.clearCesiumDraw3D()
    // }, 300)
  }

  setLonLat(cartesian) {
    const cartographic = this.Cesium.Cartographic.fromCartesian(cartesian)
    const lng = this.Cesium.Math.toDegrees(cartographic.longitude)
    const lat = this.Cesium.Math.toDegrees(cartographic.latitude)
    const alt = cartographic.height
    return [lng, lat, alt]
  }

  setBound(lnglat) {
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
      const coordinates = lnglat
      bound = {
        x: coordinates[0],
        y: coordinates[1],
        z: coordinates[2],
        nearDis
      }
    } else if (this.queryType === QueryType.LineString) {
      const arr = lnglat.map((coordinates: Array<number>) => {
        // const coordinates = this.setLonLat(item)
        return {
          x: coordinates[0],
          y: coordinates[1],
          z: coordinates[2],
          nearDis
        }
      })
      bound = arr
    } else if (this.queryType === QueryType.Polygon) {
      const arr = lnglat.map((coordinates: Array<number>) => {
        // const coordinates = this.setLonLat(item)
        return {
          x: coordinates[0],
          y: coordinates[1],
          z: coordinates[2],
          nearDis
        }
      })
      // const coordinates = this.setLonLat(cartesian3[0])
      const coordinates = lnglat[0]
      arr.push({
        x: coordinates[0],
        y: coordinates[1],
        z: coordinates[2],
        nearDis
      })
      bound = arr
    } else if (this.queryType === QueryType.Rectangle) {
      if (lnglat.length === 2) {
        const [xmin, ymax, z1] = lnglat[0]
        const [xmax, ymin, z2] = lnglat[1]
        const zmax = z1 - z2 >= 0 ? z1 : z2
        const zmin = z1 - z2 < 0 ? z1 : z2
        bound = {
          xmin,
          ymax,
          zmax,
          xmax,
          ymin,
          zmin
        }
      }
    }

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
