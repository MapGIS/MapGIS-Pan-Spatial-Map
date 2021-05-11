<template>
  <div class="mp-query-result-tree">
    <a-empty v-if="!queryResult.length" />
    <a-tree
      showLine
      :replaceFields="{ children: 'children' }"
      :load-data="loadTreeData"
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

interface IRect {
  xmin: number
  ymin: number
  xmax: number
  ymax: number
}

interface IQueryParams extends DocInfoQueryParam {
  id: string
  gdbps: string
  type: LayerType
}

interface IQueryLayerInfo {
  layerName: string
  layerIndex: string | null
}

// 支持查询的类型图层如下：
// 1.在线地图服务图层
// 2.在线矢量图层
// 3.关联了在线地图服务的在线瓦片图层
@Component
export default class MpQueryResultTree extends Vue {
  // 待查询的图层：支持查询的类型图层如下：1.在线地图服务图层。2.在线矢量图层。3.关联了在线地图服务的在线瓦片图层
  @Prop({ type: Object, required: true, default: () => ({}) })
  readonly layer!: Record<string, any>

  // 待查询的图层：支持查询的类型图层如下：1.在线地图服务图层。2.在线矢量图层。3.关联了在线地图服务的在线瓦片图层
  @Prop({ type: Object, required: true, default: () => ({}) })
  readonly queryRect!: IRect | {}

  // 参与查询的地图索引,可选属性,仅对1、3两种类型的图层有效。
  @Prop({ type: Number, default: 0 })
  readonly mapIndex!: number

  // 参与查询的子图层名称列表,名称之间以逗号分隔。可选属性,仅对1、3两种类型的图层有效。
  @Prop({ type: String, default: '' })
  readonly querySublayerNames!: string

  // 参与查询的行政区划代码列表,行政区划代码之间以逗号分隔。可选属性,仅对1、3两种类型的图层有效，且图层url中须含有行政区代码。
  @Prop({ type: String, default: '' })
  readonly queryDistrictCode!: string

  // 分页显示的条目数
  @Prop({ type: Number, default: 20 })
  readonly countPerPage!: number

  // 分页显示时的当前页码，从1开始。
  @Prop({ type: Number, default: 1 })
  readonly curPageNumber!: number

  queryResult: Record<string, any>[] = []

  layerInfos: IQueryLayerInfo[] = []

  @Watch('layer', { deep: true })
  watchLayer(nV) {
    this.getLayerInfos()
  }

  @Watch('queryRect', { deep: true })
  watchQueryRect() {
    this.getLayerInfos()
  }

  /**
   * 根据图层url格式化图层的ip,port,serverName等信息
   */
  getQueryParams(): IQueryParams {
    const { id, url, type, gdbps } = this.layer
    return {
      ...this.layer._parseUrl(url),
      id,
      type,
      gdbps
    }
  }

  /**
   * 获取uuid
   */
  getUuid() {
    return UUID.uuid()
  }

  /**
   * 获取IGSDoc图层信息
   * @param queryParam
   */
  async getIGSDocLayerInfo({ ip, port, docName }: IQueryParams) {
    const docInfo = await queryFeaturesInstance.getDocInfo({
      ip,
      port,
      serverName: docName
    })
    if (!docInfo) return []
    const { MapInfos } = docInfo
    if (MapInfos.length > this.mapIndex) {
      const mapInfo: DocInfoMapInfo = MapInfos[this.mapIndex]
      if (mapInfo) {
        const { CatalogLayer } = mapInfo
        const layerIndexs: string[] = queryFeaturesInstance.getVectorIndex(
          CatalogLayer,
          this.querySubLayerNames,
          this.queryDistrictCode,
          [],
          []
        )
        const names = queryFeaturesInstance
          .getVectorByIndex(layerIndexs.join(','), CatalogLayer)
          .map(({ LayerName }) => LayerName)
        if (names.length && names.length === layerIndexs.length) {
          return names.map((name, i) => ({
            layerName: name,
            layerIndex: layerIndexs[i]
          }))
        }
      }
    }
  }

  /**
   * 获取IGSTile图层信息
   * @param queryParam
   */
  async getIGSTileLayerInfo({ ip, port, serverName, id }: IQueryParams) {
    const layerConfig = dataCatalogManagerInstance.getLayerConfigByID(id)
    const docName = layerConfig.bindData
      ? layerConfig.bindData.serverName
      : serverName
    const res = await this.getIGSDocLayerInfo({
      ip,
      port,
      docName
    })
    return res || []
  }

