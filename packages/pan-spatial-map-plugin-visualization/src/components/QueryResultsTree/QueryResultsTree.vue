<template>
  <div class="mp-query-result-tree">
    <a-spin :spinning="loading">
      <a-empty v-if="!treeData.length" />
      <a-tree
        showLine
        :load-data="loadTreeData"
        :tree-data="treeData"
        @load="onTreeLoad"
        @select="onTreeSelect"
        v-else
      />
    </a-spin>
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

interface ITreeNode {
  key: string
  title: string
  children?: ITreeNode[]
  isLeaf?: boolean
  index?: number
  feature?: any
}

// 支持查询的类型图层如下：
// 1.在线地图服务图层
// 2.在线矢量图层
// 3.关联了在线地图服务的在线瓦片图层
// 暂时只支持单选
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

  loading = false

  layerInfos: IQueryLayerInfo[] = []

  treeData: ITreeNode[] = []

  @Watch('layer', { deep: true })
  watchLayer(nV) {
    this.getLayerInfos()
  }

  @Watch('queryRect', { deep: true })
  watchQueryRect() {
    const dataRef = this.treeData.length ? this.treeData[0] : null
    this.loadTreeData({ dataRef })
  }

  /**
   * 根据图层url格式化图层的ip,port,serverName等信息
   */
  getQueryParams(): IQueryParams {
    const { id, url, type, gdbps } = this.layer
    const base = { id, type, gdbps }
    return typeof this.layer._parseUrl === 'function'
      ? {
          ...this.layer._parseUrl(url),
          ...base
        }
      : base
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
    if (docInfo && docInfo.MapInfos.length > this.mapIndex) {
      const mapInfo: DocInfoMapInfo = docInfo.MapInfos[this.mapIndex]
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
          return names.map<IQueryLayerInfo>((name, i) => ({
            layerName: name,
            layerIndex: layerIndexs[i]
          }))
        }
      }
    }
    return []
  }

  /**
   * 获取IGSTile图层信息
   * @param queryParam
   */
  async getIGSTileLayerInfo({ ip, port, serverName, id }: IQueryParams) {
    const layerConfig: any = dataCatalogManagerInstance.getLayerConfigByID(id)
    const docName =
      layerConfig && layerConfig.bindData
        ? layerConfig.bindData.serverName
        : serverName
    const res = await this.getIGSDocLayerInfo({
      ip,
      port,
      docName
    })
    return res
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
    try {
      this.loading = true
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
        this.treeData = layerInfos.map<ITreeNode>(({ layerName }, index) => ({
          index,
          title: layerName,
          key: this.getUuid()
        }))
        this.loading = false
      }
    } catch (e) {
      this.loading = false
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
    const layerIdxs = queryLayerInfos.reduce<string>(
      (str, { layerIndex }, i) => {
        if (i > 0) {
          str += ','
        }
        if (layerIndex) {
          str += layerIndex
        }
        return str
      },
      ''
    )
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
   * 图层类型
   * 1.在线地图服务图层
   * 2.在线矢量图层
   * 3.关联了在线地图服务的在线瓦片图层
   * 4.要求同一次查询的图层类型是一样的。
   */
  async queryFeature(queryRect: IRect, treeNodeIndexs: number[]) {
    const queryLayerInfos = treeNodeIndexs.map<IQueryLayerInfo>(
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
    if (!result) return []
    const resultArray = Array.isArray(result) ? result : [result]
    return resultArray.map<ITreeNode>((featureSet, index) => {
      const { layerName } = this.layerInfos[treeNodeIndexs[index]]
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
   * 异步加载数据
   * @param treeNode
   */
  loadTreeData(treeNode: { dataRef: ITreeNode }) {
    return new Promise(resolve => {
      if (!treeNode.dataRef || treeNode.dataRef.children) {
        resolve()
        return
      }
      this.queryFeature(this.queryRect, [treeNode.dataRef.index]).then(
        features => {
          treeNode.dataRef.children =
            features && features.length ? features[0].children : []
          this.treeData = [...this.treeData]
          resolve()
        }
      )
    })
  }

  /**
   *  结果树展开
   *  @param loadedKeys
   * @param treeNode
   */
  onTreeLoad(loadedKeys, { node }) {
    this.$emit('on-load-done', loadedKeys, node.dataRef)
  }

  /**
   * 结果树选中
   * @param selectedKeys
   * @param treeNode
   */
  onTreeSelect(selectedKeys, { selectedNodes, node }) {
    const {
      dataRef,
      dataRef: { isLeaf }
    }: {
      dataRef: ITreeNode
    } = node
    if (isLeaf) {
      this.$emit('on-select', [dataRef.key], [dataRef])
    }
  }

  created() {
    this.getLayerInfos()
  }
}
</script>
