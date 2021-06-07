import { Vue, Component, Mixins } from 'vue-property-decorator'
import { cesiumUtilInstance } from '@mapgis/pan-spatial-map-store'
import { MapMixin } from '@mapgis/web-app-framework'

class CesiumMarkers {
  private _entityArray: any[] = []

  get entityArray() {
    return this._entityArray
  }

  set entityArray(array: any[]) {
    this._entityArray = array
  }
}

export const cesiumMarkersInstance = new CesiumMarkers()

@Component({})
export default class CesiumMarkerMixin extends Mixins(MapMixin) {
  public cesiumUtil = cesiumUtilInstance

  private cesiumMarkers: CesiumMarkers = cesiumMarkersInstance

  get entityArray() {
    return this.cesiumMarkers.entityArray
  }

  set entityArray(array: any[]) {
    this.cesiumMarkers.entityArray = array
  }

  // 求内部点坐标
  findPolygonCenter(coordArray: any[]) {
    const xArray: number[] = [] // 将坐标数组拆分成 x y
    const yArray: number[] = []
    for (let i = 0; i < coordArray.length; i += 1) {
      if (i === 0) {
        xArray.push(Number(coordArray[i]))
      } else if (i % 2 > 0) {
        yArray.push(Number(coordArray[i]))
      } else if (i % 2 === 0) {
        xArray.push(Number(coordArray[i]))
      }
    }
    const xOption: any = this.findMaxMin(xArray)
    const yOption: any = this.findMaxMin(yArray)
    const polygonCenter = [
      (xOption.max + xOption.min) / 2,
      (yOption.max + yOption.min) / 2
    ]
    return polygonCenter
  }

  // 求出数组最大值\最小值
  findMaxMin(array: any[]) {
    let maxVaule = array[0]
    let minVaule = array[0]
    for (let i = 0; i < array.length; i += 1) {
      if (maxVaule < array[i]) {
        maxVaule = array[i]
      }
      if (minVaule > array[i]) {
        minVaule = array[i]
      }
    }
    const maxMin = {
      max: maxVaule,
      min: minVaule
    }
    return maxMin
  }

  // 画简单区
  appendPolygon(coordinates: any) {
    const coordArray = this.coordinatesArray(coordinates)
    const polygonCenter = this.findPolygonCenter(coordArray)
    const entityName =
      new Date().toLocaleString().split(' ')[0] +
      new Date().toLocaleString().split(' ')[1]
    const fillColor = new this.Cesium.Color.fromCssColorString('#f3f5c4')

    const fillOutlineColor = new this.Cesium.Color.fromCssColorString('#f3f5c4')

    const entity = this.cesiumUtil.appendPolygon(
      entityName,
      coordArray,
      fillColor,
      fillOutlineColor
    ) // 绘制多边形
    this.entityArray.push(entity)
    return polygonCenter
  }

  // 画组合区
  appendGroupPolygon(coordinates: any) {
    let polygonCenter: any
    for (let i = 0; i < coordinates.length; i += 1) {
      polygonCenter = this.appendPolygon(coordinates[i]) // 画简单区
    }
    return polygonCenter
  }

  // 画线
  appendLine(coordinates: any) {
    const coordArray = this.coordinatesArray(coordinates)
    let centerCoordinates: any
    if (coordinates.length > 2) {
      // 求出内部点中心
      const index = Math.ceil(coordinates.length / 2)
      centerCoordinates = coordinates[index - 1]
    } else {
      centerCoordinates = coordinates[0]
    }
    const entityName =
      new Date().toLocaleString().split(' ')[0] +
      new Date().toLocaleString().split(' ')[1]

    const color = new this.Cesium.Color.fromCssColorString('#ff0000')

    const lineSize = 2 // 线宽【根据配置文件 宽度改变】
    const entity = this.cesiumUtil.appendLine({
      name: entityName,
      pointsArray: coordArray,
      width: lineSize,
      color: color
    })
    this.entityArray.push(entity)
    return centerCoordinates
  }

  // 带洞区
  appendHolePolygon(coordinates: any) {
    const coordArray1 = this.coordinatesArray(coordinates[0])
    const coordArray2 = this.coordinatesArray(coordinates[1])
    const entityName =
      new Date().toLocaleString().split(' ')[0] +
      new Date().toLocaleString().split(' ')[1]
    const entity = this.cesiumUtil.appendHolePolygon(entityName, coordArray1, [
      coordArray2
    ])
    this.entityArray.push(entity)
    const polygonCenter = this.findPolygonCenter(coordArray1)
    return polygonCenter
  }

  // 移除所有线、区、组合区、带洞区
  removeAllPolygonLine() {
    for (let i = 0; i < this.entityArray.length; i += 1) {
      this.cesiumUtil.removeEntityByName(this.entityArray[i]._name) // 删除绘制的多边型
    }
    this.entityArray = [] // 将带洞区、组合区数组清空
  }

  // 坐标数组处理
  coordinatesArray(coord: any) {
    const coordArray: number[] = []
    for (let i = 0; i < coord.length; i += 1) {
      for (let j = 0; j < 2; j += 1) {
        // 不管二三维数据都处理成二维
        coordArray.push(coord[i][j])
      }
    }
    return coordArray
  }
}
