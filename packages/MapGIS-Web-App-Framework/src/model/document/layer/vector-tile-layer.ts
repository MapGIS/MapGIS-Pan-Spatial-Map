import * as Zondy from '@mapgis/webclient-es6-service'
import { LoadStatus, LayerType, Layer } from './layer'
import { IGSTileLayer } from './igs-tile-layer'
import axios from 'axios'
import { SpatialReference } from '../spatial-reference'

export class VectorTileLayer extends IGSTileLayer {
  /**
   * Creates an instance of VectorTileLayer.
   * @date 10/05/2021
   * @param {Record<string, any>} [properties]
   * @memberof VectorTileLayer
   */
  constructor(properties?: Record<string, any>) {
    super(properties)

    this.type = LayerType.VectorTile

    if (!properties) return

    if (properties.url) this.url = properties.url
  }

  /**
   * 服务基地址
   * 约定URL格式如下：http://develop.smaryun.com:6163/igs/rest/mrms/vtiles/styles/街道-墨卡托.json
   * 指向矢量瓦片图层所对应的style的URL。
   * @date 22/03/2021
   * @memberof VectorTileLayer
   */
  url = ''

  /**
   * 当前采用样式
   *
   * @date 10/05/2021
   * @type {(Record<string, any> | undefined)}
   * @memberof VectorTileLayer
   */
  currentStyle: Record<string, any> | undefined

  /**
   * 图层支持的样式列表
   *
   * @date 10/05/2021
   * @type {Record<string, any>[]}
   * @memberof VectorTileLayer
   */
  styleList: Record<string, any>[] = []

  /**
   * 空间参数信息
   *
   * @date 28/04/2021
   * @memberof VectorTileLayer
   */
  spatialReference: SpatialReference = new SpatialReference()

  load(): Promise<Layer> {
    // 只有加载状态是没有加载过时，才会真正进行请求。
    if (this.loadStatus !== LoadStatus.notLoaded) {
      return new Promise(resolve => {
        resolve(this)
      }).then(data => {
        return this
      })
    }

    // 1.获取url中的style地址列表。
    const styleUrlList: string[] = this.url.split(',')

    const promise = new Promise((resolve, reject) => {
      this.loadStatus = LoadStatus.loading
      styleUrlList.forEach((styleUrl, index) => {
        // 2.获取样式
        axios.get(styleUrl).then(
          res => {
            const { data } = res
            this.styleList.push(data)

            if (index === styleUrlList.length - 1) {
              if (this.styleList.length > 0)
                this.currentStyle = this.styleList[0]

              // 3.获取样式的sources中的瓦片服务地址
              if (this.currentStyle != undefined) {
                const tileUrls: string[] = this.getTileUrls(
                  this.currentStyle.sources
                )

                // 4.获取瓦片信息,当前只支持获取第0个tile的信息
                if (tileUrls && tileUrls.length > 0) {
                  const tileUrl = tileUrls[0]

                  // 4.1从URL中解析出ip、port、serverName参数
                  const baseUrl = tileUrl.substring(0, tileUrl.indexOf('/{'))

                  const parms = this._parseUrl(baseUrl)

                  const tileLayer = new Zondy.MRCS.TileLayer(parms)
                  this.loadStatus = LoadStatus.loading
                  tileLayer.getTileInfo(
                    res => {
                      if (res && res.TileInfo2) {
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
                }
              }
            }
          },
          error => {
            this.loadStatus = LoadStatus.failed
            reject(error)
          }
        )
      })
    })

    return promise.then(data => {
      return this
    })
  }

  /**
   * 深度克隆一个矢量瓦片图层
   *
   * @date 10/05/2021
   * @return {*}  {Layer}
   * @memberof VectorTileLayer
   */
  clone(): VectorTileLayer {
    const result = new VectorTileLayer()

    Object.entries(this).forEach(element => {
      const key = element[0]
      const valueIndex = 1
      result[key] = this._deepClone(element[valueIndex])
    })

    return result
  }

  protected getTileUrls(sources: Record<string, object>): string[] {
    const tileUrls: string[] = []

    Object.entries(sources).forEach(element => {
      const source: any = element[1]
      const tilesArray: string[] = source.tiles
      if (tilesArray != undefined && Array.isArray(tilesArray)) {
        tileUrls.push(...tilesArray)
      }
    })

    return tileUrls
  }
}
