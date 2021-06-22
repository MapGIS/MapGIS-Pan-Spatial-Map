import * as Zondy from '@mapgis/webclient-es6-service'
import axios from 'axios'
import DocumentCatalog from '../catalog/document'
import { FeatureGeoJSON } from './feature-geojson'
import { FeatureIGS } from '../feature/feature'

/**
 * 要素查询参数结构
 */
export interface FeatureQueryParam {
  domain?: string // 域名
  protocol?: string // 网络协议
  ip?: string // 服务ip
  port?: string // 服务port
  f?: string // 返回结果的格式, 缺省geojson(json | xml | geojson)
  geometryType?: string // 几何类型（例如：point，circle，rect，line，polygon等）
  geometry?: Record<string, any> | string // 几何类型的图形参数, 包含geometryType几何类型（例如：point，circle，rect，line，polygon等）
  where?: string // 查询条件（例如：id = 8）
  page?: number // 返回的要素分页的页数，默认返回第0页
  pageCount?: number // 要素结果集每页的记录数量，默认为10条 / 页
  CompareRectOnly?: boolean // 指定查询规则rule参数
  EnableDisplayCondition?: boolean // 指定查询规则rule参数
  Intersect?: boolean // 指定查询规则rule参数
  MustInside?: boolean // 指定查询规则rule参数
  IncludeAttribute?: boolean // 指定查询结果的结构structs参数
  IncludeGeometry?: boolean // 指定查询结果的结构structs参数
  IncludeWebGraphic?: boolean // 指定查询结果的结构structs参数
  objectIds?: string // 需要查询的要素Id号（说明：当此参数有值时，将忽略其他查询参数。）
  orderField?: string // 排序字段名称
  rtnLabel?: boolean // 是否计算Label点
  isAsc?: boolean // 按照字段进行排列时，是否升序排列
  cursorType?: string // 游标类型 forward为向前光标 其他为向前向后
  guid?: string // 唯一id，可缺省
  fields?: string // 指定结果字段
  coordPrecision?: number // 坐标点的精度
  gdbp?: string // 图层的gdbp地址，多个图层用逗号分隔
  srsIds?: string // 投影参考系，多个图层用半角逗号分隔
  docName?: string // 文档名称
  mapIndex?: number // 地图在文档下得序号（一般值为0）
  layerIdxs?: string // 要查询的图层索引(多个请用','分隔), 单个索引支持组的情况，比如0 - 0 - 1 - 2，前面三级就是组的索引
  dataService?: string // 时空云文档名
  combine?: boolean // 是否使用igs的聚合查询服务

  compress?: boolean // 当f = "geojson"有效
  level?: number // 当f = "geojson"有效

  layerName?: string // 图层名
  code?: string // 行政区划编码

  isDataStoreQuery?: boolean // 是否为dataStore查询

  includeProperites?: boolean // 查询结果中是否包含属性
  geoFormat?: string // 几何类型，wkt、wkb、geojson、自定义等
  sref?: string // 动态投影坐标系 ID

  // es 地名地址查询
  isEsGeoCode?: boolean // 是否为es 地名地址查询
  libName?: string // 数据库名
  province?: string // 省约束信息
  city?: string // 市约束信息
  bbox?: string // 矩形范围信息
  hotGroup?: string // 数据分类
  decode?: boolean // 是否为逆地理编码
  lon?: number // 经度
  lat?: number // 纬度
  dis?: number // 查询范围半径
}

export interface GeoCodeFeature {
  formatAddress: string
  areaAddr: Record<string, unknown>
  detail: Record<string, unknown>
  ext: Record<string, unknown>
  lat: number
  lon: number
}

export interface ESGeoCodeFeatures {
  pageNo: number
  pageSize: number
  rowCount: number
  totalPage: number
  totalCount: number
  result: GeoCodeFeature[]
  length?: number
}

