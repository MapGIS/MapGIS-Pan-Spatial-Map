import { Rectangle } from '@mapgis/webclient-es6-service/common/Rectangle'
import { LoadStatus, LayerType, Layer } from './layer'

/**
 * 地图服务图层
 *
 * @date 23/03/2021
 * @abstract
 * @class MapImageLayer
 * @extends {Layer}
 */
export abstract class MapImageLayer extends Layer {
  /**
   * Creates an instance of TileLayer.
   * @date 22/03/2021
   * @param {Record<string, any>} [properties]
   * @memberof TileLayer
   */
  constructor(properties?: Record<string, any>) {
    super()

    this.type = LayerType.mapImage

    if (!properties) return

    if (properties.maxScale) this.maxScale = properties.maxScale
    if (properties.minScale) this.minScale = properties.minScale
    if (properties.tokenKey) this.tokenKey = properties.tokenKey
    if (properties.tokenValue) this.tokenValue = properties.tokenValue
    if (properties.imageFormat) this.imageFormat = properties.imageFormat
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
   * token的参数名
   *
   * @date 22/03/2021
   * @memberof TileLayer
   */
  tokenKey = ''

  /**
   * token的参数值
   *
   * @date 22/03/2021
   * @memberof TileLayer
   */
  tokenValue = ''

  /**
   * 图片格式
   *
   * @date 23/03/2021
   * @memberof MapImageLayer
   */
  imageFormat = 'png'

  /**
   * 根据出图的范围、图片的宽高获取图片的url
   *
   * @date 23/03/2021
   * @abstract
   * @param {Rectangle} extent  范围
   * @param {number} width      宽度
   * @param {number} height     高度
   * @return {*}  {string}      url
   * @memberof MapImageLayer
   */
  abstract getImageUrl(extent: Rectangle, width: number, height: number): string
}
