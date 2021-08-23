import { Rectangle } from '@mapgis/webclient-es6-service/common/Rectangle'
import { Point2D } from '@mapgis/webclient-es6-service/common/Point2D'
import * as Zondy from '@mapgis/webclient-es6-service'
import axios from 'axios'
import { LoadStatus, LayerType, Layer } from './layer'
import { TileInfo, LOD } from './tile-layer'
import { ObjectTool } from '../../utils/object-tool'
import { SpatialReference, CoordinateSystemType } from '../spatial-reference'

// 发布WMTS的厂商名称
export enum WMTSCorporation {
  corporationZD = 1, // 中地
  corporationArcGIS = 2, // ArcGIS
  corporationSuperMap = 3, // 超图 (暂未使用 2016.1.25)
  corporationGeoServer = 4, // GeoServer
  corporationTianDiTu = 5, // 天地图
  corporationOther = 6 // 其它
}

const ARCGIS_METERPERUNIT = 111194872.221777
const MAPGIS_OLD_METERPERUNIT = ARCGIS_METERPERUNIT
const GEOSERVER_METERPERUNIT = 111319490.79327358
const MAPGIS_METERPERUNIT = GEOSERVER_METERPERUNIT
const OTHER_METERPERUNIT = GEOSERVER_METERPERUNIT

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
   * 该TileMatrixSet所属的OGCWMTSLayer
   *
   * @date 30/03/2021
   * @type {OGCWMTSLayer}
   * @memberof TileMatrixSet
   */
  layer: OGCWMTSLayer | undefined

  /**
   * 创建一个深度克隆的TileMatrixSet
   *
   * @date 06/04/2021
   * @return {*}  {TileMatrixSet}
   * @memberof TileMatrixSet
   */
  clone(): TileMatrixSet {
    const result = new TileMatrixSet()

    Object.entries(this).forEach(element => {
      const key = element[0]
      const valueIndex = 1

      if (key === 'tileInfo') {
        result[key] = element[valueIndex].clone()
      } else if (key === 'layer') {
        result[key] = element[valueIndex]
      } else {
        result[key] = ObjectTool.deepClone(element[valueIndex])
      }
    })

    return result
  }

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

    if (
      jsonObject.TileMatrix &&
      jsonObject.TileMatrix.length &&
      jsonObject.TileMatrix.length > 0
    ) {
      jsonObject.TileMatrix.forEach((element, index) => {
        const lod = new LOD()
        lod.level = index
        lod.scale = element.ScaleDenominator

        if (element.Identifier) {
          // 存在两种情况，其一是参照系:级数,其二是只为级数
          const pos = element.Identifier.lastIndexOf(':')
          if (pos >= 0) {
            lod.levelValue = parseInt(element.Identifier.substring(pos + 1))
          } else {
            lod.levelValue = parseInt(element.Identifier)
          }
        }

        const resolution = this.getResolutionByScale(lod.scale)

        lod.resolution = this.getTileResolution(lod.scale)

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
   * 通过比例计算该层级对应的分辨率（单位为米）
   * @param {number} Scale 比例尺
   * @returns 分辨率（单位为米）
   */
  getResolutionByScale(Scale: number): number {
    // TODO 需要根据厂商来确定dpi，这里为了暂时写死
    const dMMPerPix = 25.4 / 96 / 1000

    const resolution = dMMPerPix / (1 / Scale)

    return resolution
  }

  /**
 *
 *
 * @date 23/08/2021
 * @param {number} dScale 比例尺分母
 * @return {*}  {number} 级数对应的分辨率
 * @memberof TileMatrixSet
 * @summary 
 *    该函数支持MapGIS IGServer 发布的JWD,MKT瓦片只有一个矩阵集(老版本,地调局原来有用),
      支持MapGIS IGServer 发布的JWD 三个矩阵集,MKT 的两个矩阵集(新版本,该版本MapGIS发布的WMTS可以再Arcmap 和ArcGIS Server发布的WMTS完美叠加,ArcGIS Online中和地图完美叠加)
      支持ArcGIS Server   发布的JWD,MKT瓦片
      支持天地图(全国)    JWD，MKT两种
      支持GeoServer       JWD,MKT两种
各个厂家以及MapGIS IGServer发布的老版本和新版本之间关于1逻辑单位代表多少毫米的理解如下:
服务名              坐标系          矩阵集个数/名称           1逻辑单位代表多少毫米      1像素等于多少毫米
IGServer老服务      JWD             一个矩阵集                111194872.221777			    25.4/96
IGServer老服务      MKT             一个矩阵集                1000						          25.4/96
IGServer新服务      JWD      3个(EPSG:4326_XXXX_028mm_GB)     111319490.79327358        0.28
IGServer新服务      JWD      3个(EPSG:4326_XXXX_arcgis_GB)    111194872.221777			    0.28
IGServer新服务      JWD      3个(EPSG:4326_XXXX_dpi96_GB)     111319490.79327358		    25.4/96
IGServer新服务      MKT      2个(GoogleMapsCompatible_GB)     1000						          0.28
IGServer新服务      MKT      2个(EPSG:3857_XXXX_dpi96_GB)     1000						          25.4/96

ArcGIS Server       JWD      2个(default028mm)				        111194872.221777			  25.4000508/96(0.28的比例尺反算96DPI的比例尺后,用96DPI的计算,这种情况下1英寸等于25.4000508毫米)
ArcGIS Server       JWD      2个(native)					            111194872.221777			  25.4000508/96
ArcGIS Server       MKT      3个(default028mm)				        1000						        25.4000508/96(0.28的比例尺反算96DPI的比例尺后,用96DPI的计算,这种情况下1英寸等于25.4000508毫米)
ArcGIS Server       MKT      3个(native)					            1000						        25.4000508/96
ArcGIS Server       MKT      3个(GoogleMapsCompatible)		    1000						        0.28    

GeoServer           JWD             一个矩阵集                111319490.79327358 		  0.28
GeoServer			      MKT             一个矩阵集                1000						        0.28

tianditu            JWD             一个矩阵集                111319490.79327358 		  25.4/96
tianditu			      MKT             一个矩阵集                1000						        25.4/96
 * 
 */
  getTileResolution(dScale: number): number {
    let szMatrixSetName = ''
    let szTmp = ''
    const szWellKnownScaleSetName = ''
    let nPos = -1
    let nMapGISType = 0 // 0是国标标准的0.28,1是Arcgis0.28,2是96dpi,3是GoogleMapsCompatible(OGC MKT 0.28)
    let nArcGISTyep = 0 // 0是default0.28,1是nativeTileMatrixSet,2是GoogleMapsCompatible(OGC MKT 0.28),3其它
    let nOtherType = 0 // 0是国标的96DPI(严格的标准),1可能是用ArcGIS发布的但是基地址又不能判断出是ArcGIS的情况(吉威广西: http://121.40.62.120:8066/ime-server/rest/gxyx/wmts?service=wmts&request=GetCapabilities)
    let dMMPerPix = 25.4 / 96 // 一个像素等于多少毫米
    let dScaleEx = 0
    let lod: LOD | undefined
    let dConst = -1

    szMatrixSetName = this.id

    // 不支持获取WellKnownScaleSet名称。
    // szWellKnownScaleSetName = pMatrixSet->matriSet.szWellKnownScaleSetName;

    if (this.layer?.corporationType == WMTSCorporation.corporationZD) {
      // 新版本2016-1-27之后 MapGIS IGServer发布的JWD有三个矩阵集: 如下
      // EPSG:4326_武汉1~12级_028mm_GB
      // EPSG:4326_武汉1~12级_arcgis_GB
      // EPSG:4326_武汉1~12级_dpi96_GB
      // MKT数据有2个矩阵集
      // GoogleMapsCompatible_GB
      // EPSG:3857_WH_MKT_1~16级_dpi96_GB

      nPos = szMatrixSetName.lastIndexOf('_GB')

      if (nPos > 0) {
        szTmp = szMatrixSetName.slice(0, szMatrixSetName.length - 3)
        nPos = szTmp.lastIndexOf('_')
        if (nPos > 0)
          // 028mm_GB,arcgis_GB,dpi96_GB三种
          szTmp = szTmp.slice(nPos + 1)

        if (szTmp === '028mm') nMapGISType = 0
        else if (szTmp === 'arcgis') nMapGISType = 1
        else if (szTmp === 'dpi96') nMapGISType = 2
        else if (szTmp === 'GoogleMapsCompatible') nMapGISType = 3

        if (this.tileInfo.spatialReference.isWGS84()) {
          if (nMapGISType == 0) {
            // 标准的国标
            dConst = MAPGIS_METERPERUNIT
            dMMPerPix = 0.28
          } else if (nMapGISType == 1) {
            // ArcGIS的0.28
            dMMPerPix = 0.28
            dConst = ARCGIS_METERPERUNIT
          } else if (nMapGISType == 2) {
            dConst = MAPGIS_METERPERUNIT
            dMMPerPix = 25.4 / 96
          }
        } else {
          if (nMapGISType == 0) {
            // 标准的国标
            dMMPerPix = 0.28
          } else if (nMapGISType == 1) {
            // ArcGIS的0.28
            dMMPerPix = 0.28
          } else if (nMapGISType == 2) {
            dMMPerPix = 25.4 / 96
          } else if (nMapGISType == 3) {
            dMMPerPix = 0.28
          }
        }
      } // 老版本
      else {
        if (this.tileInfo.spatialReference.isWGS84()) {
          dConst = MAPGIS_OLD_METERPERUNIT
          dMMPerPix = 25.4 / 96
        } else {
          dMMPerPix = 25.4 / 96
        }
      }
    } else if (
      this.layer?.corporationType == WMTSCorporation.corporationArcGIS
    ) {
      // http://portal.smartxspace.com/arcgis/rest/services/wuhan_base/MapServer/WMTS/1.0.0/WMTSCapabilities.xml
      // 修改说明：ArcGIS的部分WMTS服务的dpi为0.28，但其矩阵集名称为default，原有写法会造成该类服务无法显示。
      // 修改人：马原野 2018-12-26
      if (szMatrixSetName.includes('default')) nArcGISTyep = 0
      else if (szMatrixSetName.includes('native')) nArcGISTyep = 1
      else if (szMatrixSetName.includes('GoogleMapsCompatible')) nArcGISTyep = 2
      else nArcGISTyep = 3
      if (this.tileInfo.spatialReference.isWGS84()) {
        if (nArcGISTyep == 0) {
          dScaleEx = (dScale * 0.28 * 96) / 25.4 // 反算96DPI对应的比例尺,直接用0.28对应的比例尺不准确
          dScale = dScaleEx
          dConst = ARCGIS_METERPERUNIT
          dMMPerPix = 25.4000508 / 96
        } else if (nArcGISTyep == 1) {
          dConst = ARCGIS_METERPERUNIT
          dMMPerPix = 25.4000508 / 96
        }
      } else {
        if (nArcGISTyep == 0) {
          dScaleEx = (dScale * 0.28 * 96) / 25.4 // 反算96DPI对应的比例尺,直接用0.28对应的比例尺不准确
          dScale = dScaleEx
          dMMPerPix = 25.4000508 / 96
        } else if (nArcGISTyep == 1) {
          dMMPerPix = 25.4000508 / 96
        } else if (nArcGISTyep == 2) {
          dMMPerPix = 0.28
        }
      }
    } else if (
      this.layer?.corporationType == WMTSCorporation.corporationGeoServer
    ) {
      if (this.tileInfo.spatialReference.isWGS84()) {
        dConst = GEOSERVER_METERPERUNIT
        dMMPerPix = 0.28
      } else {
        dMMPerPix = 0.28
      }
    } else if (
      this.layer?.corporationType == WMTSCorporation.corporationTianDiTu
    ) {
      if (this.tileInfo.spatialReference.isWGS84()) {
        dConst = OTHER_METERPERUNIT
        dMMPerPix = 25.4 / 96
      } else {
        dMMPerPix = 25.4 / 96
      }
    }
    // 修改说明：修订bug7584 对吉威发布的类似于ArcGIS规则的WMTS的支持.本质需要按照ArcGIS方式计算
    //           其它厂商发布的WMTS认为都是严格按照国家标准执行(都只处理一个矩阵级,且认为是96DPI,一度等于多少米为111319490.79327358)
    // 修改人： 潘明敏 2016-04-14
    else {
      // 对于其它厂家发布的WMTS原则上认为是严格执行国家标准(关键参数同天地图)
      // 但是对于吉威发布的WMTS特殊处理下,吉威发布的WMTS有两套标准
      // 1.http:// 121.40.62.120:8066/ime-server/rest/gxyx/wmts?service=wmts&request=GetCapabilities  其实内部比例尺是符合ArcGIS的标准发布,包含了default028mm矩阵集,计算时需要用ArcGIS的计算方法才能对
      // 2.http://www.mapgx.com/ime-server/rest/tdtgx_vec/wmts/wmts?service=wmts&request=getcapabilities 符合国家标准执行，使用国家标准的参数计算即可
      if (szMatrixSetName.includes('028')) nOtherType = 1

      // 修改说明：某些服务szWellKnownScaleSetName中含有"GoogleMapsCompatible"关键词，计算时需要用ArcGIS的计算方法。
      // 如：中国地质调查局西安地质调查中心发布的服务，url:http://219.144.130.58:6400/getcapabilities?Theme=HillShade  bug[12561]
      // 修改人：马原野 2019-07-20
      if (szWellKnownScaleSetName.includes('GoogleMapsCompatible')) {
        nOtherType = 1
      }

      // 修改说明：szWellKnownScaleSetName中含有"GoogleMapsCompatible"关键词，计算时也需要用ArcGIS的计算方法。
      // 修改恩：王必聪 2019-07-26
      if (szWellKnownScaleSetName.includes('GoogleCRS84Quad')) nOtherType = 1

      if (this.tileInfo.spatialReference.isWGS84()) {
        if (nOtherType == 1) {
          dScaleEx = (dScale * 0.28 * 96) / 25.4 // 反算96DPI对应的比例尺,直接用0.28对应的比例尺不准确
          dScale = dScaleEx
          dConst = ARCGIS_METERPERUNIT
          dMMPerPix = 25.4000508 / 96
        } else {
          dConst = OTHER_METERPERUNIT
          dMMPerPix = 25.4 / 96
        }
      } else {
        if (nOtherType == 1) {
          dScaleEx = (dScale * 0.28 * 96) / 25.4 // 反算96DPI对应的比例尺,直接用0.28对应的比例尺不准确
          dScale = dScaleEx
          dMMPerPix = 25.4000508 / 96
        } else dMMPerPix = 25.4 / 96
      }
    }
    return (dScale * dMMPerPix) / dConst
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
      if (
        this.layer?.corporationType == WMTSCorporation.corporationArcGIS ||
        this.layer?.corporationType == WMTSCorporation.corporationZD
      )
        this.fullExtent = new Rectangle(
          jsonObject.BoundingBox[1],
          jsonObject.BoundingBox[0],
          jsonObject.BoundingBox[3],
          jsonObject.BoundingBox[2]
        )
      else {
        this.fullExtent = new Rectangle(
          jsonObject.BoundingBox[0],
          jsonObject.BoundingBox[1],
          jsonObject.BoundingBox[2],
          jsonObject.BoundingBox[3]
        )
      }
    }

    if (jsonObject.Format) this.imageFormats = jsonObject.Format

    if (this.imageFormats.length > 0) {
      // 默认获取png格式的图片,不支持png格式图片的话，取第0个。
      const pngFormat = this.imageFormats.find(item => item.includes('png'))
      if (pngFormat) {
        this.imageFormat = pngFormat
      } else {
        ;[this.imageFormat] = this.imageFormats
      }
    }

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
      } else if (key === 'tileMatrixSets') {
        const tileMatrixSets = element[valueIndex]
        const tileMatrixSetsCopy: TileMatrixSet[] = []
        let tileMatrixSetCopy: TileMatrixSet | undefined

        tileMatrixSets.forEach(tileMatrixSet => {
          tileMatrixSetCopy = tileMatrixSet.clone()

          if (tileMatrixSetCopy) {
            tileMatrixSetsCopy.push(tileMatrixSetCopy)
          }
        })

        result[key] = tileMatrixSetsCopy
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
  get url(): string {
    return this._url
  }

  set url(url: string) {
    this.initCorporationType(url)
    this._url = url
  }

  /**
   * wmts标准的版本
   *
   * @date 31/03/2021
   * @memberof OGCWMTSLayer
   */
  version = ''

  /**
   * WMTS发布的厂商,现在根据URL判断
   *
   * @date 24/07/2021
   * @memberof OGCWMTSLayer
   */
  corporationType = WMTSCorporation.corporationZD

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
      } else if (key === 'tileMatrixSets') {
        const tileMatrixSets = element[valueIndex]
        const tileMatrixSetsCopy: TileMatrixSet[] = []
        let tileMatrixSetCopy: TileMatrixSet | undefined

        tileMatrixSets.forEach(tileMatrixSet => {
          tileMatrixSetCopy = tileMatrixSet.clone()

          if (tileMatrixSetCopy) {
            tileMatrixSetCopy.layer = result
            tileMatrixSetsCopy.push(tileMatrixSetCopy)
          }
        })

        result[key] = tileMatrixSetsCopy
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

                tileMatrixSet.layer = this

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

  private _url = ''

  private initCorporationType(strURL: string): number {
    if (strURL == undefined) {
      this.corporationType = WMTSCorporation.corporationZD
      return 0
    }

    // 对于MapGIS发布的WMTS,基地址有两种写法,故只用WMTSServer来判断
    // http://192.168.10.44:6163/igs/rest/ogc/WMTSServer(IGserver发布的)
    // http://219.142.81.86/igserver/ogc/kvp/TAS10E52H50E002021/WMTSServer (中国地调局国家地质资料馆里面有用)
    // 修改说明：<天地图服务升级，服务域名变化>
    // 修改人：ldf 2018-12-26
    if (strURL.search('WMTSServer') > 0)
      this.corporationType = WMTSCorporation.corporationZD
    else if (strURL.search('arcgis/rest/services') > 0)
      this.corporationType = WMTSCorporation.corporationArcGIS
    else if (strURL.search('geoserver') > 0)
      this.corporationType = WMTSCorporation.corporationGeoServer
    else if (
      strURL.search('tianditu.com') > 0 ||
      strURL.search('tianditu.gov.cn') > 0
    )
      this.corporationType = WMTSCorporation.corporationTianDiTu
    else this.corporationType = WMTSCorporation.corporationOther
    return 1
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