export default class FeatureQuery {
  /**
   * 查询通用接口
   * @param {object} option
   * @param {object} [option.isDataStoreQuery] 是否为DataStore的查询
   * @param {boolean} combine 是否走聚合查询方式。不涉及分页的，走IGS默认的，设置为向前光标速度更快；聚合查询做了优化，查询速度 比IGS默认的快速，支持属性聚合
   */
  public static query(
    option: FeatureQueryParam,
    combine?: boolean,
    is3D?: boolean
  ) {
    if (!option) {
      return null
    }
    if (option.isDataStoreQuery) {
      // datastore
      return this.dataStoreQuery(option)
    } // igs
    return this.igsQuery(option, combine, is3D)
  }

  /**
   * igs要素查询
   * @param option 详见igsQueryFeature和igsOnemapQueryFeature的option
   * @param {boolean} combine 是否走聚合查询方式。不涉及分页的，走IGS默认的，设置为向前光标速度更快；聚合查询做了优化，查询速度 比IGS默认的快速，支持属性聚合
   * @param {boolean} is3D 是否为三维要素查询。
   * @returns {Promise<void>}
   */
  public static async igsQuery(
    option: FeatureQueryParam,
    combine?: boolean,
    is3D?: boolean
  ) {
    if (!is3D && option.docName && option.layerIdxs !== undefined) {
      // 参数是否含有文档名和图层索引号
      const docInfo = await DocumentCatalog.getDocInfo({
        serverName: option.docName,
        ip: option.ip,
        port: option.port
      })

      const data = docInfo?.MapInfos[Number(option.mapIndex) || 0].CatalogLayer
      const layerName: string = option.layerName || ''
      const code: string = option.code || ''
      if (data && option.layerIdxs === '') {
        option.layerIdxs = DocumentCatalog.getLayerIndexesByNamesOrCodes(
          data,
          layerName,
          code,
          [],
          []
        ).join(',')
      }
    }
    if (combine) {
      option.combine = combine
      return this.igsCombineQueryFeature(option)
    }
    if (is3D) {
      return this.igsQuery3DFeature(option)
    }
    return this.igsQueryFeature(option)
  }

