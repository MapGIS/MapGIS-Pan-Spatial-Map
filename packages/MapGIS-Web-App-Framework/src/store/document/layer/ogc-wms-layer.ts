import { Rectangle } from '@mapgis/webclient-es6-service/common/Rectangle'
import * as Zondy from '@mapgis/webclient-es6-service'
import axios from 'axios'
import { LoadStatus, LayerType, Layer } from './layer'
import { ObjectTool } from '../../utils/object-tool'
/**
 * OGCWMSLayer的子图层
 *
 * @date 30/03/2021
 * @export
 * @class WMSSublayer
 */
export class WMSSublayer {
  /**
   * 描述
   *
   * @date 30/03/2021
   * @memberof WMSSublayer
   */
  description = ''

  /**
   * 全图范围
   *
   * @date 30/03/2021
   * @type {Rectangle}
   * @memberof WMSSublayer
   */
  fullExtent: Rectangle | undefined

  /**
   * id
   *
   * @date 30/03/2021
   * @memberof WMSSublayer
   */
  id = ''

  /**
   * 该WMSSublayer所属的OGCWMSLayer
   *
   * @date 30/03/2021
   * @type {OGCWMSLayer}
   * @memberof WMSSublayer
   */
  layer: OGCWMSLayer | undefined

  /**
   * 是否显示在图例中
   *
   * @date 30/03/2021
   * @memberof WMSSublayer
   */
  legendEnabled = true

  /**
   * 图例的URL
   *
   * @date 30/03/2021
   * @memberof WMSSublayer
   */
  legendUrl = ''

  /**
   * 名称
   *
   * @date 30/03/2021
   * @memberof WMSSublayer
   */
  name = ''

  /**
   * 是否参与查询
   *
   * @date 30/03/2021
   * @memberof WMSSublayer
   */
  queryable = true

  /**
   * 空间参照系列表
   *
   * @date 30/03/2021
   * @type {number[]}
   * @memberof WMSSublayer
   */
  spatialReferences: number[] = []

  /**
   * 子图层列表
   *
   * @date 30/03/2021
   * @type {WMSSublayer []}
   * @memberof WMSSublayer
   */
  sublayers: WMSSublayer[] = []

  /**
   * 标题
   * 用于在图层列表或图例中标识该子图层
   *
   * @date 30/03/2021
   * @memberof WMSSublayer
   */
  title = ''

  /**
   * 是否显示
   *
   * @date 30/03/2021
   * @memberof WMSSublayer
   */
  visible = true

  /**
   * 通过json对象初始化该对象
   *
   * @date 30/03/2021
   * @param {Record<string, any>} jsonObject
   * @memberof WMSSublayer
   */
  fromJSON(jsonObject: Record<string, any>) {
    if (jsonObject.Abstract) this.description = jsonObject.Abstract

    if (jsonObject.BoundingBox && jsonObject.BoundingBox.length > 0) {
      const { extent } = jsonObject.BoundingBox[0]
      this.fullExtent = new Rectangle(
        extent[0],
        extent[1],
        extent[2],
        extent[3]
      )
    }

    if (jsonObject.Name) this.name = jsonObject.Name

    if (jsonObject.SRS) {
      jsonObject.SRS.forEach(element => {
        const epsgCode: string[] = element.split(':')
        this.spatialReferences.push(parseInt(epsgCode[1]))
      })
    }

    if (jsonObject.Title) this.title = jsonObject.Title

    if (jsonObject.queryable) this.queryable = jsonObject.queryable

    if (jsonObject.Layer) {
      if (Array.isArray(jsonObject.Layer)) {
        jsonObject.Layer.forEach((element, index) => {
          const sublayer: WMSSublayer = new WMSSublayer()
          sublayer.layer = this.layer
          sublayer.id = `${this.id}-${index}`
          sublayer.fromJSON(element)

          this.sublayers.push(sublayer)
        })
      } else {
        const sublayer: WMSSublayer = new WMSSublayer()

        sublayer.layer = this.layer

        sublayer.fromJSON(jsonObject.Layer)

        this.sublayers.push(sublayer)
      }
    }

    // 设置默认参数
    if (!this.fullExtent) {
      if (this.sublayers.length > 0) {
        this.fullExtent = this.sublayers[0].fullExtent
      }
    }
  }

  /**
   * 将该对象转换为json对象
   *
   * @date 30/03/2021
   * @return {*}  {Record<string, any>}
   * @memberof WMSSublayer
   */
  toJSON(): Record<string, any> {
    return {}
  }

