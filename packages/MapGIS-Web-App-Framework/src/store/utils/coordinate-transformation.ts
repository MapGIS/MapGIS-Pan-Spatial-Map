import { point, projection } from '@turf/turf'
/**
 * 坐标转换工具类
 *
 * @date 28/04/2021
 * @export
 * @class CoordinateTransformation
 */
export class CoordinateTransformation {
  /**
   * WGS84经纬度转墨卡托
   *
   * @date 28/04/2021
   * @static
   * @param {number[]} coord    [经度,纬度]
   * @return {*}  {number[]}    [x,y]
   * @memberof CoordinateTransformation
   */
  static wgs84ToMercator(coord: number[]): number[] {
    const coordMercator: number[] = []

    const pt = point(coord)

    const ptConverted = projection.toMercator(pt)

    if (ptConverted && ptConverted.geometry) {
      coordMercator[0] = ptConverted.geometry.coordinates[0]
      coordMercator[1] = ptConverted.geometry.coordinates[1]
    }

    return coordMercator
  }

  /**
   * WGS84墨卡托转经纬度
   *
   * @date 28/04/2021
   * @static
   * @param {number[]} coord    [x,y]
   * @return {*}  {number[]}    [经度,纬度]
   * @memberof CoordinateTransformation
   */
  static mercatorToWGS84(coord: number[]): number[] {
    const coordWGS84: number[] = []

    const pt = point(coord)

    const ptConverted = projection.toWgs84(pt)

    if (ptConverted && ptConverted.geometry) {
      coordWGS84[0] = ptConverted.geometry.coordinates[0]
      coordWGS84[1] = ptConverted.geometry.coordinates[1]
    }

    return coordWGS84
  }
}