  /**
   * igs要素查询
   * @param {object} option
   * @param {string}[option.domain=null] igs服务地址域名 （domain和[protocol，ip，port]，二选一）
   * @param {string}[option.protocol="http"] igs服务地址网络协议 （domain和[protocol，ip，port]，二选一）
   * @param {string}[option.ip =null] igs服务地址ip （domain和[protocol，ip，port]，二选一）
   * @param {string}[option.port=null] igs服务地址port （domain和[protocol，ip，port]，二选一）
   * //矢量文档和矢量图层要素查询公共参数
   * @param {string} [option.f="geojson"] 返回结果的格式,缺省xml(json|xml|geojson),geojson格式结果中不包含labelDots信息。
   * @param {Object} [option.geometry] 空间查询条件（例如：point，circle，rect，line，polygon等）
   * @param {string} [option.where] 属性查询条件（例如：id = 8）
   * @param {Number} [option.page=0] 返回的要素分页的页数，默认返回第0页
   * @param {Number} [option.pageCount=10] 要素结果集每页的记录数量，默认为20条/页
   *
   * @param {Boolean} [option.CompareRectOnly=false] 指定查询规则rule参数
   * @param {Boolean} [option.EnableDisplayCondition=false] 指定查询规则rule参数
   * @param {Boolean} [option.Intersect=true] 指定查询规则rule参数
   * @param {Boolean} [option.MustInside=false] 指定查询规则rule参数
   *
   * @param {Boolean} [option.IncludeAttribute=true]  指定查询结果的结构structs参数
   * @param {Boolean} [option.IncludeGeometry=true]  指定查询结果的结构structs参数
   * @param {Boolean} [option.IncludeWebGraphic=false] 指定查询结果的结构structs参数
   *
   * @param {string} [option.objectIds] 需要查询的要素Id号（说明：当此参数有值时，将忽略其他查询参数。）
   * @param {string} [option.orderField] 排序字段名称
   * @param {Boolean} [option.rtnLabel=true] 是否计算Label点
   * @param {Boolean} [option.isAsc=false] 按照字段进行排列时，是否升序排列
   * @param {string} [option.cursorType=“forward”] 游标类型 forward为向前光标 其他为向前向后
   * @param {string} [option.guid=“__readonly_user__”] 唯一id，可缺省
   * @param {string} [option.fields] 指定结果字段
   * @param {Number} [option.coordPrecision=2] coordPrecision坐标点的精度
   * 矢量图层的查询参数
   * @param {string} [option.gdbp] 图层的gdbp地址，多个图层用逗号分隔
   * @param {string} [option.srsIds] 投影参考系，多个图层用半角逗号分隔
   * 矢量文档的要素查询
   * @param {string} [option.docName] 文档名称</param>
   * @param {Number} [option.mapIndex] 地图在文档下得序号（一般值为0）
   * @param {string} [option.layerIdxs] 要查询的图层索引(多个请用','分隔),单个索引支持组的情况，比如0-0-1-2，前面三级就是组的索引
   * 时空云的必须参数
   * @param {string} [option.dataService] 时空云文档名
   */
  public static igsQueryFeature(option: FeatureQueryParam) {
    let queryParam
    if (option.gdbp) {
      // 矢量图层
      queryParam = new Zondy.MRFS.QueryByLayerParameter(option.gdbp)
      queryParam.proj = option.srsIds
    } else {
      // 矢量文档
      queryParam = new Zondy.MRFS.QueryParameter()
    }
    queryParam.resultFormat = option.f || 'geojson'
    queryParam.geometry = option.geometry || null
    queryParam.where = option.where || null
    queryParam.pageIndex = option.page || 0
    queryParam.recordNumber = option.pageCount || 10
    queryParam.rule = new Zondy.MRFS.QueryFeatureRule({
      CompareRectOnly:
        option.CompareRectOnly !== undefined ? option.CompareRectOnly : false,
      EnableDisplayCondition:
        option.EnableDisplayCondition !== undefined
          ? option.EnableDisplayCondition
          : false,
      Intersect: option.Intersect !== undefined ? option.Intersect : true,
      MustInside: option.MustInside !== undefined ? option.MustInside : false
    })
    queryParam.struct = new Zondy.MRFS.QueryFeatureStruct({
      IncludeAttribute:
        option.IncludeAttribute !== undefined ? option.IncludeAttribute : true,
      IncludeGeometry:
        option.IncludeGeometry !== undefined ? option.IncludeGeometry : true,
      IncludeWebGraphic:
        option.IncludeWebGraphic !== undefined
          ? option.IncludeWebGraphic
          : false
    })
    queryParam.objectIds = option.objectIds || null
    queryParam.orderField = option.orderField || null
    queryParam.rtnLabel = option.rtnLabel !== undefined ? option.rtnLabel : true
    queryParam.isAsc = option.isAsc !== undefined ? option.isAsc : false
    queryParam.cursorType = option.cursorType || 'forward'
    queryParam.guid = option.guid || '__readonly_user__'
    queryParam.fields = option.fields || ''
    queryParam.coordPrecision =
      option.coordPrecision || option.coordPrecision === 0
        ? option.coordPrecision
        : 2

    let domain = option.domain || null
    if (!domain) {
      const protocol = option.protocol
      const ip = option.ip
      const port = option.port
      domain = `${protocol}://${ip}:${port}`
    }
    let queryService: any
    if (option.gdbp) {
      // 矢量图层
      queryService = new Zondy.MRFS.QueryLayerFeature(queryParam, {
        domain
      })
    } else {
      // 矢量文档
      if (!option.docName || !option.layerIdxs) {
        return null
      }
      // 文档名
      const { docName } = option
      // 文档索引
      const mapIndex = option.mapIndex || 0
      // 图层索引号
      const layerIdxs =
        option.layerIdxs || option.layerIdxs === '0' ? option.layerIdxs : '*'
      // 时空云文档名
      const dataService = option.dataService || option.docName
      queryParam.partUrl = `docs/${docName}/${mapIndex}/${layerIdxs}/query?dataService=${dataService}`
      queryService = new Zondy.MRFS.QueryDocFeature(
        queryParam,
        docName,
        layerIdxs,
        {
          domain
        }
      )
    }
    const promise = new Promise<FeatureGeoJSON | FeatureIGS>(
      (resolve, reject) => {
        queryService.query(
          res => {
            if (!res) {
              resolve(undefined)
            } else {
              resolve(res)
            }
          },
          error => {
            console.log(error)
            reject(error)
          }
        )
      }
    )
    return promise.then(res => {
      return res
    })
  }

