import * as Zondy from '@mapgis/webclient-es6-service'

import axios from 'axios'
import baseConfigInstance from '../config/base'

/**
 * 地图文档查询参数结构
 */
export interface DocInfoQueryParam {
  serverName: string // igs服务名
  protocol?: string // 网络协议
  ip?: string // 服务ip
  port?: string // 服务port
  domain?: string // 域名
  guid?: string // guid
}

export interface ExecuteWorkflowParam {
  f: string // 返回值类型，默认json
  isAsy: boolean // 是否异步调用，默认true
  ip: string // 默认使用配置ip
  port: string // 默认使用配置port
  flowID: string // 工作流id
  param: object // 工作流执行参数
}

export interface WorkflowStatusParam {
  id: string // 工作流id
  ip: string
  port: string
  f?: string
}

/**
 * 地图文档信息CatalogLayer结构
 */
export interface MapInfoCatalogLayer {
  URL?: string
  EncryptPassword?: unknown
  LayerName?: string
  IsValid?: boolean
  SRSName?: string
  SRSId?: string
  Weight?: number
  State?: string
  GeomType?: string
  CDynShowStyle?: unknown
  Type?: string
  SymbolScale?: number
  MaxScale?: number
  MinScale?: number
  Range?: Bound
  ProjTransRange?: Bound
  LevelStart?: number
  LevelEnd?: number
  Resolutions?: number[]
  GroupMapLayerInfo?: MapInfoCatalogLayer[]
  SysLibraryGuid?: string
  layerIndex?: string
}

/**
 * 地图文档信息MapInfo结构
 */
export interface DocInfoMapInfo {
  CatalogLayer?: MapInfoCatalogLayer[]
  MapName?: string
  Description?: string
  Range?: string
  IsProjTrans?: boolean
  LayerCount?: number
  ProjTrans?: string
  ProjTransName?: string
  SymbolScale?: number
  MaxScale?: number
  MinScale?: number
}

/**
 * 地图文档信息结构
 */
export interface DocInfo {
  DocInfo?: unknown
  MapInfos: DocInfoMapInfo[]
}

/**
 * 查询参数结构
 */
export interface FeatureQueryParam {
  protocol?: string // 网络协议
  ip?: string // 服务ip
  port?: string // 服务port
  domain?: string // 域名
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
  combine?: boolean // 是否使用igs的onemap扩展服务

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

/**
 * GeoJSON的SpatialAttr结构
 */
export interface MetaInfoGeoSpatialAttr {
  xmin?: number
  ymin?: number
  xmax?: number
  ymax?: number
  srefID?: number
}

/**
 * GeoJSON的MetaInfo Geometry结构
 */
export interface MetaInfoGeometry {
  fields?: Array<Record<string, unknown>>
  spatialAttr?: MetaInfoGeoSpatialAttr
}

/**
 * GeoJSON的MetaInfo结构
 */
export interface GMetaInfo {
  name?: string
  geometry?: MetaInfoGeometry
}

/**
 * GeoJSON的CRS结构
 */
export interface GeoCRS {
  type?: string
  properties?: Record<string, unknown>
}

/**
 * GeoJSON的Geometry结构
 */
export interface GGeometry {
  type: string
  coordinates: Array<any>
  crs?: GeoCRS
}

/**
 * GeoJSON的Feature结构
 */
export interface GFeature {
  type: string
  properties: Record<string, unknown>
  geometry: GGeometry
  bound?: Record<string, unknown>
}

/**
 * GeoJSON结构
 */
export interface FeatureGeoJSON {
  type: string
  features: GFeature[]
  errorCode?: number
  dataCount?: number
  metaInfo?: GMetaInfo
}

/**
 * IGS查询结果AttStruct结构
 */
export interface FeatureIGSAttStruct {
  FldNumber?: number
  FldName?: any[]
  FldType?: any[]
  FldAlias?: any[]
}

/**
 * IGS查询结果Bound结构
 */
export interface Bound {
  xmin?: number
  ymin?: number
  xmax?: number
  ymax?: number
}

/**
 * IGS查询结果XY结构
 */
export interface XY {
  x?: number
  y?: number
}

/**
 * IGS查询结果Arc结构
 */
export interface Arc {
  Dots?: XY[]
  ArcID?: number
}

/**
 * IGS查询结果Ring结构
 */
export interface Ring {
  Arcs?: Arc[]
}

/**
 * IGS查询结果PntGeom结构
 */
export interface PntGeom {
  Dot?: XY
  GID?: number
}

/**
 * IGS查询结果LinGeom结构
 */
export interface LinGeom {
  Line?: Ring
  GID?: number
}

/**
 * IGS查询结果RegGeom结构
 */
export interface RegGeom {
  Rings?: Ring[]
  GID?: number
}

/**
 * IGS查询结果FGeom结构
 */
export interface FGeom {
  PntGeom?: PntGeom[]
  LinGeom?: LinGeom[]
  RegGeom?: RegGeom[]
  SurfaceGeom?: unknown
  EntityGeom?: unknown
  StreamGeom?: unknown
  G3DPntGeom?: unknown
  G3DLinGeom?: unknown
  G3DRegGeom?: unknown
}

/**
 * IGS查询结果SFEleArray结构
 */
export interface FeatureIGSSFEle {
  FID: number
  ftype: number
  bound?: Bound
  AttValue?: any[]
  fGeom: FGeom
  GraphicInfo?: unknown
}

/**
 * IGS查询结果的结构
 */
export interface FeatureIGS {
  AttStruct: FeatureIGSAttStruct
  SFEleArray: FeatureIGSSFEle[]
  LabelDots?: unknown[]
  TotalCount: number
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

export interface LayerInfoQueryParam {
  protocol?: string
  domain?: string
  ip?: string
  port?: string
  layerType?: string
  gdbp?: string
  serverName?: string
}

class QueryFeatures {
  public systemConfig: any