  /**
   * 创建一个深度克隆的WMSSublayer
   *
   * @date 02/04/2021
   * @return {*}  {WMSSublayer}
   * @memberof WMSSublayer
   */
  clone(): WMSSublayer {
    const result = new WMSSublayer()

    Object.entries(this).forEach(element => {
      const key = element[0]
      const valueIndex = 1

      if (key === 'layer') {
        result[key] = element[valueIndex]
      } else if (key === 'sublayers') {
        const sublayers = element[valueIndex]
        const sublayersCopy: WMSSublayer[] = []
        let sublayerCopy: WMSSublayer | undefined

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

/**
 * OGCWMS服务图层
 *
 * @date 30/03/2021
 * @export
 * @class OGCWMSLayer
 * @extends {Layer}
 */
export class OGCWMSLayer extends Layer {
  clone(): Layer {
    const result = new OGCWMSLayer()

    Object.entries(this).forEach(element => {
      const key = element[0]
      const valueIndex = 1

      if (key === '_allSublayers') {
      } else if (key === 'sublayers') {
        const sublayers = element[valueIndex]
        const sublayersCopy: WMSSublayer[] = []
        let sublayerCopy: WMSSublayer | undefined

        sublayers.forEach(sublayer => {
          sublayerCopy = sublayer.clone()

          if (sublayerCopy) {
            sublayerCopy.layer = result
            sublayersCopy.push(sublayerCopy)
          }
        })

        result[key] = sublayersCopy
      } else {
        result[key] = this._deepClone(element[valueIndex])
      }
    })

    return result
  }

  /**
   * Creates an instance of OGCWMSLayer.
   *
   * @date 22/03/2021
   * @param {Record<string, any>} properties
   * @memberof OGCWMSLayer
   */
  constructor(properties?: Record<string, any>) {
    super()

    this.type = LayerType.OGCWMS

    if (!properties) return

    if (properties.url) this.url = properties.url
    if (properties.maxScale) this.maxScale = properties.maxScale
    if (properties.minScale) this.minScale = properties.minScale
    if (properties.tokenKey) this.tokenKey = properties.tokenKey
    if (properties.tokenValue) this.tokenValue = properties.tokenValue
  }

  /**
   * 所有的子图层
   * 包括子图层的子图层
   *
   * @date 01/04/2021
   * @type {WMSSublayer []}
   * @memberof OGCWMSLayer
   */
  get allSublayers(): WMSSublayer[] {
    if (this._allSublayers.length === 0) {
      this.sublayers.forEach(element => {
        this.getSubLayers(element, this._allSublayers)
      })
    }
    return this._allSublayers
  }

  /**
   * 描述
   *
   * @date 30/03/2021
   * @memberof OGCWMSLayer
   */
  description = ''

  /**
   * 当前请求的图片格式（MIME type）
   *
   * @date 30/03/2021
   * @memberof OGCWMSLayer
   */
  imageFormat = ''

  /**
   * 支持的图片格式列表
   * 从GetCapabilities请求中获取的该图层支持的图片格式列表
   *
   * @date 30/03/2021
   * @memberof OGCWMSLayer
   */
  imageFormats: string[] = []

  /**
   * 图片背景是否透明
   *
   * @date 30/03/2021
   * @memberof OGCWMSLayer
   */
  imageTransparency = true

  /**
   * 图层显示的最大比例尺:在地图视图中超出该比例尺,图层将不再显示。
   * 默认值：0. 0表示该图层的显示不受最大比例尺的限制，可以无限放大。
   * maxScale < minScale
   * sample
   * The layer will not be visible when the view is zoomed in beyond a scale of 1:2,000
   * layer.maxScale = 2000;
   *
   * @date 30/03/2021
   * @memberof OGCWMSLayer
   */
  maxScale = 0

  /**
   * 图层显示的最小比例尺:在地图视图中超出该比例尺,图层将不再显示。
   * 默认值：0. 0表示该图层的显示不受最小比例尺的限制，可以无限缩小。
   *
   * @date 30/03/2021
   * @memberof OGCWMSLayer
   */
  minScale = 0

  /**
   * 子图层列表
   *
   * @date 30/03/2021
   * @type {WMSSublayer []}
   * @memberof OGCWMSLayer
   */
  sublayers: WMSSublayer[] = []

  /**
   * token的参数名
   *
   * @date 30/03/2021
   * @memberof OGCWMSLayer
   */
  tokenKey = ''

  /**
   * token的参数值
   *
   * @date 30/03/2021
   * @memberof OGCWMSLayer
   */
  tokenValue = ''

  /**
   * 服务基地址
   * 约定URL格式如下：
   * MapGIS:http://develop.smaryun.com:6163/igs/rest/ogc/doc/北京市/WMSServer
   * ArcGIS:http://219.142.81.85/arcgis/services/10wanZH/MapServer/WMSServer
   * 吉威：
   * @date 30/03/2021
   * @memberof OGCWMSLayer
   */
  url = ''

  /**
   * wms标准的版本
   *
   * @date 31/03/2021
   * @memberof OGCWMSLayer
   */
  version = ''

  /**
   * 根据id获取对应的子图层
   *
   * @date 30/03/2021
   * @return {*}  {WMTSSublayer}
   * @memberof OGCWMSLayer
   */
  findSublayerById(id: string): WMSSublayer | undefined {
    let sublayer: WMSSublayer | undefined
    this.allSublayers.forEach(element => {
      if (element.id === id) {
        sublayer = element
      }
    })

    return sublayer
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
    // 1.通过url(基地址)生成获取元数据的URL
    const getCapabilitiesURL = OGCWMSLayer.generateGetCapabilitiesURL(this.url)

    // 2.发起网络请求
    const promise = new Promise((resolve, reject) => {
      this.loadStatus = LoadStatus.loading
      axios.get(getCapabilitiesURL).then(
        res => {
          const { data } = res
          if (!data) {
            resolve(undefined)
          } else {
            const parser = new Zondy.OGC.WMSCapabilities()
            const result = parser.read(data)

            // 3.解析请求结果
            // 3.1 Capability
            // 3.1.1 Layer
            if (result.Capability.Layer) {
              if (Array.isArray(result.Capability.Layer)) {
                result.Capability.Layer.forEach((element, index) => {
                  const sublayer: WMSSublayer = new WMSSublayer()
                  sublayer.layer = this
                  sublayer.id = `${index}`
                  sublayer.fromJSON(element)

                  this.sublayers.push(sublayer)
                })
              } else {
                const sublayer: WMSSublayer = new WMSSublayer()

                sublayer.layer = this
                sublayer.id = '0'

                sublayer.fromJSON(result.Capability.Layer)

                this.sublayers.push(sublayer)
              }
            }

            // 3.1.2 Request
            if (result.Capability.Request) {
              // 3.1.2.1 GetMap
              if (result.Capability.Request.GetMap) {
                // 3.1.2.1.1 Format
                if (result.Capability.Request.GetMap.Format) {
                  this.imageFormats = result.Capability.Request.GetMap.Format
                }
              }
            }

            // 3.2 Service
            if (result.Service) {
              // 3.2.1 Abstract
              if (result.Service.Abstract)
                this.description = result.Service.Abstract
            }

            // 3.3 version
            if (result.version) this.version = result.version

            // 4.设置默认参数
            // 4.1
            if (this.imageFormats.length > 0) {
              ;[this.imageFormat] = this.imageFormats
            }

            // 4.2
            if (this.sublayers.length > 0) {
              this.fullExtent = this.sublayers[0].fullExtent
            }

            // 4.3 获取所有子图层(包含子图层的子图层)
            this.sublayers.forEach(element => {
              this.getSubLayers(element, this.allSublayers)
            })

            this.loadStatus = LoadStatus.loaded
            resolve(result)
          }
        },
        error => {
          this.loadStatus = LoadStatus.failed
          reject(error)
        }
      )
    })
    return promise.then(data => {
      return this
    })
  }

  /**
   * 生成获取wms服务元数据信息的url
   *
   * @param {string} url wms服务基地址
   * @return {*}获取wmts服务元数据信息的url
   * @memberof QueryOGCInfo
   */
  public static generateGetCapabilitiesURL(url: string) {
    let tempUrl: string = url
    if (
      !url.toLowerCase().includes('service=wms') &&
      !url.toLowerCase().includes('request=getcapabilities')
    ) {
      if (!url.includes('?')) {
        tempUrl += '?'
      }
      if (url.toLowerCase().includes('ime-cloud')) {
        // 吉威的数据
        tempUrl += 'service=WMS&REQUEST=GetCapabilities&version=1.1.1'
      } else {
        tempUrl += 'service=WMS&request=GetCapabilities&version=1.1.1'
      }
    }
    if (
      url.toLowerCase().indexOf('tianditu') > 0 &&
      !url.toLowerCase().includes('tk')
    ) {
      tempUrl += 'tk=4c27d6e0e8a90715b23a989d42272fd8'
    }

    return tempUrl
  }

  // 所有的子图层,包括子图层的子图层
  private _allSublayers: WMSSublayer[] = []

  private getSubLayers(subLayer: WMSSublayer, sublayers: WMSSublayer[]) {
    sublayers.push(subLayer)
    if (subLayer.sublayers.length > 0) {
      subLayer.sublayers.forEach(element => {
        this.getSubLayers(element, sublayers)
      })
    }
  }
}