  /**
   * igs要素聚合查询
   * @param {object} option
   * @param {string}[option.domain=null] igs服务地址域名 （domain和[protocol，ip，port]，二选一）
   * @param {string}[option.protocol="http"] igs服务地址网络协议 （domain和[protocol，ip，port]，二选一）
   * @param {string}[option.ip =null] igs服务地址ip （domain和[protocol，ip，port]，二选一）
   * @param {string}[option.port=null] igs服务地址port （domain和[protocol，ip，port]，二选一）
   * 矢量文档和矢量图层要素查询公共参数
   * @param {string} [option.f="geojson"] 返回结果的格式,缺省xml(json|xml|geojson)
   * @param {boolean} [option.compress] 当f="geojson"有效
   * @param {number} [option.level] 当f="geojson"有效
   * @param {Object} [option.geometry] 几何类型的图形参数,包含geometryType几何类型（例如：point，circle，rect，line，polygon等）
   * @param {string} [option.where] 查询条件（例如：id = 8）
   * @param {Number} [option.page=0] 返回的要素分页的页数，默认返回第0页
   * @param {Number} [option.pageCount=10] 要素结果集每页的记录数量，默认为20条/页
   *
   * @param {Boolean} [option.CompareRectOnly=false] 指定查询规则rule参数
   * @param {Boolean} [option.EnableDisplayCondition=false] 指定查询规则rule参数
   * @param {Boolean} [option.Intersect=true] 指定查询规则rule参数
   * @param {Boolean} [option.MustInside=false] 指定查询规则rule参数
   *
   * @param {Boolean} [option.IncludeAttribute=true]  指定查询结果的结构structs参数
   * @param {Boolean} [option.IncludeGeometry=true]  指定查询结果的结构structs参数
   * @param {Boolean} [option.IncludeWebGraphic=false] 指定查询结果的结构structs参数
   *
   * @param {string} [option.objectIds] 需要查询的要素Id号（说明：当此参数有值时，将忽略其他查询参数。）
   * @param {string} [option.orderField] 排序字段名称
   * @param {Boolean} [option.rtnLabel=true] 是否计算Label点
   * @param {Boolean} [option.isAsc=false] 按照字段进行排列时，是否升序排列
   * @param {string} [option.cursorType=“forward”] 游标类型 forward为向前光标 其他为向前向后
   * @param {string} [option.guid=“__readonly_user__”] 唯一id，可缺省
   * @param {string} [option.fields] 指定结果字段
   * @param {Number} [option.coordPrecision=2] coordPrecision坐标点的精度
   * @param {Boolean} [option.combine=true]
   * 矢量图层的查询参数
   * @param {string} [option.gdbp] 图层的gdbp地址，多个图层用逗号分隔
   * @param {string} [option.srsIds] 投影参考系，多个图层用半角逗号分隔
   * 矢量文档的要素查询
   * @param {string} [option.docName] 文档名称</param>
   * @param {Number} [option.mapIndex] 地图在文档下得序号（一般值为0）
   * @param {string} [option.layerIdxs] 要查询的图层索引(多个请用','分隔),单个索引支持组的情况，比如0-0-1-2，前面三级就是组的索引
   * 时空云的必须参数
   * @param {string} [option.dataService] 时空云文档名
   */
  public static igsCombineQueryFeature(option: FeatureQueryParam) {
    const queryParam: Record<string, unknown> = {}
    queryParam.f = option.f || 'geojson'
    if (queryParam.f === 'geojson') {
      queryParam.compress =
        option.compress !== undefined ? option.compress : false
      queryParam.level = option.level || option.level === 0 ? option.level : 8
    }
    if (option.geometry) {
      queryParam.geometryType = option.geometry.getGeometryType()
      queryParam.geometry = option.geometry.toString()
    }
    queryParam.where = option.where || undefined
    queryParam.page = option.page || 0
    queryParam.pageCount = option.pageCount || 10
    const rule = new Zondy.MRFS.QueryFeatureRule({
      CompareRectOnly:
        option.CompareRectOnly !== undefined ? option.CompareRectOnly : false,
      EnableDisplayCondition:
        option.EnableDisplayCondition !== undefined
          ? option.EnableDisplayCondition
          : false,
      Intersect: option.Intersect !== undefined ? option.Intersect : true,
      MustInside: option.MustInside !== undefined ? option.MustInside : false
    })
    queryParam.rule = rule.toJSON()
    const structs = new Zondy.MRFS.QueryFeatureStruct({
      IncludeAttribute:
        option.IncludeAttribute !== undefined ? option.IncludeAttribute : true,
      IncludeGeometry:
        option.IncludeGeometry !== undefined ? option.IncludeGeometry : true,
      IncludeWebGraphic:
        option.IncludeWebGraphic !== undefined
          ? option.IncludeWebGraphic
          : false
    })
    queryParam.structs = structs.toJSON()
    queryParam.objectIds = option.objectIds || undefined
    queryParam.orderField = option.orderField || undefined
    queryParam.rtnLabel = option.rtnLabel !== undefined ? option.rtnLabel : true
    queryParam.isAsc = option.isAsc !== undefined ? option.isAsc : false
    queryParam.cursorType = option.cursorType || 'forward'
    queryParam.guid = option.guid || '__readonly_user__'
    queryParam.fields = option.fields || ''
    queryParam.coordPrecision =
      option.coordPrecision || option.coordPrecision === 0
        ? option.coordPrecision
        : 2
    queryParam.combine = option.combine !== undefined ? option.combine : true

    let domain = option.domain || null
    if (!domain) {
      const protocol = option.protocol
      const ip = option.ip
      const port = option.port
      domain = `${protocol}://${ip}:${port}`
    }

    let url: string
    if (option.gdbp) {
      // 矢量图层
      queryParam.gdbp = option.gdbp
      queryParam.srsIds = option.srsIds
      url = `${domain}/onemap/layer/query`
    } else {
      // 矢量文档
      // option.layerIdxs下面已经做了判断这里不做处理
      // if (!option.docName || !option.layerIdxs) {
      if (!option.docName) {
        return null
      }
      // 文档名
      const { docName } = option
      // 文档索引
      const mapIndex = option.mapIndex || 0
      // 图层索引号
      const layerIdxs =
        option.layerIdxs || option.layerIdxs === '0' ? option.layerIdxs : '*'
      url = `${domain}/onemap/docs/${docName}/${mapIndex}/${layerIdxs}/query`
    }
    const promise = new Promise<FeatureGeoJSON[] | FeatureIGS[]>(
      (resolve, reject) => {
        axios.get(url, { params: queryParam }).then(
          res => {
            const { data } = res
            if (!data) {
              reject('undefined')
            } else {
              resolve(data)
            }
          },
          error => {
            reject(error)
          }
        )
      }
    )
    return promise.then(data => {
      return data
    })
  }

