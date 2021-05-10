<template>
  <div class="mp-query-result-tree">
    <a-empty v-if="!queryResult.length" />
    <a-tree
      showLine
      :load-data="onLoadTreeData"
      :tree-data="queryResult"
      v-else
    />
  </div>
</template>

<script lang="ts">
import { Component, Prop, Watch, Vue } from 'vue-property-decorator'
import { UUID, LayerType } from '@mapgis/web-app-framework'
import {
  queryFeaturesInstance,
  DocInfoQueryParam,
  dataCatalogManagerInstance
} from '@mapgis/pan-spatial-map-store'

interface IQueryLayerInfo {
  layerName: string
  layerIndex: string
}

// 支持查询的类型图层如下：
// 1.在线地图服务图层
// 2.在线矢量图层
// 3.关联了在线地图服务的在线瓦片图层
@Component
export default class MpQueryResultTree extends Vue {
  // 待查询的图层：支持查询的类型图层如下：1.在线地图服务图层。2.在线矢量图层。3.关联了在线地图服务的在线瓦片图层
  @Prop({ type: Object, required: true, default: () => {} })
  readonly layer!: Record<string, any>

  // 待查询的图层：支持查询的类型图层如下：1.在线地图服务图层。2.在线矢量图层。3.关联了在线地图服务的在线瓦片图层
  @Prop({ type: Object, required: true, default: () => {} })
  readonly queryRect!: {}

  // 参与查询的地图索引,可选属性,仅对1、3两种类型的图层有效。
  @Prop({ type: Number, required: false, default: 0 })
  readonly mapIndex!: number

  // 参与查询的子图层名称列表,名称之间以逗号分隔。可选属性,仅对1、3两种类型的图层有效。
  @Prop({ type: String, required: false, default: '' })
  readonly querySublayerNames!: string

  // 参与查询的行政区划代码列表,行政区划代码之间以逗号分隔。可选属性,仅对1、3两种类型的图层有效，且图层url中须含有行政区代码。
  @Prop({ type: String, required: false, default: '' })
  readonly queryDistrictCode!: string

  // 分页显示的条目数
  @Prop({ type: Number, required: false, default: 20 })
  readonly countPerPage!: number

  // 分页显示时的当前页码，从1开始。
  @Prop({ type: Number, required: false, default: 1 })
  readonly curPageNumber!: number

  queryResult: Record<string, any>[] = []

  sublayerInfors: IQueryLayerInfo[] = []

  @Watch('layer', { deep: true, immediate: true })
  watchLayer(nV) {
    if (nV) {
      this.getSubLayerInfo()
    }
  }

  @Watch('queryRect', { deep: true, immediate: true })
  watchLayer() {
    this.getSubLayerInfo()
  }

  getQueryParams() {
    return {
      ...this.layer._parseUrl(this.layer.url),
      id: this.layer.id
    }
  }

  /**
   * 获取igs图层信息
   */
  async getIgsDocLayerInfo(queryParam: DocInfoQueryParam) {
    const docInfo = await queryFeaturesInstance.getDocInfo(queryParam)
    if (docInfo) {
      const { MapInfos } = docInfo
      if (MapInfos.length > this.mapIndex) {
        const mapInfo: DocInfoMapInfo = MapInfos[this.mapIndex]
        if (mapInfo) {
          const { catalogLayers } = mapInfo
          const subLayerIndexs: string[] = queryFeaturesInstance.getVectorIndex(
            catalogLayers,
            this.querySubLayerNames,
            this.queryDistrictCode,
            [],
            []
          )
          const names = queryFeaturesInstance
            .getVectorByIndex(subLayerIndexs.join(','), catalogLayers)
            .map(({ LayerName }) => LayerName)
          if (names.length && names.length === subLayerIndexs.length) {
            return names.map((name, i) => ({
              layerName: name,
              layerIndex: subLayerIndexs[i]
            }))
          }
        }
      }
    }
    return []
  }