  /**
   * 获取IGSVector图层信息
   * @param queryParam
   */
  getIGSVectorLayerInfo({ gdbps }: IQueryParams) {
    const res: IQueryLayerInfo[] = []
    if (gdbps) {
      const strs = gdbps.split('/')
      const name = strs[strs.length - 1]
      res.push({
        layerName: name,
        layerIndex: null
      })
    }
    return res
  }

  /**
   *  图层类型
   *  1.在线地图服务图层
   *  2.在线矢量图层
   *  3.关联了在线地图服务的在线瓦片图层
   * IGSTile瓦片(4)
   * IGSMapImage地图(5)
   * IGSVector矢量(6)
   */
  async getLayerInfos() {
    const queryParams = this.getQueryParams()
    if (queryParams.id) {
      let layerInfos = []
      switch (queryParams.type) {
        case LayerType.IGSMapImage:
          layerInfos = await this.getIGSDocLayerInfo(queryParams)
          break
        case LayerType.IGSTile:
          layerInfos = await this.getIGSTileLayerInfo(queryParams)
          break
        case LayerType.IGSVector:
          layerInfos = this.getIGSVectorLayerInfo(queryParams)
          break
        default:
          break
      }
      this.layerInfos = layerInfos
      this.queryResult = layerInfos.map(({ layerName }, index) => ({
        index,
        title: layerName,
        key: this.getUuid()
      }))
    }
  }

  /**
   * 获取IGSMapImage查询结果
   * @param queryRect
   * @param queryLayerInfos
   * @param queryParams
   */
  async getIGSMapImageResult(
    queryRect: IRect,
    queryLayerInfos: IQueryLayerInfo[],
    queryParams: IQueryParams
  ) {
    const { ip, port, docName } = queryParams
    const layerIdxs = queryLayerInfos.reduce((str, { layerIndex }, i) => {
      if (i > 0) {
        str += ','
      }
      if (layerIndex) {
        str += layerIndex
      }
      return str
    }, '')
    const geometry = queryFeaturesInstance.creatRectByMinMax(
      queryRect.xmin,
      queryRect.ymin,
      queryRect.xmax,
      queryRect.ymax
    )
    const res = await queryFeaturesInstance.query({
      ip,
      port,
      layerIdxs,
      docName,
      geometry,
      mapIndex: this.mapIndex,
      page: this.curPageNumber - 1,
      pageCount: this.countPerPage,
      f: 'json'
    })
    return res
  }

  /**
   * 整合某个图层下的所有查询结果数据并返回
   * @param result
   * @param layerInfoIndexs
   */
  getLayerAllNewResult(
    result: any[] | object | null,
    layerInfoIndexs: number[]
  ) {
    if (!result) return []
    const resultArray = Array.isArray(result) ? result : [result]
    return resultArray.map((featureSet, index) => {
      const { layerName } = this.layerInfos[layerInfoIndexs[index]]
      const { features } = queryFeaturesInstance.igsFeaturesToGeoJSONFeatures(
        featureSet
      )
      const resultForPerLayer =
        features && features.length
          ? features.map(item => ({
              key: this.getUuid(),
              title: item.properties.fid,
              feature: item,
              isLeaf: true
            }))
          : []
      return {
        key: this.getUuid(),
        title: layerName,
        children: resultForPerLayer
      }
    })
  }

  /**
   * 图层类型
   * 1.在线地图服务图层
   * 2.在线矢量图层
   * 3.关联了在线地图服务的在线瓦片图层
   * 4.要求同一次查询的图层类型是一样的。
   */
  async queryFeature(queryRect: IRect, layerInfoIndexs: number[]) {
    const queryLayerInfos = layerInfoIndexs.map<IQueryLayerInfo>(
      i => this.layerInfos[i]
    )
    if (!queryLayerInfos.length) return []
    const queryParams = this.getQueryParams()
    let result = null
    switch (queryLayerInfos[0].layerIndex) {
      case null:
        // todo IGSVector
        break
      default:
        // 默认是IGSMapImage
        result = await this.getIGSMapImageResult(
          queryRect,
          queryLayerInfos,
          queryParams
        )
        break
    }
    return this.getLayerAllNewResult(result, layerInfoIndexs)
  }

  /**
   * 异步加载数据
   * @param treeNode
   */
  loadTreeData(treeNode) {
    return new Promise(resolve => {
      if (treeNode.dataRef.children) {
        resolve()
        return
      }
      this.queryFeature(this.queryRect, [treeNode.dataRef.index]).then(
        features => {
          treeNode.dataRef.children =
            features && features.length ? features[0].children : []
          this.queryResult = [...this.queryResult]
          resolve()
        }
      )
    })
  }

  created() {
    this.getLayerInfos()
  }
}
</script>
<style lang="less" scoped>
@import './index.less';
</style>