  /**
   * igs三维要素查询
   * @param {object} option
   * @param {string}[option.ip =null] igs服务地址ip （domain和[protocol，ip，port]，二选一）
   * @param {string}[option.port=null] igs服务地址port （domain和[protocol，ip，port]，二选一）
   * //矢量文档和矢量图层要素查询公共参数
   * @param {string} [option.f="geojson"] 返回结果的格式,缺省xml(json|xml|geojson)
   * @param {Object} [option.geometry] 几何类型的图形参数,包含geometryType几何类型（例如：point，circle，rect，line，polygon等）
   * @param {string} [option.where] 查询条件（例如：id = 8）
   * @param {Number} [option.page=0] 返回的要素分页的页数，默认返回第0页
   * @param {Number} [option.pageCount=10] 要素结果集每页的记录数量，默认为20条/页
   *
   * @param {Boolean} [option.CompareRectOnly=false] 指定查询规则rule参数
   * @param {Boolean} [option.EnableDisplayCondition=false] 指定查询规则rule参数
   * @param {Boolean} [option.Intersect=true] 指定查询规则rule参数
   * @param {Boolean} [option.MustInside=false] 指定查询规则rule参数
   *
   * @param {Boolean} [option.IncludeAttribute=true]  指定查询结果的结构structs参数
   * @param {Boolean} [option.IncludeGeometry=true]  指定查询结果的结构structs参数
   * @param {Boolean} [option.IncludeWebGraphic=false] 指定查询结果的结构structs参数
   *
   * @param {string} [option.objectIds] 需要查询的要素Id号（说明：当此参数有值时，将忽略其他查询参数。）
   * @param {string} [option.orderField] 排序字段名称
   * @param {Boolean} [option.rtnLabel=true] 是否计算Label点
   * @param {Boolean} [option.isAsc=false] 按照字段进行排列时，是否升序排列
   * @param {string} [option.cursorType=“forward”] 游标类型 forward为向前光标 其他为向前向后
   * @param {string} [option.guid=“__readonly_user__”] 唯一id，可缺省
   * 矢量图层的查询参数
   * @param {string} [option.gdbp] 图层的gdbp地址，多个图层用逗号分隔
   * 矢量文档的要素查询
   * @param {string} [option.docName] 文档名称</param>
   * @param {string} [option.layerIdxs] 要查询的图层索引(多个请用','分隔),单个索引支持组的情况，比如0-0-1-2，前面三级就是组的索引
   */
  public static igsQuery3DFeature(option: FeatureQueryParam) {
    let queryParam
    if (option.gdbp) {
      // 矢量图层
      queryParam = new Zondy.MRFS.QueryByLayerParameter(option.gdbp)
    } else {
      // 矢量文档
      queryParam = new Zondy.MRFS.QueryParameter()
    }
    queryParam.resultFormat = option.f || 'geojson'
    if (option.geometry) {
      queryParam.geometryType =
        option.geometryType && option.geometryType !== ''
          ? option.geometryType
          : option.geometry.getGeometryType()
      queryParam.geometry = option.geometry.toString()
    }
    queryParam.where = option.where || null
    queryParam.page = option.page || 0
    queryParam.pageCount = option.pageCount || 10
    queryParam.rule = new Zondy.MRFS.QueryFeatureRule({
      CompareRectOnly:
        option.CompareRectOnly !== undefined ? option.CompareRectOnly : false,
      EnableDisplayCondition:
        option.EnableDisplayCondition !== undefined
          ? option.EnableDisplayCondition
          : false,
      Intersect: option.Intersect !== undefined ? option.Intersect : true,
      MustInside: option.MustInside !== undefined ? option.MustInside : false
    })
    queryParam.struct = new Zondy.MRFS.QueryFeatureStruct({
      IncludeAttribute:
        option.IncludeAttribute !== undefined ? option.IncludeAttribute : true,
      IncludeGeometry:
        option.IncludeGeometry !== undefined ? option.IncludeGeometry : true,
      IncludeWebGraphic:
        option.IncludeWebGraphic !== undefined
          ? option.IncludeWebGraphic
          : false
    })
    queryParam.objectIds = option.objectIds || null
    queryParam.orderField = option.orderField || null
    queryParam.rtnLabel = option.rtnLabel !== undefined ? option.rtnLabel : true
    queryParam.isAsc = option.isAsc !== undefined ? option.isAsc : false
    queryParam.cursorType = option.cursorType || 'forward'
    queryParam.guid = option.guid || '__readonly_user__'
    let queryService: any
    if (option.gdbp) {
      // 矢量图层
      queryService = new Zondy.G3D.G3DMapDoc({
        ip: option.ip,
        port: option.port,
        gdbp: option.gdbp,
        ...queryParam
      })
    } else {
      // 矢量文档
      if (!option.docName || !option.layerIdxs) {
        return null
      }
      // 文档名
      const { docName } = option
      // 图层索引号
      const layerIdxs =
        option.layerIdxs || option.layerIdxs === '0' ? option.layerIdxs : '*'
      queryService = new Zondy.G3D.G3DMapDoc({
        ip: option.ip,
        port: option.port,
        docName,
        layerindex: layerIdxs,
        ...queryParam
      })
    }
    const promise = new Promise<FeatureGeoJSON | FeatureIGS>(resolve => {
      queryService.GetFeature(res => {
        if (!res) {
          resolve(undefined)
        } else {
          resolve(res)
        }
      })
    })
    return promise.then(res => {
      return res
    })
  }

