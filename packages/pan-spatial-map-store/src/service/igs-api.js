import axios from 'axios'
import * as Zondy from '@mapgis/webclient-es6-service'
import baseConfigInstance from '../config/base'
import { isArrayFn } from '../util/util'

/**
 * 地图默认站点
 * @constant
 * @type {{ip: string, port: string, guid: string, token: string, projection: string}}
 */
const defaultServer = {
  protocol: 'http',
  ip: '',
  port: '',
  guid: '',
  token: '',
  projection: ''
}

/**
 * 地图文档图层信息
 * @constant
 * @type {{}}
 */
const globalDocInfo = []

/**
 * 获取文档信息
 * @param option 参数对象
 * @param {string}[option.serverName=null]  服务名
 * @param {string}[option.domain=null] igs服务地址域名 （domain和[protocol，ip，port]，二选一）
 * @param {string}[option.protocol="http"] igs服务地址网络协议 （domain和[protocol，ip，port]，二选一）
 * @param {string}[option.ip =null] igs服务地址ip （domain和[protocol，ip，port]，二选一）
 * @param {string}[option.port=null] igs服务地址port （domain和[protocol，ip，port]，二选一）
 * @param {string}[option.guid="__readonly_user__"]  guid
 */
export function getDocInfo(option) {
  if (!option.serverName) {
    return ''
  }
  if (globalDocInfo[option.serverName]) {
    return globalDocInfo[option.serverName]
  }
  let domain = option.domain ? option.domain : null
  if (!domain) {
    const protocol = option.protocol ? option.protocol : defaultServer.protocol
    const ip = option.ip ? option.ip : defaultServer.ip
    const port = option.port ? option.port : defaultServer.port
    domain = `${protocol}://${ip}:${port}`
  }
  const url = `${domain}/igs/rest/mrcs/docs/${option.serverName}?dataService=${
    option.serverName
  }&f=json&tree=true&guid=${option.guid || '__readonly_user__'}`
  const promise = new Promise(resolve => {
    axios.get(url).then(
      function({ data }) {
        if (!data) {
          resolve(null)
        } else {
          for (let i = 0; i < data.MapInfos.length; i++) {
            data.MapInfos[i].CatalogLayer = disposeDocInfo(
              data.MapInfos[i].CatalogLayer
            )
          }
          globalDocInfo[option.serverName] = data
          resolve(data)
        }
      },
      function(res, error) {
        console.log(res, error)
      },
      'json'
    )
  })
  return promise.then(data => {
    return data
  })
}

/**
 * 构造图层
 * @param {Array} vectorInfo CatalogLayer
 * @param {string} layerIndex 图层index
 * @param {Array} vectorArray 图层集
 * @returns {Array}
 */
export function disposeDocInfo(vectorInfo, layerIndex, vectorArray) {
  if (!vectorArray) {
    vectorArray = []
  }
  if (!vectorInfo) {
    return []
  }
  for (let i = 0; i < vectorInfo.length; i++) {
    const tip = layerIndex ? `${layerIndex}-${i}` : String(i)
    if (vectorInfo[i].Type === 'Layer') {
      vectorInfo[i].layerIndex = tip
    } else if (vectorInfo[i].Type === 'Group') {
      vectorInfo[i].nocheck = true
      if (vectorInfo[i].GroupMapLayerInfo) {
        vectorInfo[i].GroupMapLayerInfo = disposeDocInfo(
          vectorInfo[i].GroupMapLayerInfo,
          tip,
          []
        )
      }
    }
  }
  return vectorInfo
}

/**
 * 获取图层索引号
 * @param {Array} data 文档信息Cataloglayer
 * @param {object} opt
 * @param {string} [opt.layerName] 图层名
 * @param {Array} [opt.code] 行政区代码数组
 * @returns {Array}
 */
