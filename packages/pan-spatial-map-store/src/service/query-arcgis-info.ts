import axios from 'axios'
import baseConfigInstance from '../config/base'
import { FeatureGeoJSON, GFeature, Bound } from './query-features'

/**
 * ArcGIS查询参数结构
 */
export interface ArcGISQueryParam {
  serverUrl: string // 服务地址
  protocol?: string // 网络协议
  ip?: string // 服务ip
  port?: string // 服务port
  domain?: string // 域名
  where?: string
  geometryPrecision?: number // 返回要素的物理坐标精度
  outFields?: string // 代表需要查询的字段属性名称（全部时用*）
  f?: string
  text?: string
  objectIds?: string
  time?: string
  inSR?: string
  outSR?: string
  spatialRel?: string
  relationParam?: string
  maxAllowableOffset?: string
  orderByFields?: string
  groupByFieldsForStatistics?: string
  gdbVersion?: string
  outStatistics?: string
  queryByDistance?: string
  returnGeometry?: boolean
  returnIdsOnly?: boolean
  returnCountOnly?: boolean
  returnZ?: boolean
  returnM?: boolean
  returnDistinctValues?: boolean
  returnExtentsOnly?: boolean
  rtnLabel?: boolean
  totalCount?: number
  geometry?: object // 几何对象
  layerIndex?: string // 索引号
  page?: number
  pageCount?: number
}

class QueryArcgisInfo {
  public systemConfig: any

  public arcgisInfos: Record<string, any> = []