  /**
   *  图层类型
   *  1.在线地图服务图层
   *  2.在线矢量图层
   *  3.关联了在线地图服务的在线瓦片图层
   */
  async getSubLayerInfo() {
    const { id, ip, port, type, serverName, gdbps } = this.getQueryParams()
    const queryParam = { ip, port, serverName }
    let sublayerInfors = this.sublayerInfors
    console.log(
      'getSubLayerInfo11111111111111',
      type,
      LayerType.IGSMapImage,
      LayerType.IGSTile,
      LayerType.IGSVector,
      LayerType
    )
    switch (type) {
      case LayerType.IGSMapImage:
        sublayerInfors = await this.getIgsDocLayerInfo(queryParam)
        break
      case LayerType.IGSTile: {
        const layerConfig = dataCatalogManagerInstance.getLayerConfigByID(id)
        const _serverName = layerConfig.bindData
          ? layerConfig.bindData.serverName
          : serverName
        sublayerInfors = await this.getIgsDocLayerInfo({
          ...queryParam,
          serverName: _serverName
        })
        break
      }
      case LayerType.IGSVector: {
        const strs = gdbps.split('/')
        const name = strs[strs.length - 1]
        sublayerInfors.push({
          layerName: name,
          layerIndex: ''
        })
        break
      }
      default:
        break
    }
    if (sublayerInfors.length) {
      this.sublayerInfors = sublayerInfors.map((item, index) => {
        this.queryResult.push({
          key: UUID.uuid(),
          title: item.layerName,
          sublayerIndex: index
        })
        return item
      })
    }
    console.log('getSubLayerInf222222222o', sublayerInfors, this.queryResult)
  }

  /**
   * 异步加载数据
   * @param treeNode<object>
   */
  onLoadTreeData({ dataRef }) {
    console.log('treeNode.dataRef', dataRef)
    return new Promise(resolve => {
      this.queryFeature(this.queryRect, [dataRef.sublayerIndex]).then(
        features => {
          const res = features.length === 1 ? features[0].children : []
          resolve(res)
        }
      )
    })
  }

  /**
   * 图层类型
   * 1.在线地图服务图层
   * 2.在线矢量图层
   * 3.关联了在线地图服务的在线瓦片图层
   * 4.要求同一次查询的图层类型是一样的。
   */
  async queryFeature(queryRect: Rect, subLayerInfoIndexs: number[]) {
    const queryLayerInfos: IQueryLayerInfo[] = subLayerInfoIndexs.map(
      v => this.sublayerInfors[v]
    )
    if (queryLayerInfos.length) {
      let resultForAllLayer: Record<string, any>[] = []
      let queryResult: {} = {}
      switch (queryLayerInfos[0].layerIndex) {
        case LayerType.IGSMapImage: {
          const { ip, port, serverName } = this.getQueryParams()
          const layerIdxs = queryLayerInfos.reduce((str, { layerIndex }, i) => {
            if (!i) {
              str += ','
            }
            str += layerIndex
            return str
          }, '')
          const queryGeometry = queryFeaturesInstance.creatRectByMinMax(
            queryRect.xMin,
            queryRect.yMin,
            queryRect.xMax,
            queryRect.yMax
          )
          queryResult = await queryFeaturesInstance.query({
            ip,
            port,
            layerIdxs,
            docName: serverName,
            geometry: queryGeometry,
            mapIndex: this.mapIndex,
            page: this.curPageNumber - 1,
            pageCount: this.countPerPage,
            f: 'json'
          })
          break
        }
        case LayerType.IGSVector:
          break
        default:
          break
      }
      if (queryResult) {
        let queryResultArray: [] = []
        if (queryResult.length) {
          // 多个图层的查询是一个含有featureSet元素的数组
          queryResultArray = queryResult
        } else {
          // 单个图层的查询是一个featureSet对象。
          queryResultArray.push(queryResult)
        }
        resultForAllLayer = queryResultArray.map((featureSet, index) => {
          const {
            features
          } = queryFeaturesInstance.igsFeaturesToGeoJSONFeatures(featureSet)
          const { layerName } = this.sublayerInfors[subLayerInfoIndexs[index]]
          const resultForPerLayer =
            features && features.length
              ? features.map(item => ({
                  key: UUID.uuid(),
                  title: item.properties.fid,
                  feature: item
                }))
              : []
          return {
            key: UUID.uuid(),
            title: layerName,
            children: resultForPerLayer
          }
        })
      }

      return resultForAllLayer
    }
    return []
  }
}
</script>
<style lang="less" scoped>
@import './index.less';
</style>
