import * as Zondy from '@mapgis/webclient-es6-service'
import { TileLayer, LOD, TileInfo } from './tile-layer'
import { LoadStatus, LayerType, Layer } from './layer'
/**
 * IGServer 瓦片服务图层
 *
 * @date 22/03/2021
 * @class IGSTileLayer
 * @extends {TileLayer}
 */
export class IGSTileLayer extends TileLayer {
  /**
   * Creates an instance of IGSTileLayer.
   *
   * @date 22/03/2021
   * @param {Record<string, any>} properties
   * @memberof IGSTileLayer
   */
  constructor(properties?: Record<string, any>) {
    super(properties)

    this.type = LayerType.IGSTile

    if (!properties) return

    if (properties.url) this.url = properties.url
  }

  /**
   * 服务基地址
   * 约定URL格式如下：[protocol]://[ip]:[port]/igs/rest/mrms/tile/{hdfName}
   * @date 22/03/2021
   * @memberof IGSTileLayer
   */
  url = ''

  getTileUrl(level: number, row: number, col: number): string {
    throw new Error('Method not implemented.')
  }

  load(): Promise<import('./layer').Layer> {
    // 只有加载状态是没有加载过时，才会真正进行请求。
    if (this.loadStatus !== LoadStatus.notLoaded) {
      return new Promise(resolve => {
        resolve(this)
      }).then(data => {
        return this
      })
    }

    // 1.从URL中解析出ip、port、serverName参数
    const parms = this._parseUrl(this.url)

    const promise = new Promise((resolve, reject) => {
      // 2.调用es6service中的接口进行网络请求。
      const tileLayer = new Zondy.MRCS.TileLayer(parms)
      this.loadStatus = LoadStatus.loading
      tileLayer.getTileInfo(
        res => {
          if (res && res.TileInfo2) {
            // 2.解析瓦片元数据信息
            this._praseTileInfo(res.TileInfo2)
          }

          this.loadStatus = LoadStatus.loaded
          resolve(this)
        },
        failInfo => {
          this.loadStatus = LoadStatus.failed
          reject(failInfo)
        }
      )
    })

    return promise.then(data => {
      return this
    })
  }

  /**
   * 创建一个深度克隆的IGSTileLayer
   *
   * @date 06/04/2021
   * @return {*}  {IGSTileLayer}
   * @memberof IGSTileLayer
   */
  clone(): IGSTileLayer {
    const result = new IGSTileLayer()

    Object.entries(this).forEach(element => {
      const key = element[0]
      const valueIndex = 1
      result[key] = this._deepClone(element[valueIndex])
    })

    return result
  }

  /**
   * url解析,提取对应的ip、port、serverName
   * 约定URL格式如下：[protocol]://[ip]:[port]/igs/rest/mrms/tile/{hdfName}
   *
   * @date 23/03/2021
   * @private
   * @param {*} url
   * @return {*}  {{ ip; port; tileName }}
   * @memberof IGSTileLayer
   */
  _parseUrl(url): { ip; port; tileName } {
    const ipReg = '/://[a-zA-Z0-9]+:*/g'
    const portReg = '/:+[0-9]+//g'

    const serverType = 'igs/rest/mrms/tile/'
    const indexServer = url.search(serverType)
    const indexName = indexServer + serverType.length
    const tileName = url.substr(indexName)

    const ips = url.match(/:\/\/[a-zA-Z0-9.]+:*/g)
    const ports = url.match(/:+[0-9]+\//g)

    const matchIp = ips ? ips[0] : '://localhost'
    const matchPort = ports ? ports[0] : ':6163'
    let ip = ''
    let port = ''
    if (matchIp && matchIp.length > 3) {
      ip = matchIp.slice(3, matchIp.length - 1)
    }
    if (matchPort && matchPort.length > 2) {
      port = matchPort.slice(1, matchPort.length - 1)
    }

    return { ip, port, tileName }
  }

  protected _praseTileInfo(tileInfo: Record<string, object>) {
    const fullExtent: any = tileInfo.fullExtent
    if (fullExtent) {
      this.fullExtent = new Zondy.Common.Rectangle(
        fullExtent.xmin,
        fullExtent.ymin,
        fullExtent.xmax,
        fullExtent.ymax
      )
    }

    // 2.2获取TileInfo
    if (tileInfo.tileInfo) {
      const tileInfoJsonObject: any = tileInfo.tileInfo
      let startLevel = 0
      let endLevel = 0
      let i = 0

      if (tileInfoJsonObject.startLevel)
        startLevel = tileInfoJsonObject.startLevel

      if (tileInfoJsonObject.endLevel) endLevel = tileInfoJsonObject.endLevel

      if (tileInfoJsonObject.lods) {
        const lods: any[] = tileInfoJsonObject.lods

        if (lods.length > 0) {
          for (i = startLevel; i <= endLevel; i++) {
            const lod = new LOD()

            lod.level = lods[i].level
            lod.levelValue = lods[i].level
            lod.resolution = lods[i].resolution
            lod.scale = lods[i].scale

            this.titleInfo.lods.push(lod)
          }
        }
      }
    }
  }
}
