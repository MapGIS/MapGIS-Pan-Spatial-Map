// import { SubLayerType } from '@mapgis/webclient-store/src/map/layer'

import {
  queryFeaturesInstance,
  queryOGCInfoInstance,
  queryArcgisInfoInstance
} from '@mapgis/pan-spatial-map-store'

const { IDocument, Layer } = require('@mapgis/webclient-store')

const { LayerType, SubLayerType, IgsDocLayer } = Layer

/**
 * 查询图层信息
 * 通过向服务器发送请求的方式，获取图层的范围等信息
 *
 * @class QueryLayerInfo
 */
class QueryLayerInfo {
  /**
   * 获取指定图层的数据范围
   *
   * @param {*} layer layer的类型定义不详，具体可查看"目录树"组件添加图层的逻辑。
   * 后面需要考虑：1.使用webclient-store中对图层的定义。2.一张图应用里面对图层对象进行定义。
   * @memberof QueryLayerInfo
   */
  public async getLayerExtent(layer: any) {
    let range: number[] = []
    if (layer.subtype === SubLayerType.IgsDocLayer) {
      const res = await queryFeaturesInstance.getDocInfo({
        ip: layer.ip,
        port: layer.port,
        serverName: layer.serverName
      })
      const strs = res.MapInfos[0].Range.split(',')
      range = strs.map(item => {
        return Number(item)
      })
    } else if (layer.subtype === SubLayerType.IgsVectorLayer) {
      const res = await queryFeaturesInstance.getIgsLayerInfo({
        ip: layer.ip,
        port: layer.port,
        gdbp: layer.gdbps,
        layerType: 'layer'
      })
      const { extent } = res
      range = [extent.xmin, extent.ymin, extent.xmax, extent.ymax]
    } else if (layer.subtype === SubLayerType.IgsTileLayer) {
      const res = await queryFeaturesInstance.getIgsLayerInfo({
        ip: layer.ip,
        port: layer.port,
        serverName: layer.serverName,
        layerType: 'tile'
      })
      const { extent } = res
      range = [extent.xmin, extent.ymin, extent.xmax, extent.ymax]
    } else if (layer.subtype === SubLayerType.OgcWmsLayer) {
      const result = await queryOGCInfoInstance.getWMSInfo(layer.serverUrl)
      const { bounds } = result
      range = [bounds.xmin, bounds.ymin, bounds.xmax, bounds.ymax]
    } else if (layer.subtype === SubLayerType.OgcWmtsLayer) {
      const result = await queryOGCInfoInstance.getWMTSInfo(layer.serverUrl)
      if (result.length > 0) {
        const { bounds } = result[0]
        range = [...bounds]
      }
    } else if (layer.subtype === SubLayerType.RasterArcgisLayer) {
      const result = await queryArcgisInfoInstance.getArcgisInfo(
        layer.serverUrl
      )
      const { initialExtent } = result
      range = [
        initialExtent.xmin,
        initialExtent.ymin,
        initialExtent.xmax,
        initialExtent.ymax
      ]
    }

    return range
  }

  /**
   * 获取指定服务图层子图的名称
   *
   * 如:在线地图服务图层
   *
   * @param {*} layer layer的类型定义不详，具体可查看"目录树"组件添加图层的逻辑。
   * 后面需要考虑：1.使用webclient-store中对图层的定义。2.一张图应用里面对图层对象进行定义。
   * @memberof QueryLayerInfo
   */
  public async getSubLayer(layer: any) {}
}

export default new QueryLayerInfo()
