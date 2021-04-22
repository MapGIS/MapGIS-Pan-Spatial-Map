import * as Zondy from '@mapgis/webclient-es6-service'
import { MapImageLayer, Sublayer } from './map-image-layer'
import { LoadStatus, LayerType, Layer } from './layer'
import axios from 'axios'
import { ObjectTool } from '../../utils/object-tool'
/**
 * ArcGIS地图服务图层
 *
 * @date 21/04/2021
 * @export
 * @class ArcGISMapImageLayer
 * @extends {TileLayer}
 */
export class ArcGISMapImageLayer extends MapImageLayer {
  /**
   * Creates an instance of ArcGISMapImageLayer.
   *
   * @date 21/04/2021
   * @param {Record<string, any>} properties
   * @memberof ArcGISMapImageLayer
   */
  constructor(properties?: Record<string, any>) {
    super(properties)

    this.type = LayerType.arcGISMapImage

    if (!properties) return

    if (properties.url) this.url = properties.url
  }

  /**
   * 表示该图层支持的能力。如："Map,Query,Data"
   *
   * @date 22/04/2021
   * @memberof ArcGISMapImageLayer
   */
  capabilities = ''

  /**
   * 该服务可生成的图片的最大高度，单位：像素
   *
   * @date 22/04/2021
   * @memberof ArcGISMapImageLayer
   */
  imageMaxHeight = 2048

  /**
   * 该服务可生成的图片的最大宽度，单位：像素
   *
   * @date 22/04/2021
   * @memberof ArcGISMapImageLayer
   */
  imageMaxWidth = 2048

  /**
   * 支持的最大比例尺，值为比例尺的分母
   *
   * @date 22/04/2021
   * @memberof ArcGISMapImageLayer
   */
  maxScale = 0.0

  /**
   * 支持的最小比例尺，值为比例尺的分母
   *
   * @date 22/04/2021
   * @memberof ArcGISMapImageLayer
   */
  minScale = 0.0

  /**
   * 服务的版本
   *
   * @date 22/04/2021
   * @memberof ArcGISMapImageLayer
   */
  version = ''

  /**
   * 服务基地址
   * 约定URL格式如下：http://[ip]/arcgis/rest/services/{mapName}/MapServer
   * @date 21/04/2021
   * @memberof ArcGISMapImageLayer
   */
  url = ''

  getImageUrl(extent: any, width: number, height: number): string {
    throw new Error('Method not implemented.')
  }

  load(): Promise<Layer> {
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
          debugger

          if (res.data) {
            const metaData = res.data

            // 2.1获取图层全图范围
            if (metaData.fullExtent) {
              this.fullExtent = new Zondy.Common.Rectangle(
                metaData.fullExtent.xmin,
                metaData.fullExtent.ymin,
                metaData.fullExtent.xmax,
                metaData.fullExtent.ymax
              )
            }

            // 2.2 支持的能力
            if (metaData.capabilities) this.capabilities = metaData.capabilities

            // 2.3 服务版本
            if (metaData.currentVersion) this.version = metaData.currentVersion

            // 2.4 描述
            if (metaData.description) this.description = metaData.description

            if (this.description === '') {
              if (metaData.serviceDescription)
                this.description = metaData.serviceDescription
            }

            // 2.5子图层
            if (metaData.layers) {
              metaData.layers.forEach(sublayerConfig => {
                const sublayer = new ArcGISSublayer()
                sublayer.layer = this
                sublayer.fromJSON(sublayerConfig)
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
        error => {
          reject(error)
        }
      )
    })

    return promise.then(data => {
      return this
    })
  }

  clone(): ArcGISMapImageLayer {
    const result = new ArcGISMapImageLayer()

    Object.entries(this).forEach(element => {
      const key = element[0]
      const valueIndex = 1

      if (key === '_allSublayers') {
      } else if (key === 'sublayers') {
        const sublayers = element[valueIndex]
        const sublayersCopy: ArcGISSublayer[] = []
        let sublayerCopy: ArcGISSublayer | undefined

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
}

/**
 * IGSMapImageLayer的子图层
 *
 * @date 01/04/2021
 * @export
 * @class ArcGISSublayer
 */
export class ArcGISSublayer extends Sublayer {
  /**
   * 几何类型,如："esriGeometryPolyline"
   *
   * @date 09/04/2021
   * @memberof ArcGISSublayer
   */
  geomType = ''

  /**
   * 支持的最大比例尺，值为比例尺的分母
   *
   * @date 22/04/2021
   * @memberof ArcGISSublayer
   */
  maxScale = 0.0

  /**
   * 支持的最小比例尺，值为比例尺的分母
   *
   * @date 22/04/2021
   * @memberof ArcGISSublayer
   */
  minScale = 0.0

  /**
   * 通过json对象初始化该对象
   *
   * @date 30/03/2021
   * @param {Record<string, any>} jsonObject
   * @memberof ArcGISSublayer
   */
  fromJSON(jsonObject: Record<string, any>) {
    if (jsonObject.id) this.id = jsonObject.id
    if (jsonObject.name) this.title = jsonObject.name
    if (jsonObject.defaultVisibility)
      this.visible = jsonObject.defaultVisibility

    if (jsonObject.geometryType) this.geomType = jsonObject.geometryType
    if (jsonObject.maxScale) this.maxScale = jsonObject.maxScale
    if (jsonObject.maxScale) this.minScale = jsonObject.minScale

    // parentLayerId、subLayerIds、type

    // todo:ArcGISSublayer暂不支持嵌套。需了解arcGIS瓦片服务的返回结果，并进行解析。
  }

  /**
   * 将该对象转换为json对象
   *
   * @date 30/03/2021
   * @return {*}  {Record<string, any>}
   * @memberof ArcGISSublayer
   */
  toJSON(): Record<string, any> {
    return {}
  }

  /**
   * 创建一个深度克隆的sublayer
   *
   * @date 02/04/2021
   * @return {*}  {ArcGISSublayer}
   * @memberof ArcGISSublayer
   */
  clone(): ArcGISSublayer {
    const result = new ArcGISSublayer()

    Object.entries(this).forEach(element => {
      const key = element[0]
      const valueIndex = 1

      if (key === 'layer') {
        result[key] = element[valueIndex]
      } else if (key === 'sublayers') {
        const sublayers = element[valueIndex]
        const sublayersCopy: ArcGISSublayer[] = []
        let sublayerCopy: ArcGISSublayer | undefined

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