  // 地图文档图层信息
  public globalDocInfo: Record<string, DocInfo> = {}

  // 地图默认站点信息
  private defaultServer = {
    protocol: 'http',
    ip: 'develop.smaryun.com',
    port: '6163',
    guid: '',
    token: '',
    projection: ''
  }

  // public get _defaultServer() {
  //   return this.defaultServer
  // }

  public getDocInfo(option: DocInfoQueryParam) {
    if (!option.serverName) {
      return null
    }
    if (this.globalDocInfo[option.serverName]) {
      return this.globalDocInfo[option.serverName]
    }
    let domain = option.domain || null
    if (!domain) {
      const protocol = option.protocol || this.defaultServer.protocol
      const ip = option.ip || this.defaultServer.ip
      const port = option.port || this.defaultServer.port
      domain = `${protocol}://${ip}:${port}`
    }
    const url = `${domain}/igs/rest/mrcs/docs/${
      option.serverName
    }?dataService=${option.serverName}&f=json&tree=true&guid=${option.guid ||
      '__readonly_user__'}`
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    const self = this
    const promise = new Promise<DocInfo>((resolve, reject) => {
      axios.get<DocInfo>(url).then(
        res => {
          const { data } = res
          if (!data) {
            resolve(undefined)
          } else {
            for (let i = 0; i < data.MapInfos.length; i += 1) {
              const { CatalogLayer } = data.MapInfos[i]
              if (CatalogLayer) {
                data.MapInfos[i].CatalogLayer = self.disposeDocInfo(
                  CatalogLayer
                )
              }
            }
            self.globalDocInfo[option.serverName] = data
            resolve(data)
          }
        },
        error => {
          reject(error)
        }
      )
    })
    return promise.then(data => {
      return data
    })
  }

  public get3DDocInfo(option: DocInfoQueryParam) {
    if (!option.serverName) {
      return null
    }
    if (this.globalDocInfo[option.serverName]) {
      return this.globalDocInfo[option.serverName]
    }
    let domain = option.domain || null
    if (!domain) {
      const protocol = option.protocol || this.defaultServer.protocol
      const ip = option.ip || this.defaultServer.ip
      const port = option.port || this.defaultServer.port
      domain = `${protocol}://${ip}:${port}`
    }
    const url = `${domain}/igs/rest/g3d/${option.serverName}/GetDocInfo`
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    const self = this
    const promise = new Promise<DocInfo>((resolve, reject) => {
      axios.get<DocInfo>(url).then(
        res => {
          const { data } = res
          if (!data) {
            resolve(undefined)
          } else {
            self.globalDocInfo[option.serverName] = data
            resolve(data)
          }
        },
        error => {
          reject(error)
        }
      )
    })
    return promise.then(data => {
      return data
    })
  }

  /**
   * 递归给地图文档的图层赋值layerIndex
   * @param vectorInfo
   * @param layerIndex //图层组的layerIndex赋值采用多级：上级layerIndex-i
   */
  private disposeDocInfo(
    vectorInfo: MapInfoCatalogLayer[],
    layerIndex?: string
  ) {
    if (!vectorInfo) {
      return []
    }
    for (let i = 0; i < vectorInfo.length; i += 1) {
      const tip =
        layerIndex && layerIndex !== '' ? `${layerIndex}-${i}` : String(i)
      if (vectorInfo[i].Type === 'Layer') {
        vectorInfo[i].layerIndex = tip
      } else if (vectorInfo[i].Type === 'Group') {
        const groupMapLayerInfo = vectorInfo[i].GroupMapLayerInfo
        if (groupMapLayerInfo) {
          vectorInfo[i].GroupMapLayerInfo = this.disposeDocInfo(
            groupMapLayerInfo,
            tip
          )
        }
      }
    }
    return vectorInfo
  }