  /**
   * dataStore要素查询
   * @param option 详见dataStorePgQueryFeature的option
   * @returns {Promise<*>}
   */
  public static async dataStoreQuery(option: FeatureQueryParam) {
    if (option.isEsGeoCode) {
      // es地名地址查询
      return this.dataStoreEsGeoCode(option)
    }

    // pg 要素查询
    if (!option.gdbp && option.docName) {
      const docInfo = await DocumentCatalog.getDocInfo({
        serverName: option.docName,
        ip: option.ip,
        port: option.port
      })

      const data = docInfo?.MapInfos[Number(option.mapIndex) || 0].CatalogLayer
      if (!data) {
        return null
      }
      if (option.layerIdxs) {
        const vectors = DocumentCatalog.getLayersByIndexes(
          option.layerIdxs,
          data,
          []
        )
        const gdbps: string[] = []
        for (let i = 0; i < vectors.length; i += 1) {
          const { URL } = vectors[i]
          if (URL) {
            gdbps.push(URL)
          }
        }
        option.gdbp = gdbps.join(',')
      } else {
        const layerName: string = option.layerName || ''
        const gdbp = DocumentCatalog.getLayerIndexesByNames(data, layerName, [])
        if (gdbp.length > 0) {
          option.gdbp = gdbp.join(',')
        }
      }
    }

    let gdbpArray: string[] = []
    if (!option.gdbp) {
      return null
    }

    if (option.gdbp.includes(',')) {
      gdbpArray = option.gdbp.split(',')
    } else {
      gdbpArray = [option.gdbp]
    }

    return Promise.all(
      gdbpArray.map(gdbp => {
        return this.dataStorePgQueryFeature(gdbp, option)
      })
    )
  }

