import { Rectangle } from '@mapgis/webclient-es6-service/common/Rectangle'
import { Point2D } from '@mapgis/webclient-es6-service/common/Point2D'
import * as Zondy from '@mapgis/webclient-es6-service'
import axios from 'axios'
import { LoadStatus, LayerType, Layer } from './layer'
import { TileInfo, LOD } from './tile-layer'
import { ObjectTool } from '../../utils/object-tool'
import { SpatialReference, CoordinateSystemType } from '../spatial-reference'

/**
 * OGCWMTS服务瓦片矩阵集
 *
 * @date 30/03/2021
 * @export
 * @class TileMatrixSet
 */
export class TileMatrixSet {
  /**
   * 从ogc的ows:SupportedCRS标签上解析出epsg号
   *
   * @date 13/05/2021
   * @static
   * @param {string} supportedCRS
   * @return {*}  {Number}
   * @memberof TileMatrixSet
   */
  static getEPSGCodeFromOGCSupportedCRSString(supportedCRS: string): number {
    let epsgCode = 4326
    let pos = -1
    // 1.查找字符串中是否含有EPSG::,如果有则EPSG::后面的即为epsg号。
    pos = supportedCRS.search('EPSG::')
    if (pos > -1) {
      epsgCode = parseInt(supportedCRS.substring(pos + 'EPSG::'.length))
    } else {
      // 2.查找字符串中是否同时含有EPSG:和3857,如果有则表明,对应的epsg号为3857
      pos = supportedCRS.search('EPSG:')
      if (pos > -1 && supportedCRS.search('3857') > 0) {
        epsgCode = 3857
      } else {
        // 3.查找字符串中是否含有"OGC:2:84"或"OGC:1.3:CRS84"，如果有则epsg号为3857
        pos = supportedCRS.search('OGC:2:84')
        if (pos < 0) {
          pos = supportedCRS.search('OGC:1.3:CRS84')
        }

        if (pos > -1) {
          epsgCode = 4326
        }
      }
    }

    // 4.将web墨卡托的epsg号统一为3857.
    if (epsgCode === 3867 || epsgCode === 900913 || epsgCode === 102100)
      epsgCode = 3857

    return epsgCode
  }

  /**
   * 全图范围
   *
   * @date 30/03/2021
   * @type {Rectangle}
   * @memberof TileMatrixSet
   */
  fullExtent: Rectangle = new Rectangle(0.0, 0.0, 0.0, 0.0)

  /**
   * id
   *
   * @date 30/03/2021
   * @memberof TileMatrixSet
   */
  id = ''

  /**
   * 瓦片切片信息
   *
   * @date 30/03/2021
   * @type {TileInfo}
   * @memberof TileMatrixSet
   */
  tileInfo: TileInfo = new TileInfo()

  /**
   * 通过json对象初始化该对象
   *
   * @date 30/03/2021
   * @param {Record<string, any>} jsonObject
   * @memberof TileMatrixSet
   */
  fromJSON(jsonObject: Record<string, any>) {
    if (jsonObject.Identifier) this.id = jsonObject.Identifier
    if (jsonObject.SupportedCRS) {
      this.tileInfo.spatialReference.wkid = TileMatrixSet.getEPSGCodeFromOGCSupportedCRSString(
        jsonObject.SupportedCRS
      )
    }

    // todo:还剩下TileMatrix未解析。
    if (
      jsonObject.TileMatrix &&
      jsonObject.TileMatrix.length &&
      jsonObject.TileMatrix.length > 0
    ) {
      jsonObject.TileMatrix.forEach((element, index) => {
        const lod = new LOD()
        lod.level = index

        if (element.Identifier) {
          lod.levelValue = element.Identifier
        }

        this.tileInfo.lods.push(lod)

        if (index === 0) {
          if (element.TileWidth) this.tileInfo.size[0] = element.TileWidth
          if (element.TileHeight) this.tileInfo.size[1] = element.TileHeight

          if (element.TopLeftCorner) {
            this.tileInfo.origin = new Point2D(
              element.TopLeftCorner[1],
              element.TopLeftCorner[0]
            )
          }
        }
      })
    }
  }