  /**
   * 获取图层索引号
   * @param data      [in]      MapInfoCatalogLayer类型的数组
   * @param layerName [in]      图层名称列表：以逗号分隔,用于获取指定图层的索引。
   * @param code      [in]      行政区代码列表:以逗号分隔，当图层的URL中含有行政区代码时，该参数用于获取指定图层的索引。
   * @param array     [out]     图层索引列表
   * @param urlArray  [int out] 图层url列表
   * @returns                   图层索引列表
   * @todo 该接口参数命名不规范，需要规范化。
   */
  public getVectorIndex(
    data: MapInfoCatalogLayer[],
    layerName = '',
    code = '',
    array: string[] = [],
    urlArray: string[] = []
  ) {
    array = array || []
    urlArray = urlArray || []
    if (layerName !== '' || code !== '') {
      for (let i = 0; i < data.length; i += 1) {
        const { URL, layerIndex, GroupMapLayerInfo } = data[i]
        if (data[i].Type === 'Layer') {
          if (code === '') {
            let layerNames: string[] = []
            if (layerName.includes(',')) {
              layerNames = layerName.split(',')
            } else {
              layerNames = [layerName]
            }
            for (let j = 0; j < layerNames.length; j += 1) {
              if (
                URL &&
                URL.indexOf(layerNames[j]) === URL.length - layerNames[j].length
              ) {
                if (!urlArray.includes(URL)) {
                  urlArray.push(URL)
                  if (layerIndex) {
                    array.push(layerIndex)
                  }
                }
              }
            }
          } else if (layerName === '') {
            let codes: string[] = []
            if (code.includes(',')) {
              codes = code.split(',')
            } else {
              codes = [code]
            }
            for (let j = 0; j < codes.length; j += 1) {
              if (URL && URL.includes(codes[j])) {
                if (!urlArray.includes(URL)) {
                  urlArray.push(URL)
                  if (layerIndex) {
                    array.push(layerIndex)
                  }
                }
              }
            }
          } else if (
            URL &&
            URL.indexOf(layerName) === URL.length - layerName.length &&
            URL.includes(code)
          ) {
            if (!urlArray.includes(URL)) {
              urlArray.push(URL)
              if (layerIndex) {
                array.push(layerIndex)
              }
            }
          }
        } else if (GroupMapLayerInfo && GroupMapLayerInfo.length > 0) {
          array = this.getVectorIndex(
            GroupMapLayerInfo,
            layerName,
            code,
            array,
            urlArray
          )
        }
      }
    } else {
      for (let i = 0; i < data.length; i += 1) {
        const { layerIndex, GroupMapLayerInfo } = data[i]
        if (data[i].Type === 'Layer') {
          if (layerIndex) {
            array.push(layerIndex)
          }
        } else if (GroupMapLayerInfo && GroupMapLayerInfo.length > 0) {
          array = this.getVectorIndex(
            GroupMapLayerInfo,
            layerName,
            code,
            array,
            urlArray
          )
        }
      }
    }
    return array
  }

  /**
   * 获取图层gdbp
   * @param data        [in]      MapInfoCatalogLayer类型的数组
   * @param layerName   [in]      图层名称列表：以逗号分隔,用于获取指定图层的索引。
   * @param code        [in]      行政区代码列表:以逗号分隔，当图层的URL中含有行政区代码时，该参数用于获取指定图层的索引。
   * @param urlArray    [int out] 图层gdbp列表
   * @returns                     图层gdbp列表
   * @todo 该接口参数命名不规范，需要规范化。
   */
  public getVectorGdbp(
    data: MapInfoCatalogLayer[],
    layerName: string,
    code: string,
    urlArray: string[]
  ) {
    urlArray = urlArray || []
    if (layerName !== '' || code !== '') {
      for (let i = 0; i < data.length; i += 1) {
        const { URL, GroupMapLayerInfo } = data[i]
        if (data[i].Type === 'Layer') {
          if (code === '') {
            let layerNames: string[] = []
            if (layerName.includes(',')) {
              layerNames = layerName.split(',')
            } else {
              layerNames = [layerName]
            }
            for (let j = 0; j < layerNames.length; j += 1) {
              if (
                URL &&
                URL.indexOf(layerNames[j]) === URL.length - layerNames[j].length
              ) {
                if (!urlArray.includes(URL)) {
                  urlArray.push(URL)
                }
              }
            }
          } else if (layerName === '') {
            let codes: string[] = []
            if (code.includes(',')) {
              codes = code.split(',')
            } else {
              codes = [code]
            }
            for (let j = 0; j < codes.length; j += 1) {
              if (URL && URL.includes(codes[j])) {
                if (!urlArray.includes(URL)) {
                  urlArray.push(URL)
                }
              }
            }
          } else if (
            URL &&
            URL.indexOf(layerName) === URL.length - layerName.length &&
            URL.includes(code)
          ) {
            if (!urlArray.includes(URL)) {
              urlArray.push(URL)
            }
          }
        } else if (GroupMapLayerInfo && GroupMapLayerInfo.length > 0) {
          urlArray = this.getVectorGdbp(
            GroupMapLayerInfo,
            layerName,
            code,
            urlArray
          )
        }
      }
    } else {
      for (let i = 0; i < data.length; i += 1) {
        const { URL, GroupMapLayerInfo } = data[i]
        if (data[i].Type === 'Layer') {
          if (URL) {
            urlArray.push(URL)
          }
        } else if (GroupMapLayerInfo && GroupMapLayerInfo.length > 0) {
          urlArray = this.getVectorGdbp(
            GroupMapLayerInfo,
            layerName,
            code,
            urlArray
          )
        }
      }
    }
    return urlArray
  }