export function getVectorIndex(data, opt, array, urlArray) {
  array = array || []
  urlArray = urlArray || []
  if (opt.layerName || opt.code) {
    for (let i = 0; i < data.length; i++) {
      if (data[i].Type === 'Layer') {
        if (!opt.code) {
          const layerNames = !isArrayFn(opt.layerName)
            ? opt.layerName
            : opt.layerName.split(',')
          for (let j = 0; j < layerNames.length; j++) {
            if (
              data[i].URL.indexOf(layerNames[j]) ===
              data[i].URL.length - layerNames[j].length
            ) {
              if (urlArray.indexOf(data[i].URL) < 0) {
                urlArray.push(data[i].URL)
                array.push(data[i].layerIndex)
              }
            }
          }
        } else if (!opt.layerName) {
          const codes = opt.code.split(',')
          for (let j = 0; j < codes.length; j++) {
            if (data[i].URL.indexOf(codes[j]) > -1) {
              if (urlArray.indexOf(data[i].URL) < 0) {
                urlArray.push(data[i].URL)
                array.push(data[i].layerIndex)
              }
            }
          }
        } else if (
          data[i].URL.indexOf(opt.layerName) ===
            data[i].URL.length - opt.layerName.length &&
          data[i].URL.indexOf(opt.code) > -1
        ) {
          if (urlArray.indexOf(data[i].URL) < 0) {
            urlArray.push(data[i].URL)
            array.push(data[i].layerIndex)
          }
        }
      } else if (
        data[i].GroupMapLayerInfo &&
        data[i].GroupMapLayerInfo.length > 0
      ) {
        array = getVectorIndex(data[i].GroupMapLayerInfo, opt, array, urlArray)
      }
    }
  } else {
    for (let i = 0; i < data.length; i++) {
      if (data[i].Type === 'Layer') {
        array.push(data[i].layerIndex)
      } else if (
        data[i].GroupMapLayerInfo &&
        data[i].GroupMapLayerInfo.length > 0
      ) {
        array = getVectorIndex(data[i].GroupMapLayerInfo, opt, array, urlArray)
      }
    }
  }
  return array
}

/**
 * 获取图层Gdbp
 * @param {Array} data 文档信息Cataloglayer
 * @param {object} opt
 * @param {string} opt.layerName 图层名
 * @param {Array} opt.code 行政区代码数组
 * @returns {Array}
 */
