import { Rectangle } from '@mapgis/webclient-es6-service/common/Rectangle'
import { LoadStatus, LayerType, Layer } from './layer'
import { SpatialReference } from '../spatial-reference'

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
    super(properties)

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
   * 子图层
   *
   * @date 01/04/2021
   * @type {Sublayer[]}
   * @memberof IGSMapImageLayer
   */
  sublayers: Sublayer[] = []

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
   * 所有的子图层
   * 包括子图层的子图层
   *
   * @date 01/04/2021
   * @type {Sublayer []}
   * @memberof IGSMapImageLayer
   */
  get allSublayers(): Sublayer[] {
    if (this._allSublayers.length === 0) {
      this.sublayers.forEach(element => {
        this.getSubLayers(element, this._allSublayers)
      })
    }

    return this._allSublayers
  }

  /**
   * 通过子图层ID获取子图层
   *
   * @date 01/04/2021
   * @param {string} sublayerID
   * @return {*}  {Sublayer}
   * @memberof IGSMapImageLayer
   */
  findSublayerById(sublayerID: string): Sublayer | undefined {
    let sublayer: Sublayer | undefined
    this.allSublayers.forEach(element => {
      if (element.id === sublayerID) {
        sublayer = element
      }
    })

    return sublayer
  }

  // 所有的子图层,包括子图层的子图层
  protected _allSublayers: Sublayer[] = []

  protected getSubLayers(subLayer: Sublayer, sublayers: Sublayer[]) {
    sublayers.push(subLayer)
    if (subLayer.sublayers.length > 0) {
      subLayer.sublayers.forEach(element => {
        this.getSubLayers(element, sublayers)
      })
    }
  }

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

/**
 * MapImageLayer的子图层
 *
 * @date 01/04/2021
 * @export
 * @class Sublayer
 */
export abstract class Sublayer {
  /**
   * 图层的唯一标识
   * 在服务器的请求参数中,用图层的id代表该图层
   *
   * @date 01/04/2021
   * @memberof Sublayer
   */
  id = ''

  /**
   * 该子图层所属的图层
   *
   * 该子图属于哪个图层
   *
   * @date 01/04/2021
   * @type {(MapImageLayer | undefined)}
   * @memberof Sublayer
   */
  layer: MapImageLayer | undefined

  /**
   * 子图层列表
   * 子图层支持多层嵌套
   *
   * @date 01/04/2021
   * @type {Sublayer[]}
   * @memberof Sublayer
   */
  sublayers: Sublayer[] = []

  /**
   * 标题
   * 用于在图层列表或图例中标识该图层
   *
   * @date 01/04/2021
   * @memberof Sublayer
   */
  title = ''

  /**
   * 子图层的url
   *
   * @date 01/04/2021
   * @memberof Sublayer
   */
  url = ''

  /**
   * 是否可见
   *
   * @date 01/04/2021
   * @memberof Sublayer
   */
  visible = true

  /**
   * 空间参数信息
   *
   * @date 28/04/2021
   * @memberof TileLayer
   */
  spatialReference = new SpatialReference()

  /**
   * 通过json对象初始化该对象
   *
   * @date 30/03/2021
   * @param {Record<string, any>} jsonObject
   * @memberof Sublayer
   */
  abstract fromJSON(jsonObject: Record<string, any>)

  /**
   * 将该对象转换为json对象
   *
   * @date 30/03/2021
   * @return {*}  {Record<string, any>}
   * @memberof Sublayer
   */
  toJSON(): Record<string, any> {
    return {}
  }

  /**
   * 创建一个深度克隆的sublayer
   *
   * @date 02/04/2021
   * @return {*}  {Sublayer}
   * @memberof Sublayer
   */
  abstract clone(): Sublayer
}