  /**
   * 查询通用接口
   * @param {object} option
   * @param {object} [option.isDataStoreQuery] 是否为DataStore的查询
   * @param {boolean} combine 是否走onemap查询方式。不涉及分页的，走IGS的，设置为向前光标速度更快；一张图的查询做了优化，查询速度 比IGS快速，一张图支持属性合并
   */
  public query(option: FeatureQueryParam, combine?: boolean, is3D?: boolean) {
    if (!option) {
      return null
    }
    this.systemConfig = baseConfigInstance.config
    if (option.isDataStoreQuery) {
      // datastore
      return this.dataStoreQuery(option)
    } // igs
    return this.igsQuery(option, combine, is3D)
  }

  /**
   * igs要素查询
   * @param option 详见igsQueryFeature和igsOnemapQueryFeature的option
   * @param {boolean} combine 是否走onemap查询方式。不涉及分页的，走IGS的，设置为向前光标速度更快；一张图的查询做了优化，查询速度 比IGS快速，一张图支持属性合并
   * @param {boolean} is3D 是否为三维要素查询。
   * @returns {Promise<void>}
   */
  public async igsQuery(
    option: FeatureQueryParam,
    combine?: boolean,
    is3D?: boolean
  ) {
    if (!is3D && option.docName && option.layerIdxs !== undefined) {
      // 参数是否含有文档名和图层索引号
      let docInfo = this.globalDocInfo[option.docName]
      if (!docInfo) {
        const param = {
          serverName: option.docName,
          ip: option.ip,
          port: option.port
        }
        await this.getDocInfo(param)
        docInfo = this.globalDocInfo[option.docName]
      }
      const data = docInfo.MapInfos[Number(option.mapIndex) || 0].CatalogLayer
      const layerName: string = option.layerName || ''
      const code: string = option.code || ''
      if (data && option.layerIdxs === '') {
        option.layerIdxs = this.getVectorIndex(
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
      return this.igsOnemapQueryFeature(option)
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
   * 地质云的必须参数
   * @param {string} [option.dataService] 时空云文档名
   */
  public igsQueryFeature(option: FeatureQueryParam) {
    let queryParam
    if (option.gdbp) {
      // 矢量图层
      queryParam = new Zondy.MRFS.QueryByLayerParameter(option.gdbp)
      queryParam.proj = option.srsIds || this.systemConfig.projectionName
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
      const protocol = option.protocol || this.defaultServer.protocol
      const ip = option.ip || this.defaultServer.ip
      const port = option.port || this.defaultServer.port
      domain = `${protocol}://${ip}:${port}`
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
   * igs要素查询（onemap扩展服务）
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
   * 地质云的必须参数
   * @param {string} [option.dataService] 时空云文档名
   */
  public igsOnemapQueryFeature(option: FeatureQueryParam) {
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
      const protocol = option.protocol || this.defaultServer.protocol
      const ip = option.ip || this.defaultServer.ip
      const port = option.port || this.defaultServer.port
      domain = `${protocol}://${ip}:${port}`
    }

    let url: string
    if (option.gdbp) {
      // 矢量图层
      queryParam.gdbp = option.gdbp
      queryParam.srsIds = option.srsIds || this.systemConfig.projectionName
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
   * 地质云的必须参数
   */
  public igsQuery3DFeature(option: FeatureQueryParam) {
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
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let queryService: any
    if (option.gdbp) {
      // 矢量图层
      queryService = new Zondy.MRCS.G3DMapDoc({
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
      queryService = new Zondy.MRCS.G3DMapDoc({
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
  public async dataStoreQuery(option: FeatureQueryParam) {
    if (option.isEsGeoCode) {
      // es地名地址查询
      return this.dataStoreEsGeoCode(option)
    }

    // pg 要素查询
    if (!option.gdbp && option.docName) {
      const docInfo = this.globalDocInfo[option.docName]
      const data = docInfo.MapInfos[Number(option.mapIndex) || 0].CatalogLayer
      if (!data) {
        return null
      }
      if (option.layerIdxs) {
        const vectors = this.getVectorByIndex(option.layerIdxs, data, [])
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
        const gdbp = this.getGdbpByVectorName(data, layerName, [])
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
  public dataStorePgQueryFeature(gdbp: string, option: FeatureQueryParam) {
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
    queryParam.sref = option.sref || this.systemConfig.projection

    let domain = option.domain || null
    const ip = option.ip || this.systemConfig.DataStoreIp
    const port = option.port || this.systemConfig.DataStorePort
    if (!domain) {
      const protocol = option.protocol || this.defaultServer.protocol
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
  public dataStoreEsGeoCode(option: FeatureQueryParam) {
    const queryParam: Record<string, unknown> = {}
    queryParam.libName = option.libName
    queryParam.pageNo = option.page !== undefined ? option.page : 1
    queryParam.pageSize = option.pageCount || 10
    queryParam.province = option.province
    queryParam.city = option.city
    queryParam.bbox = option.bbox
    queryParam.hotGroup = option.hotGroup

    let domain = option.domain || null
    const ip = option.ip || this.systemConfig.DataStoreIp
    const port = option.port || this.systemConfig.DataStorePort
    if (!domain) {
      const protocol = option.protocol || this.defaultServer.protocol
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

  /**
   * 根据图层索引获取图层信息
   * @param layerIdxs               [in]  图层索引列表，以逗号分隔.图层索引为igs返回的DocInfo中定义的索引,
   * 对图层进行查询、编辑时,通过该索引指定图层。
   * @param sourceLayerInfoArray    [in]  源图层信息列表，待过滤的图层
   * @param destLayerInfoArray      [in out]  目标图层列表，与layerIdxs对应的图层列表。
   * @returns 目标图层列表，与layerIdxs对应的图层列表。
   */
  public getVectorByIndex(
    layerIdxs: string,
    sourceLayerInfoArray: MapInfoCatalogLayer[],
    destLayerInfoArray: MapInfoCatalogLayer[] = []
  ) {
    // 图层索引号数组
    if (!layerIdxs || layerIdxs === '' || !sourceLayerInfoArray) {
      return []
    }

    if (!destLayerInfoArray) {
      destLayerInfoArray = []
    }

    let layerIdxsArr: string[] = []
    if (layerIdxs.includes(',')) {
      layerIdxsArr = layerIdxs.split(',')
    } else {
      layerIdxsArr = [layerIdxs]
    }

    for (let i = 0; i < sourceLayerInfoArray.length; i += 1) {
      for (let m = 0; m < layerIdxsArr.length; m += 1) {
        if (layerIdxsArr[m] === sourceLayerInfoArray[i].layerIndex) {
          destLayerInfoArray.push(sourceLayerInfoArray[i])
        }
      }

      if (sourceLayerInfoArray[i].Type === 'Group') {
        const { GroupMapLayerInfo } = sourceLayerInfoArray[i]
        if (GroupMapLayerInfo) {
          destLayerInfoArray = this.getVectorByIndex(
            layerIdxs,
            GroupMapLayerInfo,
            destLayerInfoArray
          )
        }
      }
    }

    return destLayerInfoArray
  }

  /**
   * 通过图层名获取图层gdbp
   * @param data
   * @param names
   * @param urlArray
   */
  public getGdbpByVectorName(
    data: MapInfoCatalogLayer[],
    names: string,
    urlArray: string[]
  ) {
    if (names === '') {
      return []
    }
    urlArray = urlArray || []
    let tempNames: string[]
    if (names.includes(',')) {
      tempNames = names.split(',')
    } else {
      tempNames = [names]
    }
    for (let i = 0; i < data.length; i += 1) {
      if (data[i].Type === 'Layer') {
        for (let j = 0; j < tempNames.length; j += 1) {
          const { URL } = data[i]
          if (URL && URL.indexOf(tempNames[j]) > 0) {
            if (!urlArray.includes(URL)) {
              urlArray.push(URL)
            }
          }
        }
      } else {
        const { GroupMapLayerInfo } = data[i]
        if (GroupMapLayerInfo) {
          urlArray = this.getGdbpByVectorName(
            GroupMapLayerInfo,
            names,
            urlArray
          )
        }
      }
    }
    return urlArray
  }

  /**
   * 执行工作流
   * @param {object} option
   * @param {string|null} option.f 返回值类型，默认json
   * @param {boolean|null} option.isAsy 是否异步调用，默认true
   * @param {string|null} option.ip ip,默认使用配置ip
   * @param {string|port} oprion.port port,默认使用配置port
   * @param {string} option.flowID 工作流id
   * @param {object} option.param 工作流执行参数
   */
  public executeWorkflow(option: ExecuteWorkflowParam) {
    option = option || {}
    return new Promise((resolve, reject) => {
      if (option.flowID) {
        option.f = option.f || 'json'
        option.isAsy = option.isAsy || true
        option.param = option.param || {}
        option.ip = option.ip || baseConfigInstance.config.ip
        option.port = option.port || baseConfigInstance.config.port
        const url = `http://${option.ip}:${option.port}/igs/rest/mrfws/execute/${option.flowID}?f=${option.f}&isAsy=${option.isAsy}`
        axios
          .post(url, option.param, {
            headers: {
              'Content-Type': 'text/plain'
            }
          })
          .then(res => {
            if (res.status === 200) {
              resolve(res.data)
            } else {
              reject('请求失败')
            }
          })
          .catch(e => {
            reject(e)
          })
      } else {
        reject('参数错误')
      }
    })
  }

  /**
   * 获取工作流执行状态
   * @param {object} option
   * @param {string|null} option.ip ip,默认使用配置ip
   * @param {string|null} option.port port,默认使用配置port
   * @param {string} option.id 工作流id
   */
  public getWorkflowStatus(option: WorkflowStatusParam) {
    option = option || {}
    return new Promise((resolve, reject) => {
      if (option.id) {
        option.ip = option.ip || baseConfigInstance.config.ip
        option.port = option.port || baseConfigInstance.config.port
        const url = `http://${option.ip}:${option.port}/igs/rest/mrfws/status/${option.id}`
        axios
          .get(url)
          .then(res => {
            if (res.status === 200) {
              resolve(res.data)
            } else {
              reject('请求失败')
            }
          })
          .catch(e => {
            reject(e)
          })
      } else {
        reject('参数错误')
      }
    })
  }

  /**
   * 获取工作流列表
   * @param {object|null} option
   * @param {string|null} option.ip ip默认使用系统配置ip
   * @param {string|null} option.port port默认使用系统配置port
   */
  public getWorkflowList(option: WorkflowStatusParam) {
    option = option || {}
    return new Promise((resolve, reject) => {
      option.ip = option.ip || baseConfigInstance.config.ip
      option.port = option.port || baseConfigInstance.config.port
      const url = `http://${option.ip}:${option.port}/igs/rest/mrfws/workflows?f=json`
      axios
        .get(url)
        .then(res => {
          if (res.status === 200) {
            resolve(res.data)
          } else {
            reject('请求失败')
          }
        })
        .catch(e => {
          reject(e)
        })
    })
  }

  /**
   * 获取工作流执行结果
   * @param {object} option
   * @param {string|null} option.ip ip,默认使用配置ip
   * @param {string|null} option.port port,默认使用配置port
   * @param {string} option.id 工作流id
   * @param {string|null} option.f 返回结果类型，默认json
   */
  public getWorkflowResult(option: WorkflowStatusParam) {
    option = option || {}
    return new Promise((resolve, reject) => {
      if (option.id) {
        option.ip = option.ip || baseConfigInstance.config.ip
        option.port = option.port || baseConfigInstance.config.port
        option.f = option.f || 'json'
        const url = `http://${option.ip}:${option.port}/igs/rest/mrfws/results/${option.id}?f=${option.f}`
        axios
          .get(url)
          .then(res => {
            if (res.status === 200) {
              resolve(res.data)
            } else {
              reject('请求失败')
            }
          })
          .catch(e => {
            reject(e)
          })
      } else {
        reject('参数错误')
      }
    })
  }

  /**
   * IGServer数据结构转为GeoJSON数据结构
   * @param igsFeatures
   */
  public igsFeaturesToGeoJSONFeatures(igsFeatures: FeatureIGS) {
    const dataCount =
      igsFeatures.TotalCount > -1
        ? igsFeatures.TotalCount
        : igsFeatures.SFEleArray.length
    const geojsonFeatures: FeatureGeoJSON = {
      type: 'FeatureCollection',
      features: [],
      dataCount
    }
    if (!igsFeatures.SFEleArray) {
      return geojsonFeatures
    }
    const tags = igsFeatures.AttStruct.FldName
    const alias = igsFeatures.AttStruct.FldAlias
    const fldType = igsFeatures.AttStruct.FldType
    for (let i = 0; i < igsFeatures.SFEleArray.length; i += 1) {
      const sfele = igsFeatures.SFEleArray[i]
      const { ftype, FID, bound, AttValue, fGeom } = sfele
      const properties = { fid: FID }
      if (AttValue && tags) {
        for (let a = 0; a < AttValue.length; a += 1) {
          const val = AttValue[a]
          const tag = alias && alias[a] && alias[a] !== '' ? alias[a] : tags[a]
          if (
            val !== null &&
            fldType &&
            ['int', 'double', 'float', 'long', 'number'].includes(fldType[a])
          ) {
            properties[tag] = Number(val)
          } else {
            properties[tag] = val
          }
        }
      }

      let coordinates: any[] = []
      let type = ''
      if (ftype === 1) {
        // 点
        if (fGeom.PntGeom) {
          const { Dot } = fGeom.PntGeom[0]
          if (Dot) {
            coordinates = [Dot.x, Dot.y]
          }
        }
        type = 'Point'
      } else if (ftype === 2) {
        // 线
        if (fGeom.LinGeom) {
          const { Line } = fGeom.LinGeom[0]
          if (Line) {
            const { Arcs } = Line
            if (Arcs) {
              const LineDots = Arcs[0].Dots
              if (LineDots) {
                for (let l = 0; l < LineDots.length; i += 1) {
                  const coord = [LineDots[l].x, LineDots[l].y]
                  coordinates.push(coord)
                }
              }
            }
          }
        }
        type = 'LineString'
      } else if (ftype === 3) {
        // 面
        if (fGeom.RegGeom) {
          const { Rings } = fGeom.RegGeom[0]
          if (Rings) {
            const { Arcs } = Rings[0]
            if (Arcs) {
              for (let p = 0; p < Arcs.length; p += 1) {
                const arc: any[] = []
                const PolygonDots = Arcs[p].Dots
                if (PolygonDots) {
                  for (let d = 0; d < PolygonDots.length; d += 1) {
                    const coord = [PolygonDots[d].x, PolygonDots[d].y]
                    arc.push(coord)
                  }
                  coordinates.push(arc)
                }
              }
            }
          }
        }
        type = 'Polygon'
      }

      const geometry = {
        type,
        coordinates
      }

      const feature: GFeature = {
        type: 'Feature',
        properties,
        geometry,
        bound: { ...bound }
      }
      geojsonFeatures.features.push(feature)
    }
    return geojsonFeatures
  }

  /**
   * dataStore数据结构转IGServer数据结构
   * @param res
   */
  changeDSResToMapGis(res: FeatureGeoJSON[]) {
    const arr: FeatureIGS[] = []
    for (let i = 0; i < res.length; i += 1) {
      arr.push(this.GeoJSONFeaturesToMapGIS(res[i]))
    }
    return arr
  }

  /**
   * GeoJSON数据结构转IGServer数据结构
   * @param res
   */
  GeoJSONFeaturesToMapGIS(res: FeatureGeoJSON) {
    const FldAlias: any[] = []
    const FldName: any[] = []
    const FldType: any[] = []
    let FldNumber = 0
    const SFEleArray: FeatureIGSSFEle[] = []
    if (res.features.length > 0) {
      const pro = res.features[0].properties
      Object.keys(pro).forEach(key => {
        if (key !== 'geoCenter') {
          FldAlias.push(null)
          FldName.push(key)
          FldNumber += 1
          if (typeof pro[key] === 'string') {
            FldType.push('string')
          } else if (typeof pro[key] === 'number') {
            FldType.push('double')
          }
        }
      })
    }
    const AttStruct: FeatureIGSAttStruct = {
      FldAlias,
      FldName,
      FldNumber,
      FldType
    }
    for (let i = 0; i < res.features.length; i += 1) {
      const PntGeom: PntGeom[] = []
      const LinGeom: LinGeom[] = []
      const RegGeom: RegGeom[] = []
      let ftype = 0
      let bound: Bound = {}
      const { geometry } = res.features[i]
      if (geometry.type === 'Point') {
        ftype = 1
        bound = this.calculateBound([geometry.coordinates])
        const Dot: XY = {
          x: geometry.coordinates[0],
          y: geometry.coordinates[1]
        }
        PntGeom.push({
          Dot,
          GID: 0
        })
      } else if (geometry.type === 'LineString') {
        ftype = 2
        bound = this.calculateBound(geometry.coordinates)
        const dots: XY[] = []
        for (let j = 0; j < geometry.coordinates.length; j += 1) {
          dots.push({
            x: geometry.coordinates[j][0],
            y: geometry.coordinates[j][1]
          })
        }
        LinGeom.push({
          GID: 0,
          Line: {
            Arcs: [
              {
                ArcID: 0,
                Dots: dots
              }
            ]
          }
        })
      } else if (geometry.type === 'Polygon') {
        ftype = 3
        bound = this.calculateBound(geometry.coordinates[0])
        const dots: XY[] = []
        for (let j = 0; j < geometry.coordinates[0].length; j += 1) {
          dots.push({
            x: geometry.coordinates[0][j][0],
            y: geometry.coordinates[0][j][1]
          })
        }
        RegGeom.push({
          GID: 0,
          Rings: [
            {
              Arcs: [
                {
                  ArcID: 0,
                  Dots: dots
                }
              ]
            }
          ]
        })
      }
      const AttValue: any[] = []
      const property = res.features[i].properties
      Object.keys(property).forEach(key => {
        if (key !== 'geoCenter') {
          AttValue.push(property[key])
        }
      })

      const data: FeatureIGSSFEle = {
        AttValue,
        FID: i,
        GraphicInfo: {
          AnnInfo: null,
          InfoType: null,
          LinInfo: null,
          PntInfo: null,
          RegInfo: null
        },
        bound,
        fGeom: {
          EntityGeom: [],
          LinGeom,
          PntGeom,
          RegGeom,
          StreamGeom: null,
          SurfaceGeom: []
        },
        ftype
      }

      SFEleArray.push(data)
    }
    const result: FeatureIGS = {
      AttStruct,
      SFEleArray,
      TotalCount: res.dataCount || res.features.length
    }
    const featureSet = new Zondy.Common.FeatureSet(result)
    return featureSet
  }

  calculateBound(dots: any[]) {
    const bound: Bound = {
      xmin: dots[0][0],
      ymin: dots[0][1],
      xmax: dots[0][0],
      ymax: dots[0][1]
    }
    for (let i = 0; i < dots.length; i += 1) {
      if (bound.xmin && dots[i][0] < bound.xmin) {
        // eslint-disable-next-line prefer-destructuring
        bound.xmin = dots[i][0]
      }
      if (bound.ymin && dots[i][1] < bound.ymin) {
        // eslint-disable-next-line prefer-destructuring
        bound.ymin = dots[i][1]
      }
      if (bound.xmax && dots[i][0] > bound.xmax) {
        // eslint-disable-next-line prefer-destructuring
        bound.xmax = dots[i][0]
      }
      if (bound.ymax && dots[i][1] > bound.ymax) {
        // eslint-disable-next-line prefer-destructuring
        bound.ymax = dots[i][1]
      }
    }
    return bound
  }

  /** *
   * igs属性统计接口
   * options 属性统计条件
   */
  igsStatisticalField(options: any) {
    // 统计查询
    const { layerType } = options
    const baseUrl = `http://${options.ip}:${options.port}/onemap/`
    let queryOption
    let url
    if (layerType === 'doc') {
      // 文档图层查询
      queryOption = {
        docName: options.docName,
        layerIdxs: options.layerIdxs,
        field: options.field,
        type: options.type ? options.type : '1,2', // 1最大值，2最小值，7去重返回
        where: options.where ? options.where : ''
      }
      url = `${baseUrl}docs/${queryOption.docName}/0/*/statisticalField?layerIdxs=${queryOption.layerIdxs}&where=${queryOption.where}&field=${queryOption.field}&type=${queryOption.type}&f=json`
    } else if (layerType === 'layer') {
      // 图层查询
      queryOption = {
        gdbp: options.gdbp,
        field: options.field,
        type: options.type ? options.type : '1,2',
        where: options.where ? options.where : ''
      }
      url = `${baseUrl}layer/statisticalField?gdbp=${queryOption.gdbp}&where=${queryOption.where}&field=${queryOption.field}&type=${queryOption.type}&f=json`
    }
    const promise = new Promise(resolve => {
      axios({
        url,
        method: 'get'
      })
        .then(res => {
          if (!res.data || res.data.length <= 0) {
            resolve(null)
          } else {
            resolve(res.data)
          }
        })
        .catch(function(error) {})
    })
    return promise.then(res => {
      return res
    })
  }

  /** *
   * dataStore属性统计接口,以及获取属性字段，当options里没有statisticFields，就是获取属性字段
   * options 属性统计条件
   */
  dsStatisticalFields(options: any) {
    const tableData = options.tableArr
    const type = tableData[0]
    const libName = tableData[1]
    let queryOptions
    let func
    if (type === 'pg') {
      const schemas = tableData[2]
      const tableName = tableData[3]
      queryOptions = {
        libName,
        schemas,
        tableName,
        pageSize: options.pageSize || 1,
        pageNo: options.pageNo || 1,
        includeProperites: true
      }
      func = Zondy.DataStore.PGQueryStats
    } else if (type === 'es') {
      const tableName = tableData[2]
      queryOptions = {
        libName, // 'sp_taxibj_200_2';
        tableName, // 'sptype';
        pageSize: options.pageSize || 1,
        pageNo: options.pageNo || 1,
        includeProperites: true
      }
      func = Zondy.DataStore.ESQueryStats
    }
    if (options.statisticFields) {
      queryOptions.statisticFields = options.statisticFields
    }
    if (options.fields) {
      queryOptions.fields = options.fields
    }
    const promise = new Promise(resolve => {
      func(options.ip, options.port, queryOptions, res => {
        if (!res || !res.features || res.features.length <= 0) {
          resolve(null)
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
   * 获取IGSServer地图的地图信息，包括地图的地理范围，地图的坐标系名和地图类型
   * @param queryParam
   */
  getIgsLayerInfo(queryParam: LayerInfoQueryParam) {
    let { domain } = queryParam
    if (!domain) {
      const protocol = queryParam.protocol || this.defaultServer.protocol
      const ip = queryParam.ip || this.defaultServer.ip
      const port = queryParam.port || this.defaultServer.port
      domain = `${protocol}://${ip}:${port}`
    }

    const { layerType } = queryParam
    let promise
    if (layerType === 'layer') {
      const vectorLayer = new Zondy.MRCS.VectorLayer({ domain })
      const { gdbp } = queryParam
      promise = new Promise(resolve => {
        vectorLayer.getLayerInfo(gdbp, (res: any) => {
          if (!res || !res.Range) {
            resolve(null)
          } else {
            const obj = {
              layerType,
              proName: res.SrName,
              extent: res.Range,
              FieldAtt: res.FieldAtt
            }
            resolve(obj)
          }
        })
      })
    } else if (layerType === 'vector') {
      const { serverName } = queryParam
      console.log(Zondy)
      const mapdoc = new Zondy.MRCS.MapDoc({
        domain,
        docName: serverName
      })
      promise = new Promise(resolve => {
        mapdoc.getMapInfo((res: any) => {
          if (!res || !res.range) {
            resolve(null)
          } else {
            const r = res.range.split(',')
            const extent = {
              xmin: Number(r[0]),
              ymin: Number(r[1]),
              xmax: Number(r[2]),
              ymax: Number(r[3])
            }
            const obj = {
              layerType,
              proName: res.projtransName,
              extent
            }
            resolve(obj)
          }
        })
      })
    } else if (layerType === 'tile') {
      const { serverName } = queryParam
      const mapInfo = new Zondy.MRCS.TileLayer({
        domain,
        tileName: serverName
      })
      promise = new Promise(resolve => {
        mapInfo.getTileInfo((res: any) => {
          if (!res || !res.TileInfo2) {
            resolve(null)
          } else {
            const { fullExtent } = res.TileInfo2
            if (fullExtent) {
              const extent = {
                xmin: fullExtent.xmin,
                ymin: fullExtent.ymin,
                xmax: fullExtent.xmax,
                ymax: fullExtent.ymax
              }
              const proName =
                res.TileInfo2.tileInfo.spatialReference.tileSRefInfo.Name
              const tileSize =
                res.TileInfo2.tileInfo.cols || res.TileInfo2.tileInfo.rows
              const { origin } = res.TileInfo2.tileInfo
              const obj = {
                layerType,
                proName,
                extent,
                tileSize,
                origin
              }
              resolve(obj)
            }
          }
        })
      })
    }
    if (promise) {
      return promise.then(Range => {
        return Range
      })
    }
    return null
  }

  creatRectangle(bounds) {
    return new Zondy.Common.Rectangle(
      bounds.west,
      bounds.south,
      bounds.east,
      bounds.north
    )
  }

  creatRectByMinMax(xMin: number, yMin: number, xMax: number, yMax: number) {
    return new Zondy.Common.Rectangle(xMin, yMin, xMax, yMax)
  }
}

export default new QueryFeatures()