export function getVectorGdbp(data, opt, urlArray) {
  urlArray = urlArray || []
  if (opt.layerName || opt.code) {
    for (let i = 0; i < data.length; i++) {
      if (data[i].Type === 'Layer') {
        if (!opt.code) {
          const layerNames = !isArrayFn(opt.layerName)
            ? opt.layerName
            : opt.layerName.split(',')
          for (let j = 0; j < layerNames.length; j++) {
            if (
              data[i].URL.indexOf(layerNames[j]) ===
              data[i].URL.length - layerNames[j].length
            ) {
              if (urlArray.indexOf(data[i].URL) < 0) {
                urlArray.push(data[i].URL)
              }
            }
          }
        } else if (!opt.layerName) {
          const codes = opt.code.split(',')
          for (let j = 0; j < codes.length; j++) {
            if (data[i].URL.indexOf(codes[j]) > -1) {
              if (urlArray.indexOf(data[i].URL) < 0) {
                urlArray.push(data[i].URL)
              }
            }
          }
        } else if (
          data[i].URL.indexOf(opt.layerName) ===
            data[i].URL.length - opt.layerName.length &&
          data[i].URL.indexOf(opt.code) > -1
        ) {
          if (urlArray.indexOf(data[i].URL) < 0) {
            urlArray.push(data[i].URL)
          }
        }
      } else if (
        data[i].GroupMapLayerInfo &&
        data[i].GroupMapLayerInfo.length > 0
      ) {
        urlArray = getVectorIndex(data[i].GroupMapLayerInfo, opt, urlArray)
      }
    }
  } else {
    for (let i = 0; i < data.length; i++) {
      if (data[i].Type === 'Layer') {
        urlArray.push(data[i].URL)
      } else if (
        data[i].GroupMapLayerInfo &&
        data[i].GroupMapLayerInfo.length > 0
      ) {
        urlArray = getVectorIndex(data[i].GroupMapLayerInfo, opt, urlArray)
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
export async function query(option, combine) {
  if (!option) {
    return
  }
  if (option.isDataStoreQuery) {
    // datastore
    return await dataStoreQuery(option)
  } // igs
  return await igsQuery(option, combine)
}

/**
 * igs要素查询
 * @param option 详见igsQueryFeature和igsOnemapQueryFeature的option
 * @returns {Promise<void>}
 */
export async function igsQuery(option, combine) {
  if (option.docName && !option.layerIdxs) {
    // 参数是否含有文档名和图层索引号
    let docInfo = globalDocInfo[option.docName]
    if (!docInfo) {
      const param = {
        serverName: option.docName,
        ip: option.ip,
        port: option.port
      }
      await getDocInfo(param)
      docInfo = globalDocInfo[option.docName]
    }
    const data = docInfo.MapInfos[Number(option.mapIndex) || 0].CatalogLayer
    const opt = {}
    opt.layerName = option.layerName || null
    opt.code = option.code || null
    option.layerIdxs = getVectorIndex(data, opt)
  }
  if (combine) {
    option.combine = combine
    return await igsOnemapQueryFeature(option)
  }
  return await igsQueryFeature(option)
}

/**
 * igs要素查询
 * @param {object} option
 * @param {string}[option.domain=null] igs服务地址域名 （domain和[protocol，ip，port]，二选一）
 * @param {string}[option.protocol="http"] igs服务地址网络协议 （domain和[protocol，ip，port]，二选一）
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
export function igsQueryFeature(option) {
  let queryParam
  if (option.gdbp) {
    // 矢量图层
    queryParam = new Zondy.MRFS.QueryByLayerParameter(option.gdbp)
    queryParam.proj = option.srsIds || baseConfigInstance.config.projectionName
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
      option.IncludeWebGraphic !== undefined ? option.IncludeWebGraphic : false
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
    const protocol = option.protocol || defaultServer.protocol
    const ip = option.ip || defaultServer.ip
    const port = option.port || defaultServer.port
    domain = `${protocol}://${ip}:${port}`
  }
  let queryService
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
    let mapIndex = option.mapIndex || 0
    if (isArrayFn(option.mapIndex)) {
      mapIndex = option.mapIndex[0]
    }
    // 图层索引号
    let layerIdxs =
      option.layerIdxs || option.layerIdxs === '0' ? option.layerIdxs : '*'
    if (isArrayFn(option.layerIdxs)) {
      layerIdxs = option.layerIdxs.join(',')
    }
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
  const promise = new Promise(resolve => {
    queryService.query(res => {
      if (!res) {
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
 * igs要素查询（onemap扩展服务）
 * @param {object} option
 * @param {string}[option.domain=null] igs服务地址域名 （domain和[protocol，ip，port]，二选一）
 * @param {string}[option.protocol="http"] igs服务地址网络协议 （domain和[protocol，ip，port]，二选一）
 * @param {string}[option.ip =null] igs服务地址ip （domain和[protocol，ip，port]，二选一）
 * @param {string}[option.port=null] igs服务地址port （domain和[protocol，ip，port]，二选一）
 * 矢量文档和矢量图层要素查询公共参数
 * @param {string} [option.f="geojson"] 返回结果的格式,缺省xml(json|xml|geojson)
 * @param {string} [option.compress] 当f="geojson"有效
 * @param {string} [option.level] 当f="geojson"有效
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
// GetFeatureByLayer(string gdbp, string f, string objectIds, string geometryType, string geometry, string where,
// string page, string pageCount, string rule, string structs, string orderField, string isAsc, string srsIds,
// string cursorType, string guid, string fields, string annoFormat, string operationType, string skip, string taskID,
// string coordPrecision, string mainGdbp, string skipFields, string combine, string rtnLabel)
//
// GetFeatureByDoc(string indexs, string docName, string mapIndex, string layerIdxs, string f, string objectIds,
// string geometryType, string geometry, string where, string page, string pageCount, string rule, string structs,
// string orderField, string isAsc, string cursorType, string fields, string annoFormat, string guid,
// string operationType, string skip, string taskID, string coordPrecision, string mainLayerIndex,
// string skipFields, string combine, string rtnLabel)
//
export function igsOnemapQueryFeature(option) {
  const queryParam = {}
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
  queryParam.where = option.where || null
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
      option.IncludeWebGraphic !== undefined ? option.IncludeWebGraphic : false
  })
  queryParam.structs = structs.toJSON()
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
  queryParam.combine = option.combine !== undefined ? option.combine : true

  let domain = option.domain || null
  if (!domain) {
    const protocol = option.protocol || defaultServer.protocol
    const ip = option.ip || defaultServer.ip
    const port = option.port || defaultServer.port
    domain = `${protocol}://${ip}:${port}`
  }

  let url
  if (option.gdbp) {
    // 矢量图层
    queryParam.gdbp = !isArrayFn(option.gdbp)
      ? option.gdbp
      : option.gdbp.join(',')
    queryParam.srsIds =
      option.srsIds || baseConfigInstance.config.projectionName
    url = `${domain}/onemap/layer/query`
  } else {
    // 矢量文档
    if (!option.docName || !option.layerIdxs) {
      return null
    }
    // 文档名
    const { docName } = option
    // 文档索引
    let mapIndex = option.mapIndex || 0
    if (isArrayFn(option.mapIndex)) {
      mapIndex = option.mapIndex[0]
    }
    // 图层索引号
    let layerIdxs =
      option.layerIdxs || option.layerIdxs === '0' ? option.layerIdxs : '*'
    if (isArrayFn(option.layerIdxs)) {
      layerIdxs = option.layerIdxs.join(',')
    }
    url = `${domain}/onemap/docs/${docName}/${mapIndex}/${layerIdxs}/query`
  }
  const promise = new Promise(resolve => {
    axios.get(url, { params: queryParam }).then(
      function({ data }) {
        if (!data) {
          resolve(null)
        } else {
          resolve(data)
        }
      },
      function(res, error) {
        console.log(res, error)
      },
      'json'
    )
  })
  return promise.then(data => {
    return data
  })
}

/**
 * dataStore要素查询
 * @param option 详见dataStorePgQueryFeature的option
 * @returns {Promise<*>}
 */
export async function dataStoreQuery(option) {
  if (!option.gdbp) {
    const docInfo = globalDocInfo[option.docName]
    const data = docInfo.MapInfos[Number(option.mapIndex) || 0].CatalogLayer
    const opt = {}
    if (option.layerIndex) {
      const vectors = getVectorByIndex({
        indexs: option.layerIndex,
        vectorInfo: data
      })
      const gdbps = []
      for (let i = 0; i < vectors.length; i++) {
        gdbps.push(vectors[i].URL)
      }
      option.gdbp = gdbps
    } else {
      opt.layerName = option.layerName || null
      opt.code = option.code || null
      const gdbp = getGdbpByVectorName(data, opt.layerName)
      if (gdbp.length > 0) {
        option.gdbp = gdbp
      }
    }
  }
  if (!isArrayFn(option.gdbp)) {
    const res = await dataStorePgQueryFeature(option.gdbp, option)
    return [res]
  }
  if (option.gdbp.length < 1) {
    return null
  }
  const resArr = []
  for (let i = 0; i < option.gdbp.length; i++) {
    const obj = await dataStorePgQueryFeature(option.gdbp[i], option)
    resArr.push(obj)
  }
  return resArr
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
export function dataStorePgQueryFeature(gdbp, option) {
  const queryParam = {}
  const vecStr = gdbp.split('/')
  queryParam.libName = vecStr[vecStr.length - 5]
  queryParam.tableName = vecStr[vecStr.length - 1]
  queryParam.schemas = vecStr[vecStr.length - 5]

  queryParam.pageNo = option.page !== undefined ? option.page : 1
  queryParam.pageSize = option.pageCount || 10
  queryParam.includeProperites = true
  if (option.geometry) {
    queryParam.geoFormat = 'wkt'
    const geometryType = option.geometry.getGeometryType()
    const arr = []
    let str
    switch (geometryType) {
      case 'rect':
      case 'polygon':
        if (option.geometry.getGeometryType() === 'rect') {
          arr.push(`${option.geometry.xmin} ${option.geometry.ymin}`)
          arr.push(`${option.geometry.xmin} ${option.geometry.ymax}`)
          arr.push(`${option.geometry.xmax} ${option.geometry.ymax}`)
          arr.push(`${option.geometry.xmax} ${option.geometry.ymin}`)
          arr.push(`${option.geometry.xmin} ${option.geometry.ymin}`)
        } else {
          const { pointArr } = option.geometry
          for (let i = 0; i < pointArr.length; i++) {
            arr.push(`${pointArr[i].x} ${pointArr[i].y}`)
          }
        }
        str = arr.join(',')
        queryParam.geometry = `POLYGON(( ${str}))`
        break
      case 'line':
        const { pointArr } = option.geometry
        for (let i = 0; i < pointArr.length; i++) {
          arr.push(`${pointArr[i].x} ${pointArr[i].y}`)
        }
        str = arr.join(',')
        queryParam.geometry = `LINESTRING(${str})`
        break
      case 'point':
        queryParam.geometry = `POINT(${option.geometry.x} ${option.geometry.y})`
        break
    }
  }
  if (option.where) {
    queryParam.filter = option.where
  }
  if (option.fields) {
    queryParam.fields = option.fields
  }
  queryParam.sref = option.sref || baseConfigInstance.config.projection

  let domain = option.domain || null
  const ip = option.ip || baseConfigInstance.config.DataStoreIp
  const port = option.port || baseConfigInstance.config.DataStorePort
  if (!domain) {
    const protocol = option.protocol || defaultServer.protocol
    domain = `${protocol}://${ip}:${port}`
  }
  queryParam.domain = domain
  const promise = new Promise(resolve => {
    Zondy.DataStore.PGQueryStats(ip, port, queryParam, res => {
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
 * 根据图层索引获取图层信息
 * @param option 参数对象
 * @param {Array|null} option.indexs 图层索引号数组
 * @param {Array|null} option.vectorInfo CatalogLayer
 * @returns {Array}
 */
export function getVectorByIndex(option) {
  // 图层索引号数组
  if (!option.indexs || !option.vectorInfo) {
    return []
  }
  if (!option.vectorArray) {
    option.vectorArray = []
  }
  for (let i = 0; i < option.vectorInfo.length; i++) {
    const tip = option.layerIndex ? `${option.layerIndex}-${i}` : String(i)
    for (let m = 0; m < option.indexs.length; m++) {
      if (option.indexs[m] === tip) {
        option.vectorArray.push(option.vectorInfo[i])
      }
    }
    if (option.vectorInfo[i].Type === 'Group') {
      if (option.vectorInfo[i].GroupMapLayerInfo) {
        for (let m = 0; m < option.indexs.length; m++) {
          if (
            option.indexs[m].indexOf('-') > -1 &&
            option.indexs[m].split('-')[0] === tip
          ) {
            option.vectorInfo = option.vectorInfo[i].GroupMapLayerInfo
            option.layerIndex = tip
            option.vectorArray = getVectorByIndex(option)
          }
        }
      }
    }
  }
  return option.vectorArray
}

/**
 * 通过图层名获取图层gdbp
 * @param {Array} data 文档信息Cataloglayer
 * @param {Array} names 图层名数组
 * @returns {Array}
 */
export function getGdbpByVectorName(data, names, urlArray) {
  urlArray = urlArray || []
  let tempNames = []
  if (!isArrayFn(names)) {
    tempNames = names.split(',')
  } else {
    tempNames = names
  }
  for (let i = 0; i < data.length; i++) {
    if (data[i].Type === 'Layer') {
      for (let j = 0; j < tempNames.length; j++) {
        if (data[i].URL.indexOf(tempNames[j]) > 0) {
          if (urlArray.indexOf(data[i].URL) < 0) {
            urlArray.push(data[i].URL)
          }
        }
      }
    } else {
      urlArray = getGdbpByVectorName(
        data[i].GroupMapLayerInfo,
        tempNames,
        urlArray
      )
    }
  }
  return urlArray
}
