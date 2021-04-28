import * as Zondy from '@mapgis/webclient-es6-service'
import { TileLayer } from './tile-layer'
import { LoadStatus, LayerType, Layer } from './layer'
import { ObjectTool } from '../../utils/object-tool'

/**
 * 互联网瓦片服务图层
 * @date 23/04/2021
 * @export
 * @class WebTileLayer
 * @extends {TileLayer}
 */
export class WebTileLayer extends TileLayer {
  /**
   * Creates an instance of WebTileLayer.
   * @date 23/04/2021
   * @param {Record<string, any>} [properties]
   * @memberof WebTileLayer
   */
  constructor(properties?: Record<string, any>) {
    super(properties)

    this.type = LayerType.webTile
    // this.fullExtent = new Zondy.Common.Rectangle(
    //   -20037508.3427892,
    //   -20037508.3427892,
    //   20037508.3427892,
    //   20037508.3427892
    // )

    this.fullExtent = new Zondy.Common.Rectangle(-180, -85.06, 180, 85.06)

    if (!properties) return

    if (properties.subDomains)
      this.subDomains = ObjectTool.deepClone(properties.subDomains)

    if (properties.urlTemplate) this.urlTemplate = properties.urlTemplate
  }

  /**
   * 子域名列表，用于加快瓦片请求速度。如果指定了子域，urlTemplate应该包含{subDomain}占位符。
   * 如：urlTemplate: 'https://stamen-tiles-{subDomain}.a.ssl.fastly.net/terrain/{z}/{x}/{y}.png'
   * subDomains: ['a', 'b', 'c', 'd']
   * @date 23/04/2021
   * @type {string[]}
   * @memberof WebTileLayer
   */
  subDomains: string[] = []

  /**
   * 瓦片的URL模板。如果指定了子域，urlTemplate应该包含{subDomain}占位符。
   * 格式如下：'https://stamen-tiles-{subDomain}.a.ssl.fastly.net/terrain/{z}/{x}/{y}.png'
   * @date 23/04/2021
   * @type {string}
   * @memberof WebTileLayer
   */
  urlTemplate = ''

  getTileUrl(level: number, row: number, col: number): string {
    throw new Error('Method not implemented.')
  }

  load(): Promise<Layer> {
    return new Promise(resolve => {
      this.loadStatus = LoadStatus.loaded
      resolve(this)
    }).then(data => {
      return this
    })
  }

  clone(): Layer {
    const result = new WebTileLayer()

    Object.entries(this).forEach(element => {
      const key = element[0]
      const valueIndex = 1
      result[key] = this._deepClone(element[valueIndex])
    })

    return result
  }
}