  /**
   * 将该对象转换为json对象
   *
   * @date 30/03/2021
   * @return {*}  {Record<string, any>}
   * @memberof TileMatrixSet
   */
  toJSON(): Record<string, any> {
    return {}
  }
}

/**
 * WMTSSublayer的样式信息
 *
 * @date 30/03/2021
 * @export
 * @class WMTSStyle
 */
export class WMTSStyle {
  /**
   * 样式的描述
   *
   * @date 30/03/2021
   * @memberof WMTSStyle
   */
  description = ''

  /**
   * 样式的ID
   *
   * @date 30/03/2021
   * @memberof WMTSStyle
   */
  id = ''

  /**
   * 是否为默认的style
   *
   * @date 30/03/2021
   * @memberof WMTSStyle
   */
  isDefault = false

  /**
   * 图例的URL
   *
   * @date 30/03/2021
   * @memberof WMTSStyle
   */
  legendUrl = ''

  /**
   * 样式的标题
   *
   * @date 30/03/2021
   * @memberof WMTSStyle
   */
  title = ''

  /**
   * 通过json对象初始化该对象
   *
   * @date 30/03/2021
   * @param {Record<string, any>} jsonObject
   * @memberof WMTSStyle
   */
  fromJSON(jsonObject: Record<string, any>) {
    if (jsonObject.Identifier) this.id = jsonObject.Identifier
    if (jsonObject.Title) this.title = jsonObject.Title
    if (jsonObject.isDefault) this.isDefault = jsonObject.isDefault
  }

  /**
   * 将该对象转换为json对象
   *
   * @date 30/03/2021
   * @return {*}  {Record<string, any>}
   * @memberof WMTSStyle
   */
  toJSON(): Record<string, any> {
    return {}
  }
}

/**
 * OGCWMTS的子图层
 *
 * @date 30/03/2021
 * @export
 * @class WMTSSublayer
 */
export class WMTSSublayer {
  /**
   * 描述
   *
   * @date 30/03/2021
   * @memberof WMTSSublayer
   */
  description = ''

  /**
   * 全图范围
   *
   * @date 30/03/2021
   * @type {Rectangle}
   * @memberof WMTSSublayer
   */
  fullExtent: Rectangle = new Rectangle(0.0, 0.0, 0.0, 0.0)

  /**
   * id
   *
   * @date 30/03/2021
   * @memberof WMTSSublayer
   */
  id = ''

  /**
   * 当前请求的图片格式（MIME type）
   *
   * @date 30/03/2021
   * @memberof WMTSSublayer
   */
  imageFormat = ''

  /**
   * 支持的图片格式列表
   * 从GetCapabilities请求中获取的该图层支持的图片格式列表
   *
   * @date 30/03/2021
   * @memberof WMTSSublayer
   */
  imageFormats: string[] = []

  /**
   * 该WMTSSublayer所属的OGCWMTSLayer
   *
   * @date 30/03/2021
   * @type {OGCWMTSLayer}
   * @memberof WMTSSublayer
   */
  layer: OGCWMTSLayer | undefined

  /**
   * 从GetCapabilities请求中获取的资源URL模板列表
   * 部分wmts服务需要通过该模板请求图片。
   *
   * @date 30/03/2021
   * @memberof WMTSSublayer
   */
  resourceURLTemplates: string[] = []

  /**
   * 当前采用的WMTSStyle ID
   * @date 30/03/2021
   * @memberof WMTSSublayer
   */
  styleId = ''

  /**
   * 支持的WMTSStyle列表
   * 从GetCapabilities请求中获取的该图层支持的样式列表
   *
   * @date 30/03/2021
   * @type {WMTSStyle[]}
   * @memberof WMTSSublayer
   */
  styles: WMTSStyle[] = []

