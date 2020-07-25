/* eslint-disable @typescript-eslint/no-explicit-any */
// eslint-disable-next-line max-classes-per-file
import { Vue, Component } from 'vue-property-decorator'
import { cesiumUtilInstance } from '@mapgis/pan-spatial-map-store'

class CesiumMarker {
  private NewEntityArray: any[] = []

  get newEntityArray() {
    return this.NewEntityArray
  }

  set newEntityArray(entityArray: any[]) {
    this.NewEntityArray = entityArray
  }
}

export const cesiumMarker = new CesiumMarker()

@Component({})
export default class CesiumMarkerMixin extends Vue {
  private CesiumMarker: CesiumMarker = cesiumMarker

  get newEntityArray() {
    return this.CesiumMarker.newEntityArray
  }

  set newEntityArray(entityArray: any[]) {
    this.CesiumMarker.newEntityArray = entityArray
  }

  public cesiumUtil = cesiumUtilInstance

  // 求内部点坐标
  findPolygonCenter(newCoorArray: any[]) {
    const xArray: number[] = [] // 将坐标数组拆分成 x y
    const yArray: number[] = []
    for (let i = 0; i < newCoorArray.length; i += 1) {
      if (i === 0) {
        xArray.push(Number(newCoorArray[i]))
      } else if (i % 2 > 0) {
        yArray.push(Number(newCoorArray[i]))
      } else if (i % 2 === 0) {
        xArray.push(Number(newCoorArray[i]))
      }
    }
    const xOption: any = this.findMaxMin(xArray)
    const yOption: any = this.findMaxMin(yArray)
    const PolygonCenter = [
      (xOption.max + xOption.min) / 2,
      (yOption.max + yOption.min) / 2
    ]
    return PolygonCenter
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
    const newCoorArray = this.coordinatesArray(coordinates)
    const PolygonCenter = this.findPolygonCenter(newCoorArray)
    const entityName =
      new Date().toLocaleString().split(' ')[0] +
      new Date().toLocaleString().split(' ')[1]
    const newEntity = this.cesiumUtil.appendPolygon(
      entityName,
      newCoorArray,
      '',
      ''
    ) // 绘制多边形
    this.newEntityArray.push(newEntity)
    return PolygonCenter
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
    const newCoorArray = this.coordinatesArray(coordinates)
    let centerCoordinates: any
    if (coordinates.length > 2) {
      // 求出内部点中心
      const index = Math.ceil(coordinates.length / 2)
      centerCoordinates = coordinates[index - 1]
    } else {
      // eslint-disable-next-line prefer-destructuring
      centerCoordinates = coordinates[0]
    }
    const entityName =
      new Date().toLocaleString().split(' ')[0] +
      new Date().toLocaleString().split(' ')[1]

    const lineSize = 2 // 线宽【根据配置文件 宽度改变】
    const newEntity = this.cesiumUtil.appendLine({
      name: entityName,
      pointsArray: newCoorArray,
      width: lineSize,
      color: ''
    })
    this.newEntityArray.push(newEntity)
    return centerCoordinates
  }

  // 带洞区
  appendHolePolygon(coordinates: any) {
    const newCoorArray1 = this.coordinatesArray(coordinates[0])
    const newCoorArray2 = this.coordinatesArray(coordinates[1])
    const entityName =
      new Date().toLocaleString().split(' ')[0] +
      new Date().toLocaleString().split(' ')[1]
    const newEntity = this.cesiumUtil.appendHolePolygon(
      entityName,
      newCoorArray1,
      [newCoorArray2]
    )
    this.newEntityArray.push(newEntity)
    const PolygonCenter = this.findPolygonCenter(newCoorArray1)
    return PolygonCenter
  }

  // 移除所有线、区、组合区、带洞区
  removeAllPolygonLine() {
    for (let i = 0; i < this.newEntityArray.length; i += 1) {
      // eslint-disable-next-line no-underscore-dangle
      this.cesiumUtil.removeEntityByName(this.newEntityArray[i]._name) // 删除绘制的多边型
    }
    this.newEntityArray = [] // 将带洞区、组合区数组清空
  }

  // 坐标数组处理
  coordinatesArray(coord: any) {
    const newCoorArray: number[] = []
    for (let i = 0; i < coord.length; i += 1) {
      for (let j = 0; j < 2; j += 1) {
        // 不管二三维数据都处理成二维
        newCoorArray.push(coord[i][j])
      }
    }
    return newCoorArray
  }
}
