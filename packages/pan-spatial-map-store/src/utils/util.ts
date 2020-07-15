import axios from 'axios'
import { Crs } from '@mapgis/webclient-store'
import systemConfigInstance from '../config/system'
import { GFeature } from '../service/query-features'

class Util {
  /**
   * 判断对象是不是数组
   * @param value
   * @returns {*}
   */
  public isArrayFn(value) {
    if (typeof Array.isArray === 'function') {
      return Array.isArray(value)
    }
    return Object.prototype.toString.call(value) === '[object Array]'
  }

  /**
   * 获取多边形重心
   * @param lnglats
   * @returns {number[]}
   */
  public getCenterOfGravityPoint(lnglats) {
    let area = 0.0 // 多边形面积
    let Gx = 0.0
    let Gy = 0.0 // 重心的x、y
    for (let i = 1; i <= lnglats.length; i += 1) {
      const iLat = lnglats[i % lnglats.length][1]
      const iLng = lnglats[i % lnglats.length][0]
      const nextLat = lnglats[i - 1][1]
      const nextLng = lnglats[i - 1][0]
      const temp = (iLat * nextLng - iLng * nextLat) / 2.0
      area += temp
      Gy += (temp * (iLat + nextLat)) / 3.0
      Gx += (temp * (iLng + nextLng)) / 3.0
    }
    return [Gx / area, Gy / area]
  }

  /**
   * 4326坐标转3857坐标
   * @param lonlat
   */
  public lngLatToMercatorCoord(lonlat) {
    const source = 'EPSG:4326'
    const destination =
      '+proj=merc +a=6378137 +b=6378137 +lat_ts=0.0 +lon_0=0.0 +x_0=0.0 +y_0=0 +k=1.0 +units=m +nadgrids=@null +wktext  +no_defs'
    return Crs.ProjectTool.proj4Transform(source, destination, lonlat)
  }

  /**
   * 3857坐标转4326坐标
   * @param point
   */
  public mercatorCoordToLngLat(point) {
    const source = 'EPSG:3857'
    const destination = '+proj=longlat +datum=WGS84 +no_defs'
    return Crs.ProjectTool.proj4Transform(source, destination, point)
  }

  /**
   *
   * @param feature 获取GeoJson要素的中心点坐标
   */
  public getGeoJsonFeatureCenter(feature: any) {
    const { geometry } = feature
    let coordinates: number[] = []
    switch (geometry.type) {
      case 'Point':
        coordinates = geometry.coordinates
        break
      case 'LineString':
        // eslint-disable-next-line no-case-declarations
        const a = Math.floor(geometry.coordinates.length / 2)
        coordinates = geometry.coordinates[a]
        break
      case 'Polygon':
        coordinates = this.getCenterOfGravityPoint(geometry.coordinates[0])
        break
      default:
        break
    }
    return coordinates
  }

  /**
   * 获取GeoJSON的外包矩形
   * @param feature GeoJSON的Feature
   */
  public getGeoJsonFeatureBound(feature: GFeature) {
    // 获取所有坐标值（0：x，1：y)
    const getNumbers = (coordinates: unknown[], index: number): number[] => {
      const obj = coordinates[index]
      if (typeof obj === 'number') {
        return [obj]
      }

      if (Array.isArray(coordinates[0])) {
        const arr = coordinates.map(item =>
          getNumbers(item as unknown[], index)
        )
        return arr.reduce((a: number[], b: number[]) => [...a, ...b])
      }

      return []
    }

    const {
      geometry: { coordinates }
    } = feature
    const x = getNumbers(coordinates, 0)
    const y = getNumbers(coordinates, 1)
    return {
      xmin: Math.min(...x),
      ymin: Math.min(...y),
      xmax: Math.max(...x),
      ymax: Math.max(...y)
    }
  }

  /**
   * 获取json的tag
   * @param data
   */
  getJsonTag(data: Record<string, unknown>) {
    return Object.keys(data)
  }

  /**
   * 十进制转度分秒
   * @param val 十进制经纬度坐标
   */
  decimalToDegree(val: number) {
    const dStrs = val.toString().split('.')
    const d = Number(dStrs[0])
    const fVal = (val - d) * 60
    const fStrs = fVal.toString().split('.')
    const f = Number(fStrs[0])
    const m = (fVal - f) * 60
    return {
      d,
      f,
      m
    }
  }

  /**
   * 度分秒转十进制
   * @param d
   * @param f
   * @param m
   */
  degreeToDecimal(d: number, f: number, m: number) {
    const deci = d + f / 60 + m / (60 * 60)
    return deci
  }

  /**
   * 度分秒转度
   * @param degree 度
   * @param minute 分
   * @param second 秒
   */
  coordinateStyleTransformation(
    degree: string,
    minute?: string,
    second?: string
  ) {
    const option: { degree: number; minute?: number; second?: number } = {
      degree: NaN
    }
    const d = Number(degree)
    if (degree && minute && second) {
      const m = Number(minute)
      const s = Number(second)
      option.degree = d >= 0 ? d + m / 60 + d / 3600 : d - m / 60 - s / 3600
    } else {
      option.degree = parseInt(degree)
      option.minute = Math.abs(parseInt(((d - option.degree) * 60).toString()))
      option.second = Math.abs(((d - option.degree) * 60 - option.minute) * 60)
    }
    return option
  }

