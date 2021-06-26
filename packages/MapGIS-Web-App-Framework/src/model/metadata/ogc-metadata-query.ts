import * as Zondy from '@mapgis/webclient-es6-service'
import axios from 'axios'

export default class OGCMetadataQuery {
  /**
   *
   *
   * @type {Record<string, any>}
   * @memberof QueryOGCInfo
   */
  public static wmtsInfos: Record<string, any> = {}

  public static wmsInfos: Record<string, any> = {}

  /**
   * 用于缓存请求回来的wmts服务的元数据信息
   * 以服务的url为key.
   *
   * @type {Record<string, any>}
   * @memberof QueryOGCInfo
   */
  public static wmtsCompleteInfos: Record<string, any> = {}

  /**
   * 用于缓存请求回来的wms服务的元数据信息
   * 以服务的url为key.
   * @type {Record<string, any>}
   * @memberof QueryOGCInfo
   */
  public static wmsCompleteInfos: Record<string, any> = {}

  public static async getWMTSInfo(url: string) {
    if (!url) {
      return null
    }

    if (this.wmtsInfos[url]) {
      return this.wmtsInfos[url]
    }

    try {
      const result: any = await this.requestWMTSInfo(url)
      const urls = result.OperationsMetadata.GetCapabilities.DCP.HTTP.Get
      const baseUrl = urls[urls.length - 1].href
      const { Layer: layers } = result.Contents
      // TODO:该函数拿图层的title去查找图层对应的矩阵集不妥，为何不拿TileMatrixSetLink中的信息去查找？
      // 马原野 2021年02月01日
      const wmtsInfo = layers.map(({ Title: title, WGS84BoundingBox }) => {
        const {
          tilematrixSet,
          tilematrixIds,
          tileMatrixSetArr,
          pro,
          scaleDenominator,
          origin
        } = this.getTilematrixInfo(result.Contents.TileMatrixSet, title)
        return {
          tilematrixSet,
          tilematrixIds,
          tileMatrixSetArr,
          pro,
          scaleDenominator,
          bounds: WGS84BoundingBox,
          url: baseUrl,
          origin,
          title
        }
      })
      const obj = wmtsInfo
      this.wmtsInfos[url] = obj
      return obj
    } catch (e) {
      return null
    }
  }