  /**
   *  当前采用的矩阵集
   *
   * @date 30/03/2021
   * @type {TileMatrixSet}
   * @memberof WMTSSublayer
   */
  get tileMatrixSet(): TileMatrixSet {
    let [tileMatrixSetRet] = this.tileMatrixSets
    this.tileMatrixSets.forEach(tileMatrixSet => {
      if (tileMatrixSet.id === this.tileMatrixSetId)
        tileMatrixSetRet = tileMatrixSet
    })

    return tileMatrixSetRet
  }

  /**
   * 当前采用的矩阵集的ID
   *
   * @date 30/03/2021
   * @memberof WMTSSublayer
   */
  tileMatrixSetId = ''

  /**
   * 支持的TileMatrixSet列表
   * 从GetCapabilities请求中获取的该图层支持的矩阵集列表
   *
   * @date 30/03/2021
   * @type {TileMatrixSet[]}
   * @memberof WMTSSublayer
   */
  tileMatrixSets: TileMatrixSet[] = []

  /**
   * 标题
   * 用于在图层列表或图例中标识该子图层
   *
   * @date 30/03/2021
   * @memberof WMTSSublayer
   */
  title = ''

  /**
   * 空间参数信息
   *
   * @date 28/04/2021
   * @memberof WMTSSublayer
   */
  get spatialReference(): SpatialReference {
    return this.tileMatrixSet.tileInfo.spatialReference
  }

  /**
   * 通过json对象初始化该对象
   *
   * @date 30/03/2021
   * @param {Record<string, any>} jsonObject
   * @memberof WMTSSublayer
   */
  fromJSON(jsonObject: Record<string, any>) {
    if (jsonObject.BoundingBox) {
      this.fullExtent = new Rectangle(
        jsonObject.BoundingBox[0],
        jsonObject.BoundingBox[1],
        jsonObject.BoundingBox[2],
        jsonObject.BoundingBox[3]
      )
    }

    if (jsonObject.Format) this.imageFormats = jsonObject.Format

    if (this.imageFormats.length > 0) [this.imageFormat] = this.imageFormats

    if (jsonObject.Identifier) this.id = jsonObject.Identifier

    if (jsonObject.ResourceURL) {
      jsonObject.ResourceURL.forEach(element => {
        if (element.template) this.resourceURLTemplates.push(element.template)
      })
    }

    if (jsonObject.Style) {
      jsonObject.Style.forEach(element => {
        const style: WMTSStyle = new WMTSStyle()
        style.fromJSON(element)
        this.styles.push(style)
      })

      if (this.styles.length > 0) this.styleId = this.styles[0].id
    }

    if (jsonObject.TileMatrixSetLink) {
      const tileMatrixSetIDs: string[] = []

      jsonObject.TileMatrixSetLink.forEach(element => {
        if (element.TileMatrixSet) tileMatrixSetIDs.push(element.TileMatrixSet)
      })

      if (this.layer) {
        this.tileMatrixSets = this.layer.tileMatrixSets.filter(item => {
          return tileMatrixSetIDs.includes(item.id)
        })
      }

      if (this.tileMatrixSets.length > 0) {
        this.tileMatrixSetId = this.tileMatrixSets[0].id
      }
    }

    if (jsonObject.Title) this.title = jsonObject.Title
  }

  /**
   * 将该对象转换为json对象
   *
   * @date 30/03/2021
   * @return {*}  {Record<string, any>}
   * @memberof WMTSSublayer
   */
  toJSON(): Record<string, any> {
    return {}
  }

