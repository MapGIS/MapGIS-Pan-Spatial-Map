import * as Zondy from '@mapgis/webclient-es6-service'
import { MapImageLayer } from './map-image-layer'
import { LoadStatus, LayerType, Layer } from './layer'
import { ObjectTool } from '../../utils/object-tool'

/**
 * IGSMapImageLayer的子图层
 *
 * @date 01/04/2021
 * @export
 * @class Sublayer
 */
export class Sublayer {
  /**
   * 图层的唯一标识
   * 与服务器端约定的格式：x或x-y-z-...。图层索引-子图层索引-子图层索引
   * 该值在IGSMapImageLayer解析服务器端返回的图层树信息时生成。
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
   * @type {(IGSMapImageLayer | undefined)}
   * @memberof Sublayer
   */
  layer: IGSMapImageLayer | undefined

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
   * 几何类型
   *
   * @date 09/04/2021
   * @memberof Sublayer
   */
  geomType = ''

  /**
   * 系统库GUID
   *
   * @date 09/04/2021
   * @memberof Sublayer
   */
  sysLibraryGuid = ''

  /**
   * 通过json对象初始化该对象
   *
   * @date 30/03/2021
   * @param {Record<string, any>} jsonObject
   * @memberof Sublayer
   */
  fromJSON(jsonObject: Record<string, any>) {
    if (jsonObject.GroupMapLayerInfo) {
      jsonObject.GroupMapLayerInfo.forEach((element, index) => {
        const sublayer = new Sublayer()
        sublayer.layer = this.layer
        sublayer.id = `${this.id}-${index}`
        sublayer.fromJSON(element)

        this.sublayers.push(sublayer)
      })
    }

    if (jsonObject.LayerName) this.title = jsonObject.LayerName

    // 可见性
    if (jsonObject.State) {
      if (jsonObject.State === 'Invisible') {
        this.visible = false
      } else {
        this.visible = true
      }
    }

    if (jsonObject.URL) this.url = jsonObject.URL

    if (jsonObject.SysLibraryGuid)
      this.sysLibraryGuid = jsonObject.SysLibraryGuid

    if (jsonObject.GeomType) this.geomType = jsonObject.GeomType
  }

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
  clone(): Sublayer {
    const result = new Sublayer()

    Object.entries(this).forEach(element => {
      const key = element[0]
      const valueIndex = 1

      if (key === 'layer') {
        result[key] = element[valueIndex]
      } else if (key === 'sublayers') {
        const sublayers = element[valueIndex]
        const sublayersCopy: Sublayer[] = []
        let sublayerCopy: Sublayer | undefined

        sublayers.forEach(sublayer => {
          sublayerCopy = sublayer.clone()

          if (sublayerCopy) {
            sublayerCopy.layer = result.layer
            sublayersCopy.push(sublayerCopy)
          }
        })

        result[key] = sublayersCopy
      } else {
        result[key] = ObjectTool.deepClone(element[valueIndex])
      }
    })

    return result
  }
}

export class IGSMapImageLayer extends MapImageLayer {
  /**
   * Creates an instance of IGSMapImageLayer.
   *
   * @date 22/03/2021
   * @param {Record<string, any>} properties
   * @memberof IGSMapImageLayer
   */
  constructor(properties?: Record<string, any>) {
    super(properties)

    this.type = LayerType.IGSMapImage

    if (!properties) return

    if (properties.url) this.url = properties.url
    if (properties.sublayers) this.sublayers = properties.sublayers
  }

  /**
   * 子图层
   *
   * @date 01/04/2021
   * @type {Sublayer[]}
   * @memberof IGSMapImageLayer
   */
  sublayers: Sublayer[] = []

  /**
   * 服务基地址
   * 约定URL格式如下：http://[host]:[port]/igs/rest/mrms/docs/{docName}
   * @date 22/03/2021
   * @memberof IGSMapImageLayer
   */
  url = ''

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

  getImageUrl(extent: any, width: number, height: number): string {
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

    // 1.从URL中解析出ip、port、docName参数
    const parms = this._parseUrl(this.url)

    const promise = new Promise((resolve, reject) => {
      // 2.调用es6service中的接口进行网络请求。
      const mapdoc = new Zondy.MRCS.MapDoc(parms)
      this.loadStatus = LoadStatus.loading
      mapdoc.getMapDocTree(
        res => {
          if (res && res.MapInfos && res.MapInfos.length > 0) {
            const mapInfo = res.MapInfos[0]
            if (mapInfo.Range) {
              // 2.1 MapInfo
              // 2.1.1 Range(获取图层全图范围)
              const range: number[] = res.MapInfos[0].Range.split(',')
              if (range) {
                this.fullExtent = new Zondy.Common.Rectangle(
                  range[0],
                  range[1],
                  range[2],
                  range[3]
                )
              }
            }

            // 2.1.2 CatalogLayer(获取子图层，并计算各图层的layerIndex)
            if (mapInfo.CatalogLayer) {
              mapInfo.CatalogLayer.forEach((element, index) => {
                const sublayer = new Sublayer()
                sublayer.layer = this
                sublayer.id = `${index}`
                sublayer.fromJSON(element)
                this.sublayers.push(sublayer)
              })
            }
          }

          // 3 设置参数默认值
          // 3.1 获取所有子图层(包含子图层的子图层)
          this.sublayers.forEach(element => {
            this.getSubLayers(element, this._allSublayers)
          })

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
   * 创建一个深度克隆的IGSMapImageLayer
   *
   * @date 02/04/2021
   * @return {*}  {IGSMapImageLayer}
   * @memberof IGSMapImageLayer
   */
  clone(): IGSMapImageLayer {
    const result = new IGSMapImageLayer()

    Object.entries(this).forEach(element => {
      const key = element[0]
      const valueIndex = 1

      if (key === '_allSublayers') {
      } else if (key === 'sublayers') {
        const sublayers = element[valueIndex]
        const sublayersCopy: Sublayer[] = []
        let sublayerCopy: Sublayer | undefined

        sublayers.forEach(sublayer => {
          sublayerCopy = sublayer.clone()

          if (sublayerCopy) {
            sublayersCopy.push(sublayerCopy)
          }
        })

        result[key] = sublayersCopy
      } else {
        result[key] = this._deepClone(element[valueIndex])
      }
    })

    // 给所有的sublayers设置layer属性的值
    result.allSublayers.forEach(sublayer => {
      sublayer.layer = result
    })

    return result
  }

  // 所有的子图层,包括子图层的子图层
  private _allSublayers: Sublayer[] = []

  private getSubLayers(subLayer: Sublayer, sublayers: Sublayer[]) {
    sublayers.push(subLayer)
    if (subLayer.sublayers.length > 0) {
      subLayer.sublayers.forEach(element => {
        this.getSubLayers(element, sublayers)
      })
    }
  }

  /**
   * url解析,提取对应的ip、port、docName
   * 约定URL格式如下：http://[host]:[port]/igs/rest/mrms/docs/{docName}
   *
   * @date 23/03/2021
   * @private
   * @param {*} url
   * @return {*}  {{ ip; port; docName }}
   * @memberof IGSTileLayer
   */
  _parseUrl(url): { ip; port; docName } {
    const ipReg = '/://[a-zA-Z0-9]+:*/g'
    const portReg = '/:+[0-9]+//g'

    const serverType = 'igs/rest/mrms/docs/'
    const indexServer = url.search(serverType)
    const indexName = indexServer + serverType.length
    const docName = url.substr(indexName)

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

    return { ip, port, docName }
  }
}
