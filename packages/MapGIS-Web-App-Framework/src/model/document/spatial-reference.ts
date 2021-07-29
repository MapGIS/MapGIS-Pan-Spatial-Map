import { ObjectTool } from '../utils/object-tool'
/**
 * 常用的空间参照系的枚举
 *
 * @date 29/04/2021
 * @enum {number}
 */
export enum CoordinateSystemType {
  /**
   * wgs84 web墨卡托投影坐标系
   */
  webMercator = 3857,
  /**
   * wgs84 经纬度坐标系
   */
  wgs84 = 4326
}

/**
 * 空间参照系
 *
 * @date 28/04/2021
 * @export
 * @class SpatialReference
 */
export class SpatialReference {
  /**
   * Creates an instance of SpatialReference.
   * @date 28/04/2021
   * @param {Record<string, any>} [properties]
   * @memberof SpatialReference
   */
  constructor(properties?: Record<string, any>) {
    if (!properties) return

    if (properties.wkid) this.wkid = properties.wkid
  }

  /**
   * 空间参照系对应的epsg号.如3857,4326。
   *
   * 默认值为：4326
   * @date 28/04/2021
   * @memberof SpatialReference
   */
  wkid = CoordinateSystemType.wgs84

  /**
   * 创建一个深度克隆的SpatialReference
   *
   * @date 06/04/2021
   * @return {*}  {SpatialReference}
   * @memberof SpatialReference
   */
  clone(): SpatialReference {
    const result = new SpatialReference()

    Object.entries(this).forEach(element => {
      const key = element[0]
      const valueIndex = 1
      result[key] = ObjectTool.deepClone(element[valueIndex])
    })

    return result
  }

  /**
   * 是否为Web墨卡托投影空间参照系
   *
   * @date 28/04/2021
   * @return {*}  {boolean}
   * @memberof SpatialReference
   */
  isWebMercator(): boolean {
    return this.wkid === 3857
  }

  /**
   * 是否为WGS84空间参照系
   *
   * @date 28/04/2021
   * @return {*}  {boolean}
   * @memberof SpatialReference
   */
  isWGS84(): boolean {
    return this.wkid === 4326 || this.wkid === 4490
  }
}