  /**
   * dataStore pg的要素查询
   * @param gdbp 发布在igs上的pg图层gdbp地址，可以从中解析libName（数据库名）、schemas（工作空间名）、tableName（表名）
   * @param option - {Object} 查询条件
   * @param {string} [option.domain=null] dataStore服务地址域名 （domain和[protocol，ip，port]，二选一）
   * @param {string} [option.protocol="http"] dataStore服务地址网络协议 （domain和[protocol，ip，port]，二选一）
   * @param {string} [option.ip =null] dataStore服务地址ip （domain和[protocol，ip，port]，二选一）
   * @param {string} [option.port=null] dataStore服务地址port （domain和[protocol，ip，port]，二选一）
   * @param {Boolean} [option.includeProperites = true] 查询结果中是否包含属性
   * @param {String} [option.pageCount] 每页大小。默认10
   * @param {String} [option.page] 页码，从1开始
   * @param {String} [option.where] 属性条件 （例如：id>5,id<10）
   * @param {String} [option.fields] 统计计算中用于分组字段名列表
   * @param {String} [option.geometry] 几何信息，圆、多边形等
   * @param {String} [option.geoFormat="wkt"] 几何类型，wkt、wkb、geojson、自定义等
   * @param {String} [option.sref] 动态投影坐标系 ID，支持 MapGIS 和 EPSG 标准编号，其中 MapGIS 只支持当前库中自带的坐标系的 ID，EPSG 标准请 使用 EPSG:4326 格式，若指定了该参数，则系统认为 geometry 的坐标系为此坐标系
   */
  public static dataStorePgQueryFeature(
    gdbp: string,
    option: FeatureQueryParam
  ) {
    const queryParam: Record<string, unknown> = {}
    const vecStr = gdbp.split('/')
    queryParam.libName = vecStr[vecStr.length - 5]
    queryParam.tableName = vecStr[vecStr.length - 1]
    queryParam.schemas = vecStr[vecStr.length - 5]

    queryParam.pageNo = option.page !== undefined ? option.page : 1
    queryParam.pageSize = option.pageCount || 10
    queryParam.includeProperites = true
    if (option.geometry) {
      queryParam.geoFormat = 'wkt'
      const geometryType: string = option.geometry.getGeometryType()
      const arr: string[] = []
      let str
      if (geometryType === 'rect') {
        arr.push(`${option.geometry.xmin} ${option.geometry.ymin}`)
        arr.push(`${option.geometry.xmin} ${option.geometry.ymax}`)
        arr.push(`${option.geometry.xmax} ${option.geometry.ymax}`)
        arr.push(`${option.geometry.xmax} ${option.geometry.ymin}`)
        arr.push(`${option.geometry.xmin} ${option.geometry.ymin}`)
      } else if (geometryType === 'polygon' || geometryType === 'polygon') {
        const { pointArr } = option.geometry
        for (let i = 0; i < pointArr.length; i += 1) {
          arr.push(`${pointArr[i].x} ${pointArr[i].y}`)
        }
        str = arr.join(',')
        if (geometryType === 'polygon') {
          queryParam.geometry = `POLYGON(( ${str}))`
        } else if (geometryType === 'line') {
          queryParam.geometry = `LINESTRING(${str})`
        }
      } else if (geometryType === 'point') {
        queryParam.geometry = `POINT(${option.geometry.x} ${option.geometry.y})`
      }
    }
    if (option.where) {
      queryParam.filter = option.where
    }
    if (option.fields) {
      queryParam.fields = option.fields
    }
    queryParam.sref = option.sref

    let domain = option.domain || null
    const ip = option.ip
    const port = option.port
    if (!domain) {
      const protocol = option.protocol
      domain = `${protocol}://${ip}:${port}`
    }
    queryParam.domain = domain
    const promise = new Promise<FeatureGeoJSON>((resolve, reject) => {
      Zondy.DataStore.PGQueryStats(
        ip,
        port,
        queryParam,
        res => {
          if (!res || !res.features || res.features.length <= 0) {
            reject('undefined')
          } else {
            resolve(res)
          }
        },
        error => {
          reject(error)
        }
      )
    })
    return promise.then(res => {
      return res
    })
  }

