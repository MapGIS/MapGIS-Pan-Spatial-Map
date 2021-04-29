import { TileLayer } from './tile-layer'
import { LoadStatus, LayerType, Layer } from './layer'
import * as Zondy from '@mapgis/webclient-es6-service'
import axios from 'axios'

/**
 * ArcGIS瓦片服务图层
 *
 * @date 21/04/2021
 * @export
 * @class ArcGISTileLayer
 * @extends {TileLayer}
 */
export class ArcGISTileLayer extends TileLayer {
  /**
   * Creates an instance of ArcGISTileLayer.
   *
   * @date 21/04/2021
   * @param {Record<string, any>} properties
   * @memberof ArcGISTileLayer
   */
  constructor(properties?: Record<string, any>) {
    super(properties)

    this.type = LayerType.arcGISTile

    if (!properties) return

    if (properties.url) this.url = properties.url
  }

  /**
   * 服务基地址
   * 约定URL格式如下：http://[ip]/arcgis/rest/services/{tileName}/MapServer
   * @date 21/04/2021
   * @memberof ArcGISTileLayer
   */
  url = ''

  getTileUrl(level: number, row: number, col: number): string {
    throw new Error('Method not implemented.')
  }

  load(): Promise<Layer> {
    // 只有加载状态是没有加载过时，才会真正进行请求。
    if (this.loadStatus !== LoadStatus.notLoaded) {
      return new Promise(resolve => {
        resolve(this)
      }).then(data => {
        return this
      })
    }

    // 1.从URL中解析出ip、port、serverName参数
    let tempUrl: string = this.url
    if (this.url.includes('?')) {
      tempUrl = this.url.split('?')[0]
    }

    const getCapabilitiesURL = `${tempUrl}?f=json`

    const promise = new Promise((resolve, reject) => {
      // 2.进行网络请求。
      axios.get(getCapabilitiesURL).then(
        res => {
          // todo:暂不支持，需了解arcGIS瓦片服务的返回结果，并进行解析。
          this.loadStatus = LoadStatus.loaded
          resolve(this)
        },
        error => {
          reject(error)
        }
      )
    })

    return promise.then(data => {
      return this
    })
  }

  clone(): Layer {
    const result = new ArcGISTileLayer()

    Object.entries(this).forEach(element => {
      const key = element[0]
      const valueIndex = 1
      result[key] = this._deepClone(element[valueIndex])
    })

    return result
  }
}
