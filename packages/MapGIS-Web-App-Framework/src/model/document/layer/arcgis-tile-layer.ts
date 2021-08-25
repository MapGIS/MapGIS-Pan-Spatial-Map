import { TileLayer, LOD } from './tile-layer'
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

    this.type = LayerType.ArcGISTile

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

  /**
   * 服务的版本
   *
   * @date 22/04/2021
   * @memberof ArcGISTileLayer
   */
  version = ''

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
          if (res.data) {
            const metaData = res.data

            if (metaData && metaData.tileInfo) {
              const tileInfoJsonObject: any = metaData.tileInfo
              let startLevel = 0
              let endLevel = 0
              let i = 0

              if (tileInfoJsonObject.cols)
                this.tileInfo.size[0] = tileInfoJsonObject.cols
              if (tileInfoJsonObject.rows)
                this.tileInfo.size[1] = tileInfoJsonObject.rows

              if (tileInfoJsonObject.startLevel)
                startLevel = tileInfoJsonObject.startLevel

              if (tileInfoJsonObject.endLevel)
                endLevel = tileInfoJsonObject.endLevel

              if (tileInfoJsonObject.lods) {
                const lods: any[] = tileInfoJsonObject.lods

                if (lods.length > 0) {
                  for (i = startLevel; i <= lods.length - 1; i++) {
                    const lod = new LOD()

                    lod.level = lods[i].level
                    lod.levelValue = lods[i].level
                    // 如果空间参考系为经纬度，需要吧分辨率由度转换为米
                    lod.resolution = lods[i].resolution
                    lod.scale = lods[i].scale

                    this.tileInfo.lods.push(lod)
                  }
                }
              }
            }

            // 2.1获取图层全图范围
            if (metaData.fullExtent) {
              this.fullExtent = new Zondy.Common.Rectangle(
                metaData.fullExtent.xmin,
                metaData.fullExtent.ymin,
                metaData.fullExtent.xmax,
                metaData.fullExtent.ymax
              )
            }

            // 2.3 服务版本
            if (metaData.currentVersion) this.version = metaData.currentVersion

            // 2.4 描述
            if (metaData.description) this.description = metaData.description

            if (this.description === '') {
              if (metaData.serviceDescription)
                this.description = metaData.serviceDescription
            }

            // 2.5 空间参照系
            if (metaData.spatialReference) {
              if (metaData.spatialReference.wkid)
                this.spatialReference.wkid = metaData.spatialReference.wkid
            }
          }

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