  public getArcgisInfo(url: string) {
    if (!url) {
      return null
    }
    if (this.arcgisInfos[url]) {
      return this.arcgisInfos[url]
    }
    let tempUrl: string = url
    if (url.includes('?')) {
      tempUrl = url.split('?')[0]
    }
    tempUrl += '?f=json'
    const self = this
    const promise = new Promise((resolve, reject) => {
      axios.get(tempUrl).then(
        res => {
          const { data } = res
          if (!data) {
            resolve(undefined)
          } else {
            self.arcgisInfos[url] = data
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
   * ArcGIS查询
   * geometryPrecision代表
   * distance代表模糊半径范围
   * outfields
   * @param {object} params
   * @param {string|null} params.where
   * @param {number|null} params.geometryPrecision 返回要素的物理坐标精度
   * @param {string|null} params.outFields 代表需要查询的字段属性名称（全部时用*）
   * @param {string|null} params.f
   * @param {string|null} params.text
   * @param {string|null} params.objectIds
   * @param {string|null} params.time
   * @param {string|null} params.inSR
   * @param {string|null} params.outSR
   * @param {string|null} params.spatialRel
   * @param {string|null} params.relationParam
   * @param {string|null} params.maxAllowableOffset
   * @param {string|null} params.orderByFields
   * @param {string|null} params.groupByFieldsForStatistics
   * @param {string|null} params.gdbVersion
   * @param {string|null} params.outStatistics
   * @param {string|null} params.queryByDistance
   * @param {boolean|null} params.returnGeometry
   * @param {boolean|null} params.returnIdsOnly
   * @param {boolean|null} params.returnCountOnly
   * @param {boolean|null} params.returnZ
   * @param {boolean|null} params.returnM
   * @param {boolean|null} params.returnDistinctValues
   * @param {boolean|null} params.returnExtentsOnly
   * @param {boolean|null} params.rtnLabel
   * @param {number|null} params.totalCount
   * @param {object} params.geometry 几何对象
   * @param {string|null} params.layerIndex 索引号
   * @param {number} params.page 页码
   * @param {number} params.pageCount 每页显示数
   */
  query(params: ArcGISQueryParam) {
    if (!params || !params.serverUrl) {
      return
    }
    const tempParams: Record<string, any> = this.getQueryParams(params)
    tempParams.returnCountOnly = false
    const page = params.page || 0
    const pageCount = params.pageCount || 0
    tempParams.resultOffset = page * pageCount || 0
    tempParams.resultRecordCount = params.pageCount || 20
    tempParams.objectIdsTotal = params.totalCount
    const url = `${tempParams.serverUrl}/${tempParams.layerIndex}/query`
    const promise = new Promise((resolve, reject) => {
      axios.get(url, { params: tempParams }).then(res => {
        const { data } = res
        if (!data) {
          resolve(undefined)
        } else {
          // 将data转geojson
          const geojsonFeatures: FeatureGeoJSON = {
            type: 'FeatureCollection',
            features: [],
            dataCount: params.totalCount
          }
          const { features, geometryType } = data
          for (let i = 0; i < features.length; i += 1) {
            let coordinates: any[] = []
            let type = ''
            let bound: Record<string, any> = {}
            if (geometryType === 'esriGeometryPoint') {
              // 如果为点要素
              coordinates = [features[i].geometry.x, features[i].geometry.y]
              type = 'Point'
              bound = {
                xmin: features[i].geometry.x,
                ymin: features[i].geometry.y,
                xmax: features[i].geometry.x,
                ymax: features[i].geometry.y
              }
            } else if (geometryType === 'esriGeometryPolyline') {
              // 如果为线要素
              const path = features[i].geometry.paths[0]
              let xmin = path[0][0]
              let xmax = path[0][0]
              let ymin = path[0][1]
              let ymax = path[0][1]
              for (let j = 0; j < path.length; j += 1) {
                xmin = xmin < path[j][0] ? xmin : path[j][0]
                xmax = xmax > path[j][0] ? xmax : path[j][0]
                ymin = ymin < path[j][1] ? ymin : path[j][1]
                ymax = ymax > path[j][1] ? ymax : path[j][1]
                const coord = [...path[j]]
                coordinates.push(coord)
              }
              type = 'LineString'
              bound = { xmin: xmin, ymin: ymin, xmax: xmax, ymax: ymax }
            } else if (geometryType === 'esriGeometryPolygon') {
              // 如果为面要素
              const path = features[i].geometry.rings[0]
              const arc: any[] = []
              let xmin = path[0][0]
              let xmax = path[0][0]
              let ymin = path[0][1]
              let ymax = path[0][1]
              for (let j = 0; j < path.length; j += 1) {
                xmin = xmin < path[j][0] ? xmin : path[j][0]
                xmax = xmax > path[j][0] ? xmax : path[j][0]
                ymin = ymin < path[j][1] ? ymin : path[j][1]
                ymax = ymax > path[j][1] ? ymax : path[j][1]
                const coord = [path[j].x, path[j].y]
                arc.push(coord)
              }
              coordinates.push(arc)
              type = 'Polygon'
              bound = { xmin: xmin, ymin: ymin, xmax: xmax, ymax: ymax }
            }
            const geometry = {
              type,
              coordinates
            }

            const feature: GFeature = {
              type: 'Feature',
              properties: { ...features[i].attributes },
              geometry,
              bound
            }
            geojsonFeatures.features.push(feature)
          }
          resolve(geojsonFeatures)
        }
      })
    })
    return promise.then(data => {
      return data
    })
  }

  getQueryParams(params: ArcGISQueryParam) {
    this.systemConfig = baseConfigInstance.config
    const tempParams: Record<string, any> = {}
    tempParams.where = params.where || '1=1'
    tempParams.geometryPrecision = params.geometryPrecision || 3
    tempParams.outFields = params.outFields || '*'
    tempParams.f = params.f || 'pjson'
    tempParams.text = params.text || ''
    tempParams.objectIds = params.objectIds || ''
    tempParams.time = params.time || ''
    tempParams.spatialRel = params.spatialRel || ''
    tempParams.relationParam = params.relationParam || ''
    tempParams.maxAllowableOffset = params.maxAllowableOffset || ''
    tempParams.orderByFields = params.orderByFields || 'OBJECTID ASC'
    tempParams.groupByFieldsForStatistics =
      params.groupByFieldsForStatistics || ''
    tempParams.gdbVersion = params.gdbVersion || ''
    tempParams.outStatistics = params.outStatistics || ''
    tempParams.returnGeometry =
      params.returnGeometry == undefined ? params.returnGeometry : true
    tempParams.returnIdsOnly =
      params.returnIdsOnly == undefined ? params.returnIdsOnly : false
    tempParams.returnCountOnly =
      params.returnCountOnly == undefined ? params.returnCountOnly : false
    tempParams.returnZ = params.returnZ == undefined ? params.returnZ : false
    tempParams.returnM = params.returnM == undefined ? params.returnM : false
    tempParams.returnDistinctValues =
      params.returnDistinctValues == undefined
        ? params.returnDistinctValues
        : false
    tempParams.returnExtentsOnly =
      params.returnExtentsOnly == undefined ? params.returnExtentsOnly : false
    tempParams.rtnLabel =
      params.rtnLabel !== undefined ? params.rtnLabel : false
    tempParams.layerIndex = params.layerIndex || 0
    tempParams.serverUrl = params.serverUrl
    tempParams.totalCount = params.totalCount
    if (params.queryByDistance) {
      tempParams.queryByDistance = params.queryByDistance
    } else if (params.geometry && params.geometry.nearDis) {
      tempParams.queryByDistance = params.geometry.nearDis
    } else tempParams.queryByDistance = ''
    let EPSGNo = ''
    let inSR = params.inSR
    if (params.inSR) {
      EPSGNo = params.inSR.split(':')[1]
    } else {
      EPSGNo = this.systemConfig.projection.split(':')[1]
      inSR = this.systemConfig.projection
    }
    tempParams.inSR = inSR || ''
    let outSR = params.outSR
    if (!params.outSR) {
      outSR = this.systemConfig.projection
    }
    tempParams.outSR = outSR || ''
    if (params.geometry) {
      const geoType = params.geometry.getGeometryType()
      const geometry = params.geometry
      const pointArr: any[] = []
      let i = 0
      if (geoType == 'rect') {
        tempParams.geometry = JSON.stringify({
          xmin: geometry.xmin,
          ymin: geometry.ymin,
          xmax: geometry.xmax,
          ymax: geometry.ymax,
          spatialReference: {
            // EPSG: Zondy.OneMap.defaultData.projection.split(':')[1]
            EPSG: 4326
          }
        }) // [geometry.xmin, geometry.ymin, geometry.xmax, geometry.ymax].toString();
        tempParams.geometryType = 'esriGeometryEnvelope'
        tempParams.distance = params.geometry.nearDis || ''
      } else if (geoType == 'point') {
        tempParams.geometry = JSON.stringify({
          x: geometry.x,
          y: geometry.y,
          spatialReference: { EPSG: EPSGNo }
        }) // [geometry.x, geometry.y].toString();
        tempParams.geometryType = 'esriGeometryPoint'
        tempParams.distance = params.geometry.nearDis || ''
      } else if (geoType == 'polygon') {
        tempParams.geometryType = 'esriGeometryPolygon'
        tempParams.distance == params.geometry.nearDis || ''
        for (i = 0; i < geometry.pointArr.length; i++) {
          pointArr.push([geometry.pointArr[i].x, geometry.pointArr[i].y])
        }
        tempParams.geometry = JSON.stringify({
          rings: [pointArr],
          spatialReference: { EPSG: EPSGNo }
        })
      } else if (geoType == 'line') {
        tempParams.geometryType = 'esriGeometryPolyline'
        tempParams.distance == params.geometry.nearDis || ''
        for (i = 0; i < geometry.pointArr.length; i++) {
          pointArr.push([geometry.pointArr[i].x, geometry.pointArr[i].y])
        }
        tempParams.geometry = JSON.stringify({
          paths: [pointArr],
          spatialReference: { EPSG: EPSGNo }
        })
      } else if (geoType == 'Circle') {
        // ArcGIS没有圆几何，将圆构造为polygon
        // tempParams.geometryType = "esriGeometryPolygon";
        // tempParams.distance ==params.geometry.nearDis||'';
        // const Circle = new ol.geom.Circle([geometry.point.x, geometry.point.y], geometry.radious);
        // const polygon = new ol.geom.Polygon.fromCircle(Circle,16);
        // tempParams.geometry = JSON.stringify({ "rings": [polygon.getCoordinates()[0]], "spatialReference": { "EPSG": EPSGNo } });
      }
    }
    return tempParams
  }

  /**
   * ArcGIS查询
   * geometryPrecision代表
   * distance代表模糊半径范围
   * outfields
   * @param {object} params
   * @param {string|null} params.where
   * @param {number|null} params.geometryPrecision 返回要素的物理坐标精度
   * @param {string|null} params.outFields 代表需要查询的字段属性名称（全部时用*）
   * @param {string|null} params.f
   * @param {string|null} params.text
   * @param {string|null} params.objectIds
   * @param {string|null} params.time
   * @param {string|null} params.inSR
   * @param {string|null} params.outSR
   * @param {string|null} params.spatialRel
   * @param {string|null} params.relationParam
   * @param {string|null} params.maxAllowableOffset
   * @param {string|null} params.orderByFields
   * @param {string|null} params.groupByFieldsForStatistics
   * @param {string|null} params.gdbVersion
   * @param {string|null} params.outStatistics
   * @param {string|null} params.queryByDistance
   * @param {boolean|null} params.returnGeometry
   * @param {boolean|null} params.returnIdsOnly
   * @param {boolean|null} params.returnCountOnly
   * @param {boolean|null} params.returnZ
   * @param {boolean|null} params.returnM
   * @param {boolean|null} params.returnDistinctValues
   * @param {boolean|null} params.returnExtentsOnly
   * @param {boolean|null} params.rtnLabel
   * @param {number|null} params.totalCount
   * @param {object} params.geometry 几何对象
   * @param {string|null} params.layerIndex 索引号
   * @param {string} params.serverUrl 服务地址
   */
  getArcGISQueryTotal(params: ArcGISQueryParam) {
    if (!params.serverUrl) {
      return
    }
    const tempParams: Record<string, any> = this.getQueryParams(params)
    tempParams.returnDistinctValues = false
    if (params.totalCount) {
      return params.totalCount
    }
    tempParams.returnIdsOnly = false
    tempParams.returnCountOnly = true
    tempParams.layerIndex = params.layerIndex || '0'
    const url = `${tempParams.serverUrl}/${tempParams.layerIndex}/query`
    const promise = new Promise((resolve, reject) => {
      axios.get(url, { params: tempParams }).then(res => {
        const { data } = res
        if (!data) {
          resolve(undefined)
        } else {
        }
      })
    })
    return promise.then(data => {
      return data
    })
  }

  /**
   * 返回ArcGIS图层的属性结构
   * geometryPrecision代表
   * distance代表模糊半径范围
   * outfields
   * @param {object} queryParams
   * @param {string|null} queryParams.layerIndex 索引号
   * @param {string} queryParams.serverUrl 服务地址
   *  @param {string} queryParams.outFields 输出字段
   * @param {string} queryParams.page 页码
   * @param {string} queryParams.pageCount 每页记录数
   */
  getArcGISlayerFileds(queryParams) {
    if (!queryParams || !queryParams.serverUrl) {
      return
    }
    const tempParams: Record<string, any> = {}
    tempParams.where = '1=1'
    tempParams.outFields = queryParams.outFields || '*'
    tempParams.f = 'pjson'
    tempParams.layerIndex = queryParams.layerIndex || 0
    tempParams.serverUrl = queryParams.serverUrl
    tempParams.returnGeometry = true
    tempParams.returnIdsOnly = false
    tempParams.returnCountOnly = false
    tempParams.resultOffset = queryParams.page * queryParams.pageCount || 0
    tempParams.resultRecordCount = queryParams.pageCount || 1
    const url = `${tempParams.serverUrl}/${tempParams.layerIndex}/query`
    const promise = new Promise((resolve, reject) => {
      axios.get(url, { params: tempParams }).then(res => {
        const { data } = res
        if (!data) {
          resolve(undefined)
        } else {
          const { fields } = data
          if (!fields) {
            resolve(undefined)
          } else {
            const tempFields: Record<string, any>[] = []
            const value: string[] = []
            for (let m = 0; m < fields.length; m++) {
              let type = ''
              if (fields[m].type == 'esriFieldTypeOID') {
                type = 'int'
              } else if (fields[m].type == 'esriFieldTypeDouble') {
                type = 'double'
              } else if (fields[m].type == 'esriFieldTypeString') {
                type = 'string'
              } else if (fields[m].type == 'esriFieldTypeInteger') {
                type = 'int'
              } else if (fields[m].type == 'esriFieldTypeFloat') {
                type = 'float'
              } else if (fields[m].type == 'esriFieldTypeDate') {
                type = 'date'
              } else if (fields[m].type == 'esriFieldTypeSmallInteger') {
                type = 'smallInteger'
              }
              tempFields.push({ name: fields[m].name, type })
            }
            if (tempParams.outFields && tempParams.outFields !== '*') {
              // 获取单个属性的属性值
              const { features } = data
              for (let i = 0; i < features.length; i += 1) {
                const item = features[i].attributes[tempParams.outFields]
                value.push(item)
              }
            }
            const obj = {
              fields: tempFields,
              value
            }
            resolve(obj)
          }
        }
      })
    })
    return promise.then(data => {
      return data
    })
  }
}

export default new QueryArcgisInfo()