  /**
   * 创建一个深度克隆的sublayer
   *
   * @date 02/04/2021
   * @return {*}  {WMTSSublayer}
   * @memberof WMTSSublayer
   */
  clone(): WMTSSublayer {
    const result = new WMTSSublayer()

    Object.entries(this).forEach(element => {
      const key = element[0]
      const valueIndex = 1

      if (key === 'layer') {
        result[key] = element[valueIndex]
      } else if (key === 'sublayers') {
        const sublayers = element[valueIndex]
        const sublayersCopy: WMTSSublayer[] = []
        let sublayerCopy: WMTSSublayer | undefined

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
 * OGCWMTS服务图层
 *
 * @date 30/03/2021
 * @export
 * @class OGCWMTSLayer
 */
export class OGCWMTSLayer extends Layer {
  /**
   * 创建一个深度克隆的OGCWMTSLayer
   *
   * @date 08/04/2021
   * @return {*}  {Layer}
   * @memberof OGCWMTSLayer
   */
  clone(): Layer {
    const result = new OGCWMTSLayer()

    Object.entries(this).forEach(element => {
      const key = element[0]
      const valueIndex = 1

      if (key === '_allSublayers') {
      } else if (key === 'activeLayer') {
      } else if (key === 'sublayers') {
        const sublayers = element[valueIndex]
        const sublayersCopy: WMTSSublayer[] = []
        let sublayerCopy: WMTSSublayer | undefined

        sublayers.forEach(sublayer => {
          sublayerCopy = sublayer.clone()

          if (sublayerCopy) {
            sublayerCopy.layer = result
            sublayersCopy.push(sublayerCopy)
          }
        })

        result[key] = sublayersCopy

        // 给activeLayer赋值
        if (this.activeLayer)
          result.activeLayer = result.findSublayerById(this.activeLayer.id)
      } else {
        result[key] = this._deepClone(element[valueIndex])
      }
    })

    return result
  }

  /**
   * Creates an instance of OGCWMTSLayer.
   *
   * @date 22/03/2021
   * @param {Record<string, any>} properties
   * @memberof OGCWMTSLayer
   */
  constructor(properties?: Record<string, any>) {
    super(properties)

    this.type = LayerType.OGCWMTS

    if (!properties) return

    if (properties.url) this.url = properties.url
    if (properties.maxScale) this.maxScale = properties.maxScale
    if (properties.minScale) this.minScale = properties.minScale
    if (properties.tokenKey) this.tokenKey = properties.tokenKey
    if (properties.tokenValue) this.tokenValue = properties.tokenValue
  }

  /**
   * 当前激活的子图层
   *
   * @date 30/03/2021
   * @type {WMTSSublayer}
   * @memberof OGCWMTSLayer
   */
  activeLayer: WMTSSublayer | undefined

  /**
   * 图层显示的最大比例尺:在地图视图中超出该比例尺,图层将不再显示。
   * 默认值：0. 0表示该图层的显示不受最大比例尺的限制，可以无限放大。
   * maxScale < minScale
   * sample
   * The layer will not be visible when the view is zoomed in beyond a scale of 1:2,000
   * layer.maxScale = 2000;
   *
   * @date 30/03/2021
   * @memberof OGCWMTSLayer
   */
  maxScale = 0

  /**
   * 图层显示的最小比例尺:在地图视图中超出该比例尺,图层将不再显示。
   * 默认值：0. 0表示该图层的显示不受最小比例尺的限制，可以无限缩小。
   *
   * @date 30/03/2021
   * @memberof OGCWMTSLayer
   */
  minScale = 0

  /**
   * 子图层列表
   *
   * @date 30/03/2021
   * @type {WMTSSublayer[]}
   * @memberof OGCWMTSLayer
   */
  sublayers: WMTSSublayer[] = []

  /**
   * 支持的TileMatrixSet列表
   * 从GetCapabilities请求中获取的该图层支持的矩阵集列表
   *
   * @date 30/03/2021
   * @type {TileMatrixSet[]}
   * @memberof OGCWMTSLayer
   */
  tileMatrixSets: TileMatrixSet[] = []

  /**
   * token的参数名
   *
   * @date 30/03/2021
   * @memberof OGCWMTSLayer
   */
  tokenKey = ''

  /**
   * token的参数值
   *
   * @date 30/03/2021
   * @memberof OGCWMTSLayer
   */
  tokenValue = ''

  /**
   * 服务基地址
   * 约定URL格式如下：
   * MapGIS:http://develop.smaryun.com:6163/igs/rest/ogc/WORLDMKTTILE2/WMTSServer
   * ArcGIS:http://219.142.81.85/arcgis/rest/services/25wanHC/MapServer/WMTS
   * 吉威：http://59.252.165.22:8066/ime-cloud/rest/shuixi/wmts
   *
   *
   * @date 30/03/2021
   * @memberof OGCWMTSLayer
   */
  url = ''

  /**
   * wmts标准的版本
   *
   * @date 31/03/2021
   * @memberof OGCWMTSLayer
   */
  version = ''

  /**
   * 根据id获取对应的子图层
   *
   * @date 30/03/2021
   * @return {*}  {WMTSSublayer}
   * @memberof OGCWMTSLayer
   */
  findSublayerById(id: string): WMTSSublayer | undefined {
    let sublayer: WMTSSublayer | undefined

    this.sublayers.forEach(element => {
      if (element.id === id) sublayer = element
    })
    return sublayer
  }

  get fullExtent(): Rectangle {
    return this.activeLayer?.fullExtent
  }

  get spatialReference(): SpatialReference | undefined {
    return this.activeLayer?.spatialReference
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
    let getCapabilitiesURL = OGCWMTSLayer.generateGetCapabilitiesURL(this.url)

    // 加入token
    if (this.tokenValue != '')
      getCapabilitiesURL += `&${this.tokenKey}=${this.tokenValue}`

    // 2.发起网络请求
    const promise = new Promise((resolve, reject) => {
      this.loadStatus = LoadStatus.loading
      axios.get(getCapabilitiesURL).then(
        res => {
          const { data } = res
          if (!data) {
            resolve(undefined)
          } else {
            const parser = new Zondy.OGC.WMTSCapabilities()
            const result = parser.read(data)

            // 3.解析请求结果
            // 3.1Contents
            // 3.1.1 TileMatrixSet
            const tileMatrixSets: TileMatrixSet[] = []
            if (result.Contents.TileMatrixSet) {
              result.Contents.TileMatrixSet.forEach(item => {
                const tileMatrixSet: TileMatrixSet = new TileMatrixSet()

                tileMatrixSet.fromJSON(item)

                tileMatrixSets.push(tileMatrixSet)
              })
            }

            this.tileMatrixSets = tileMatrixSets
            // 3.1.2 Layer
            this.sublayers = []
            if (result.Contents.Layer) {
              result.Contents.Layer.forEach((element, index) => {
                const sublayer: WMTSSublayer = new WMTSSublayer()
                sublayer.layer = this
                sublayer.id = `${index}`
                sublayer.fromJSON(element)

                this.sublayers.push(sublayer)
              })
            }

            // 3.2 version
            if (result.version) this.version = result.version

            // 4.设置默认参数
            if (this.sublayers.length > 0) [this.activeLayer] = this.sublayers
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
   * 生成获取wmts服务元数据信息的url
   *
   * @param {string} url wmts服务基地址
   * @return {*}获取wmts服务元数据信息的url
   * @memberof OGCWMTSLayer
   */
  public static generateGetCapabilitiesURL(url: string): string {
    let tempUrl: string = url

    if (url.includes('?')) {
      tempUrl = url.split('?')[0]
    } else {
      tempUrl = url
    }

    tempUrl += '?'

    if (url.toLowerCase().includes('ime-cloud')) {
      // 吉威的数据
      tempUrl += 'service=WMTS&REQUEST=GetCapabilities'
    } else {
      tempUrl += 'service=WMTS&request=GetCapabilities'
    }

    return tempUrl
  }
}