  /**
   * 生成获取wmts服务元数据信息的url
   *
   * @param {string} url wmts服务基地址
   * @return {*}获取wmts服务元数据信息的url
   * @memberof QueryOGCInfo
   */
  public static generateWMTSGetCapabilitiesURL(url: string) {
    let tempUrl: string = url
    if (
      !url.toLowerCase().includes('service=wmts') &&
      !url.toLowerCase().includes('request=getcapabilities')
    ) {
      if (!url.includes('?')) {
        tempUrl += '?'
      }
      if (url.toLowerCase().includes('ime-cloud')) {
        // 吉威的数据
        tempUrl += 'service=WMTS&REQUEST=GetCapabilities'
      } else {
        tempUrl += 'service=WMTS&request=GetCapabilities'
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

  public static async getWMSInfo(url: string) {
    if (!url) {
      return null
    }
    if (this.wmsInfos[url]) {
      return this.wmsInfos[url]
    }
    try {
      const result: any = await this.requestWMSInfo(url)
      const version = result.version || '1.3.0'
      const layers = result.Capability.Layer.Layer
      const b: Record<string, number> = {
        xmin: 0,
        ymin: 0,
        xmax: 0,
        ymax: 0
      }
      const layersName: string[] = []
      for (let i = 0; i < layers.length; i += 1) {
        const layerName = layers[i].Name
        if (layerName) {
          layersName.push(layerName)
        } else if (layers[i].Layer && layers[i].Layer.length > 0) {
          for (let j = 0; j < layers[i].Layer.length; j += 1) {
            if (layers[i].Layer[j].Name) {
              layersName.push(layers[i].Layer[j].Name)
            }
          }
        }
        const bound: number[] = layers[i].BoundingBox[0].extent
        if (
          !b.xmin ||
          b.xmin > bound[0] ||
          !b.ymin ||
          b.ymin > bound[1] ||
          !b.xmax ||
          b.xmax < bound[2] ||
          !b.ymax ||
          b.ymax < bound[3]
        ) {
          ;[b.xmin, b.ymin, b.xmax, b.ymax] = bound
        }
      }
      let wmsServerType = ''
      if (url.includes('doc')) {
        wmsServerType = 'doc'
      } else if (url.includes('layer')) {
        wmsServerType = 'layer'
      }
      const obj = {
        layers: layersName,
        version,
        bounds: b,
        wmsServerType
      }
      this.wmsInfos[url] = obj
      return obj
    } catch (e) {
      console.log(e)
      return null
    }
  }

  /**
   * 生成获取wms服务元数据信息的url
   *
   * @param {string} url wms服务基地址
   * @return {*}获取wmts服务元数据信息的url
   * @memberof QueryOGCInfo
   */
  public static generateWMSGetCapabilitiesURL(url: string) {
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

  /**
   * 请求wmts服务的元数据信息
   * 请求前先查找有没有本地缓存,本地缓存中有的话直接返回,没有的话通过网络请求。
   * @param {string} url wmts服务的基地址
   * @return {*} wmts服务的元数据信息
   * @memberof QueryOGCInfo
   */
  private static requestWMTSInfo(url: string) {
    if (this.wmtsCompleteInfos[url]) {
      return this.wmtsCompleteInfos[url]
    }

    // 修改说明： webclient-es6-service中的OGCWMTSInfo、OGCWMSInfo接口只支持对接IGS发布的OGC服务，故这里需要自已拼接请求元数据的URL.
    // 修改人：马原野 2021年03月30日
    const tempUrl = this.generateWMTSGetCapabilitiesURL(url)

    const promise = new Promise((resolve, reject) => {
      axios.get(tempUrl).then(
        res => {
          const { data } = res
          if (!data) {
            resolve(undefined)
          } else {
            const parser = new Zondy.OGC.WMTSCapabilities()
            const result = parser.read(data)
            this.wmtsCompleteInfos[url] = result
            resolve(result)
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

  private static getTilematrixInfo(
    tileMatrixSet: Array<Record<string, any>>,
    name
  ) {
    let matrixSet = tileMatrixSet[0]
    const tileMatrixSetArr: Record<string, any>[] = [] // 所有矩阵集参数
    for (let i = 0; i < tileMatrixSet.length; i += 1) {
      const item = tileMatrixSet[i]
      const id: string = item.Identifier
      if (id.includes(name) && id.includes('028mm')) {
        matrixSet = item
        break
      } else if (id.includes('028mm')) {
        matrixSet = item
        break
      }

      // TODO:什么情况下需要这么处理，依据是什么？
      // 马原野 2021年02月01日
      const ids = item.TileMatrix.map(({ Identifier: id }) => {
        const end = new RegExp(/\d+$/)
        return end.exec(id)
      })
      const subMatrixSet = {
        identifier: item.Identifier,
        ids
      }
      tileMatrixSetArr.push(subMatrixSet)
    }

    const pro = `EPSG:${matrixSet.SupportedCRS.substring(
      matrixSet.SupportedCRS.length - 4
    )}`
    let tileMatrixIds: any
    for (let i = 0; i < tileMatrixSetArr.length; i += 1) {
      if (tileMatrixSetArr[i].identifier === matrixSet.Identifier) {
        tileMatrixIds = tileMatrixSetArr[i].ids
      }
    }
    const scaleDenominator = matrixSet.TileMatrix[0].ScaleDenominator
    const topLeftCorner = matrixSet.TileMatrix[0].TopLeftCorner
    const origin = [topLeftCorner[1], topLeftCorner[0]]
    return {
      tilematrixSet: matrixSet.Identifier,
      tileMatrixSetArr,
      tilematrixIds: tileMatrixIds,
      pro,
      scaleDenominator,
      origin
    }
  }

  private static requestWMSInfo(url: string) {
    if (this.wmsCompleteInfos[url]) {
      return this.wmsCompleteInfos[url]
    }

    const tempUrl: string = this.generateWMSGetCapabilitiesURL(url)

    const promise = new Promise((resolve, reject) => {
      axios.get(tempUrl).then(
        res => {
          const { data } = res
          if (!data) {
            resolve(undefined)
          } else {
            const parser = new Zondy.OGC.WMSCapabilities()
            const result = parser.read(data)
            this.wmsCompleteInfos[url] = result
            resolve(result)
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
}