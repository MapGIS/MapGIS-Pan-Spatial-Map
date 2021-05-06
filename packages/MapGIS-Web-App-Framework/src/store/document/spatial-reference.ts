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
  wkid = 4326

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
    return this.wkid === 4326
  }
}
