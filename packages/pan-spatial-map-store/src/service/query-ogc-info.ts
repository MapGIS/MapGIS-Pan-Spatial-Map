declare const Zondy

import axios from 'axios'
import '../libs/webclient-service-framework.js'

class QueryOGCInfo {
  private wmtsInfos = []

  private wmsInfos = []

  public async getWMTSInfo(url: string) {
    if (!url) {
      return null
    }
    if (this.wmtsInfos[url]) {
      return this.wmtsInfos[url]
    }
    try {
      const res = await this.requestWMTSInfo(url)
      const parser = new Zondy.Format.WMTSCapabilities()
      const result = parser.read(res)
      const urls = result.OperationsMetadata.GetCapabilities.DCP.HTTP.Get
      const baseUrl = urls[urls.length - 1].href
      const { Layer: layers } = result.Contents
      const wmtsInfo = layers.map(({ Title: title, WGS84BoundingBox }) => {
        const {
          tilematrixSet,
          tilematrixIds,
          pro,
          scaleDenominator,
          origin
        } = this.getTilematrixInfo(result.Contents.TileMatrixSet, title)
        return {
          tilematrixSet,
          tilematrixIds,
          pro,
          scaleDenominator,
          bounds: WGS84BoundingBox,
          url: baseUrl,
          origin,
          title
        }
      })
      const obj = wmtsInfo[0]
      this.wmtsInfos[url] = obj
      return obj
    } catch (e) {
      return null
    }
  }

  private getTilematrixInfo(tileMatrixSet: Array<Record<string, any>>, name) {
    let matrixSet = tileMatrixSet[0]
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
    }

    const pro = `EPSG:${matrixSet.SupportedCRS.substring(
      matrixSet.SupportedCRS.length - 4
    )}`
    const tileMatrixIds = matrixSet.TileMatrix.map(({ Identifier: id }) => {
      const end = new RegExp(/\d+$/)
      return end.exec(id)
    })
    const scaleDenominator = matrixSet.TileMatrix[0].ScaleDenominator
    const topLeftCorner = matrixSet.TileMatrix[0].TopLeftCorner
    const origin = [topLeftCorner[1], topLeftCorner[0]]
    return {
      tilematrixSet: matrixSet.Identifier,
      tilematrixIds: tileMatrixIds,
      pro,
      scaleDenominator,
      origin
    }
  }

  public requestWMTSInfo(url: string) {
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
    const promise = new Promise((resolve, reject) => {
      axios.get(tempUrl).then(
        res => {
          const { data } = res
          if (!data) {
            resolve(undefined)
          } else {
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

  public async getWMSInfo(url: string) {
    if (!url) {
      return null
    }
    if (this.wmsInfos[url]) {
      return this.wmsInfos[url]
    }
    try {
      const res = await this.requestWMSInfo(url)
      const parser = new Zondy.Format.WMSCapabilities()
      const result = parser.read(res)
      const version = result.version || '1.3.0'
      const layers = result.Capability.Layer.Layer
      const b: Record<string, number> = {
        xMin: 0,
        yMin: 0,
        xMax: 0,
        yMax: 0
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
          !b.xMin ||
          b.xMin > bound[0] ||
          !b.yMin ||
          b.yMin > bound[1] ||
          !b.xMax ||
          b.xMax < bound[2] ||
          !b.yMax ||
          b.yMax < bound[3]
        ) {
          ;[b.xMin, b.yMin, b.xMax, b.yMax] = bound
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

  public requestWMSInfo(url: string) {
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
    const promise = new Promise((resolve, reject) => {
      axios.get(tempUrl).then(
        res => {
          const { data } = res
          if (!data) {
            resolve(undefined)
          } else {
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
}

export default new QueryOGCInfo()