  /**
   * dataStore es的地名地址查询
   * @param option - {Object} 查询条件
   * @param {string} [option.domain=null] dataStore服务地址域名 （domain和[protocol，ip，port]，二选一）
   * @param {string} [option.protocol="http"] dataStore服务地址网络协议 （domain和[protocol，ip，port]，二选一）
   * @param {string} [option.ip =null] dataStore服务地址ip （domain和[protocol，ip，port]，二选一）
   * @param {string} [option.port=null] dataStore服务地址port （domain和[protocol，ip，port]，二选一）
   * @param {String} [option.libName] 数据库名
   * @param {String} [option.pageCount] 每页大小。默认10
   * @param {String} [option.page] 页码，从1开始
   * @param {String} [option.province] 省约束信息
   * @param {String} [option.city] 市约束信息
   * @param {String} [option.bbox] 矩形范围信息
   * @param {String} [option.hotGroup] 数据分类
   * @param {Boolean} [option.decode] 是否为逆地理编码
   * @param {Number} [option.lon] 经度
   * @param {Number} [option.lat] 纬度
   * @param {Number} [option.dis=0.1] 查询范围半径
   */
  public static dataStoreEsGeoCode(option: FeatureQueryParam) {
    const queryParam: Record<string, unknown> = {}
    queryParam.libName = option.libName
    queryParam.pageNo = option.page !== undefined ? option.page : 1
    queryParam.pageSize = option.pageCount || 10
    queryParam.province = option.province
    queryParam.city = option.city
    queryParam.bbox = option.bbox
    queryParam.hotGroup = option.hotGroup

    let domain = option.domain || null
    const ip = option.ip
    const port = option.port
    if (!domain) {
      const protocol = option.protocol
      domain = `${protocol}://${ip}:${port}`
    }
    queryParam.domain = domain

    const { decode } = option
    let fun: Function
    if (decode) {
      queryParam.lon = option.lon
      queryParam.lat = option.lat
      queryParam.dis = option.dis
      fun = Zondy.DataStore.ESGeoDecode
    } else {
      queryParam.keyWord = option.where || ''
      fun = Zondy.DataStore.ESGeoCode
    }
    const promise = new Promise<ESGeoCodeFeatures>((resolve, reject) => {
      fun(
        queryParam,
        res => {
          if (!res || !res.t) {
            reject('undefined')
          } else {
            resolve(res.t)
          }
        },
        error => {
          reject(error)
        }
      )
    })
    return promise.then(res => {
      return res
    })
  }
}
