import { Component, Vue, Mixins } from 'vue-property-decorator'
import { WidgetMixin } from '@mapgis/web-app-framework'
import { utilInstance, baseConfigInstance } from '@mapgis/pan-spatial-map-store'
import * as Zondy from '@mapgis/webclient-es6-service'

@Component
export default class CesiumDraw extends Mixins(WidgetMixin) {
  // -1 空状态、0  点、1  线、2   面、3  矩形、 4圆形
  private type3d = -1

  queryType = ''

  drawer3d = null

  beforeDestroy() {
    this.drawer3d = undefined
  }

  handleDrawLoad(drawer) {
    this.drawer3d = drawer
  }

  handleCreate(cartesian3, lnglat) {
    window.setTimeout(() => {
      this.setBound(cartesian3)
      this.clearCesiumDraw3D()
    }, 300)
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
    if (this.type3d === 0) {
      const coordinates = this.setLonLat(cartesian3)
      bound = new Zondy.Common.Point2D(coordinates[0], coordinates[1], {
        nearDis
      })
    } else if (this.type3d === 1) {
      const arr = cartesian3.map((item: Array<number>) => {
        const coordinates = this.setLonLat(item)
        return new Zondy.Common.Point2D(coordinates[0], coordinates[1], {
          nearDis
        })
      })
      bound = new Zondy.Common.PolyLine(arr, { nearDis })
    } else if (this.type3d === 2) {
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
    }

    this.queryType = ''
    this.queryLayer(bound)
  }

  togglePoint3D() {
    this.clearCesiumDraw3D()
    this.type3d = 0
    this.drawer3d?.enableDrawPoint()
  }

  togglePolyline3D() {
    this.clearCesiumDraw3D()
    this.type3d = 1
    this.drawer3d?.enableDrawLine()
  }

  togglePolygon3D() {
    this.clearCesiumDraw3D()
    this.type3d = 2
    this.drawer3d?.enableDrawPolygon()
  }

  clearCesiumDraw3D() {
    this.type3d = -1
    this.queryType = ''
    this.drawer3d?.removeEntities()
  }
}