  async transPoint(
    points: number[][],
    srcSref: string,
    desSref = systemConfigInstance.config.projectionName,
    ip = systemConfigInstance.config.ip,
    port = systemConfigInstance.config.port,
    serverName = systemConfigInstance.config.serverName,
    gdbName = systemConfigInstance.config.gdbName,
    userName = systemConfigInstance.config.userName,
    password = systemConfigInstance.config.password
  ) {
    if (points.length <= 0 || !srcSref) {
      throw new Error('参数错误')
    }

    const pointArr = points.map(([x, y]) => `${x},${y}`).join(';')
    const url =
      `http://${ip}:${port}/igs/rest/mrgs/geomservice/projectpoints` +
      `?f=json&srcSref=${srcSref}&desSref=${desSref}` +
      `&serverName=${serverName}&gdbName=${gdbName}&userName=${userName}&password=${password}`

    return axios.post(url, pointArr)
  }

  /**
   * 更具坐标计算图幅号
   * @param lon 经度
   * @param lat 纬度
   * @param scale 比例尺
   * @param srsId 坐标参考系
   * @param ip 服务IP
   * @param port 服务Port
   * @param objSrsId 目标参考系
   */
  async getClipByPoint(
    lon: string,
    lat: string,
    scale: string,
    srsId: string,
    ip = systemConfigInstance.config.ip,
    port = systemConfigInstance.config.port,
    objSrsId = systemConfigInstance.config.projectionName
  ) {
    const url = `http://${ip}:${port}/onemap/cliprect/getRectByCoor`
    return axios.post(
      url,
      JSON.stringify({
        lon,
        lat,
        scale,
        srsId,
        f: 'json',
        objSrsId
      })
    )
  }

  async getRectByFrameNo(
    frameNo: string,
    srsId = systemConfigInstance.config.projectionName,
    objSrsId = systemConfigInstance.config.projectionName,
    ip = systemConfigInstance.config.ip,
    port = systemConfigInstance.config.port
  ) {
    const url = `http://${ip}:${port}/onemap/cliprect/getRectByFrameNo`
    return axios.post(
      url,
      JSON.stringify({
        frameNo,
        srsId,
        objSrsId,
        f: 'json'
      })
    )
  }

  async getFrameNoList(
    url: string,
    scale: string,
    page = 1,
    count = 20,
    keyword = '',
    frameGdbp = ''
  ) {
    const { ip, port } = systemConfigInstance.config
    const srsId = systemConfigInstance.config.projectionName
    const objSrsId = systemConfigInstance.config.projectionName
    const igsUrl = `http://${ip}:${port}/onemap/cliprect/clipList`
    return axios.get(url, {
      params: {
        f: 'json',
        scale,
        rect: `${systemConfigInstance.config.xmin},${systemConfigInstance.config.ymin},${systemConfigInstance.config.xmax},${systemConfigInstance.config.ymax}`,
        srsId,
        objSrsId,
        url: igsUrl,
        frameGdbp,
        page,
        count,
        keyword
      }
    })
  }

  /**
   * 获取包含二级的json数据的tag对应的值
   * @param obj
   * @param tag
   */
  getTagValue(obj, tag) {
    let value
    if (obj[tag]) {
      value = obj[tag]
    } else if (obj.detail[tag]) {
      value = obj.detail[tag]
    } else if (obj.areaAddr[tag]) {
      value = obj.areaAddr[tag]
    }
    return value
  }

  /**
   * 函数防抖 (只执行最后一次点击)
   * @param fn
   * @returns {Function}
   * @constructor
   */
  debounce(fn: Function, time: number) {
    let timeout
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    const context = this
    return function(...args) {
      if (timeout) {
        clearTimeout(timeout)
      }
      timeout = setTimeout(() => {
        fn.apply(context, args)
        timeout = null
      }, time)
    }
  }

  /**
   * 获取颜色的r g b a
   * @param color
   * @param opacity
   * @returns {{a: number, r: number, b: number, g: number}}
   */
  getRGBA(color, opacity?: number) {
    let tempColor = color
    if (color.indexOf('rgb') === -1) {
      tempColor = this.colorToRgba(color, opacity)
    }
    const r = Number(tempColor.split(',')[0].split('(')[1])
    const g = Number(tempColor.split(',')[1])
    const b = Number(tempColor.split(',')[2])
    const a = Number(tempColor.split(',')[3].split(')')[0])
    return {
      r,
      g,
      b,
      a
    }
  }

  colorToRgba(color, opacity?: number) {
    if (opacity === undefined) {
      opacity = 1
    }
    let sColor = color.toLowerCase()
    // 十六进制颜色值的正则表达式
    const reg = /^#([0-9a-fA-f]{3}|[0-9a-fA-f]{6})$/
    // 如果是16进制颜色
    if (sColor && reg.test(sColor)) {
      if (sColor.length === 4) {
        let sColorNew = '#'
        for (let i = 1; i < 4; i += 1) {
          sColorNew += sColor.slice(i, i + 1).concat(sColor.slice(i, i + 1))
        }
        sColor = sColorNew
      }
      // 处理六位的颜色值
      const sColorChange: any[] = []
      for (let i = 1; i < 7; i += 2) {
        sColorChange.push(parseInt(`0x${sColor.slice(i, i + 2)}`))
      }
      return `rgba(${sColorChange.join(',')},${opacity})`
    }
    return sColor
  }

  /**
   * 获取多个多边形的中心
   * @param features
   */
  getPolygonsCenter(features: any[]) {
    const centers: number[][] = []
    for (let i = 0; i < features.length; i += 1) {
      const feature = features[i]
      const featureCenter = this.getGeoJsonFeatureCenter(feature)
      if (featureCenter.length > 0) {
        centers.push(featureCenter)
      }
    }
    centers.push(centers[0])
    let center = centers[0]
    if (centers.length === 3) {
      center = [
        (centers[0][0] + centers[1][0]) / 2,
        (centers[0][1] + centers[1][1]) / 2
      ]
    } else if (centers.length > 3) {
      center = this.getCenterOfGravityPoint(centers)
    }
    return center
  }
}

export default new Util()
