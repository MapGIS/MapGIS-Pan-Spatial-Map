import { Point2D } from '@mapgis/webclient-es6-service/common/Point2D'
import { LoadStatus, LayerType, Layer } from './layer'
import { SpatialReference } from '../spatial-reference'

/**
 * 瓦片级别信息
 *
 * @author Yuanye Ma
 * @date 22/03/2021
 * @class LOD
 */
export class LOD {
  /**
   * 每一级的ID
   *
   * @date 22/03/2021
   * @memberof LOD
   */
  level = -1

  /**
   * 每一级的值,用于构造取图的URL
   *
   * @date 22/03/2021
   * @memberof LOD
   */
  levelValue = 0

  /**
   * 每级的分变率:每像素多少地图单位
   *
   * @date 22/03/2021
   * @memberof LOD
   */
  resolution = -1

  /**
   * 每级的比例尺分母
   *
   * @date 22/03/2021
   * @memberof LOD
   */
  scale = -1

  /**
   * 将该对象的实例转换为JSON对象。
   *
   * @date 22/03/2021
   * @return {*}  {Record<string, any>}
   * @memberof LOD
   */
  toJSON(): Record<string, any> {
    return {}
  }

  /**
   * 通过服务端返回的Json对象构造LOD对象的实例
   *
   * @date 22/03/2021
   * @static
   * @param {Record<string, any>} json
   * @return {*}  {LOD}
   * @memberof LOD
   */
  static fromJSON(json: Record<string, any>): LOD {
    const lod = new LOD()
    return lod
  }
}

/**
 * 瓦片切片信息
 *
 * @date 22/03/2021
 * @class TileInfo
 */
export class TileInfo {
  /**
   * 分辨率
   *
   * @date 22/03/2021
   * @memberof TileInfo
   */
  dpi = -1

  /**
   * 图片格式
   *
   * @date 22/03/2021
   * @memberof TileInfo
   */
  format = 'png'

  /**
   * 多层次细节数组
   *
   * @date 22/03/2021
   * @type {LOD[]}
   * @memberof TileInfo
   */
  lods: LOD[] = []

  /**
   * 裁图的源点
   *
   * @date 22/03/2021
   * @type {Point2D}
   * @memberof TileInfo
   */
  origin: Point2D = new Point2D()

  /**
   * 每张瓦片的大小,单位像素。
   * 默认值[256, 256]
   *
   * @date 22/03/2021
   * @type {number []}
   * @memberof TileInfo
   */
  size: number[] = [256, 256]

  /**
   * 空间参数信息
   *
   * @date 28/04/2021
   * @memberof TileInfo
   */
  spatialReference: SpatialReference = new SpatialReference()

  /**
   * 将该对象的实例转换为JSON对象。
   *
   * @date 22/03/2021
   * @return {*}  {Record<string, any>}
   * @memberof LOD
   */
  toJSON(): Record<string, any> {
    return {}
  }

  /**
   * 根据比例尺分母计算对应的级别
   *
   * @date 22/03/2021
   * @param {number} scale
   * @memberof TileInfo
   */
  scaleToZoom(scale: number): number {
    return 0
  }

  /**
   * 根据级别计算对应的比例尺分母
   *
   * @date 22/03/2021
   * @param {*} zoom
   * @return {*}  {number}
   * @memberof TileInfo
   */
  zoomToScale(zoom): number {
    return 0
  }

  /**
   * 通过服务端返回的Json对象构造LOD对象的实例
   *
   * @date 22/03/2021
   * @static
   * @param {Record<string, any>} json
   * @return {*}  {LOD}
   * @memberof LOD
   */
  fromJSON(json: Record<string, any>): TileInfo {
    const tileInfo = new TileInfo()
    return tileInfo
  }
}

/**
 * 瓦片图层
 *
 * @date 22/03/2021
 * @class TileLayer
 */
export abstract class TileLayer extends Layer {
  /**
   * Creates an instance of TileLayer.
   * @date 22/03/2021
   * @param {Record<string, any>} [properties]
   * @memberof TileLayer
   */
  constructor(properties?: Record<string, any>) {
    super(properties)

    this.type = LayerType.tile

    if (!properties) return

    if (properties.maxScale) this.maxScale = properties.maxScale
    if (properties.minScale) this.minScale = properties.minScale
    if (properties.tokenKey) this.tokenKey = properties.tokenKey
    if (properties.tokenValue) this.tokenValue = properties.tokenValue
  }

  /**
   * 图层显示的最大比例尺:在地图视图中超出该比例尺,图层将不再显示。
   * 默认值：0. 0表示该图层的显示不受最大比例尺的限制，可以无限放大。
   * maxScale < minScale
   * sample
   * The layer will not be visible when the view is zoomed in beyond a scale of 1:2,000
   * layer.maxScale = 2000;
   *
   * @date 22/03/2021
   * @memberof TileLayer
   */
  maxScale = 0

  /**
   * 图层显示的最小比例尺:在地图视图中超出该比例尺,图层将不再显示。
   * 默认值：0. 0表示该图层的显示不受最小比例尺的限制，可以无限缩小。
   *
   * @date 22/03/2021
   * @memberof TileLayer
   */
  minScale = 0

  /**
   * 瓦片信息
   *
   * @date 22/04/2021
   * @type {TileInfo}
   * @memberof TileLayer
   */
  titleInfo: TileInfo = new TileInfo()

  /**
   * token的参数名
   *
   * @date 22/03/2021
   * @memberof TileLayer
   */
  tokenKey = 'token'

  /**
   * token的参数值
   *
   * @date 22/03/2021
   * @memberof TileLayer
   */
  tokenValue = ''

  /**
   * 空间参数信息
   *
   * @date 28/04/2021
   * @memberof TileLayer
   */
  spatialReference: SpatialReference = new SpatialReference()

  /**
   * 根据级别、行号、列号生成对应的取图URL
   *
   * @date 23/03/2021
   * @abstract
   * @param {number} level  级别
   * @param {number} row    行号
   * @param {number} col    列号
   * @return {*}  {string}  url
   * @memberof TileLayer
   */
  abstract getTileUrl(level: number, row: number, col: number): string
}
