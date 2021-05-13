<template>
  <div class="mp-query-result-tree">
    <a-spin :spinning="loading">
      <a-empty v-if="!treeData.length" />
      <a-tree
        showLine
        :expandedKeys.sync="expandedKeys"
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
  layerIndex: string
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

  // 默认展开的节点, 第一个节点
  defaultExpandedKeys: string[] = []

  // 图层信息
  layerInfos: IQueryLayerInfo[] = []

  // 结果树数据
  treeData: ITreeNode[] = []

  // 展开的节点
  expandedKeys: string[] = []

  // 获取范围
  get goemetry() {
    const { xmin, ymin, xmax, ymax } = this.queryRect
    return queryFeaturesInstance.creatRectByMinMax(xmin, ymin, xmax, ymax)
  }

  @Watch('layer', { deep: true })
  watchLayer() {
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
    const base = {
      id,
      type,
      gdbps
    }
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
   * 获取IGSMapImage图层信息
   * @param queryParam
   */
  async getIGSMapImageLayerInfo({ ip, port, docName }: IQueryParams) {
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
    const res = await this.getIGSMapImageLayerInfo({
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
        layerIndex: ''
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
      this.layerInfos = []
      this.treeData = []
      const queryParams = this.getQueryParams()
      if (queryParams.id) {
        let layerInfos = []
        switch (queryParams.type) {
          case LayerType.IGSMapImage:
            layerInfos = await this.getIGSMapImageLayerInfo(queryParams)
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
        if (this.treeData.length) {
          this.expandedKeys.push(this.treeData[0].key)
        }

        this.loading = false
      }
    } catch (e) {
      this.loading = false
    }
  }

  /**
   * 获取图层层级
   * @param queryLayerInfos
   */
  getLayerIdxs(queryLayerInfos) {
    return queryLayerInfos.reduce<string>(
      (str, { layerIndex }: IQueryLayerInfo, i) => {
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
  }

  /**
   * 图层类型
   * 1.在线地图服务图层
   * 2.在线矢量图层
   * 3.关联了在线地图服务的在线瓦片图层
   * 4.要求同一次查询的图层类型是一样的。
   */
  async queryFeature(treeNodeIndexs: number[]) {
    const queryLayerInfos = treeNodeIndexs.map(i => this.layerInfos[i])
    if (queryLayerInfos.length) {
      const _type = !queryLayerInfos[0].layerIndex ? 'IGSVector' : 'IGSMapImage'
      const { ip, port, docName, gdbps } = this.getQueryParams()
      let queryParams = {
        ip,
        port,
        geometry: this.goemetry,
        page: this.curPageNumber - 1,
        pageCount: this.countPerPage,
        f: 'json'
      }
      switch (LayerType[_type]) {
        case LayerType.IGSMapImage: {
          const layerIdxs = this.getLayerIdxs(queryLayerInfos)
          queryParams = {
            ...queryParams,
            layerIdxs,
            docName,
            mapIndex: this.mapIndex
          }
          break
        }
        case LayerType.IGSVector:
          queryParams = {
            ...queryParams,
            gdbp: gdbps
          }
          break
        default:
          break
      }
      const result = await queryFeaturesInstance.query(queryParams)
      if (result) {
        const resultArray = Array.isArray(result) ? result : [result]
        return resultArray.map<ITreeNode>((featureSet, index) => {
          const { layerName } = this.layerInfos[treeNodeIndexs[index]]
          const {
            features
          } = queryFeaturesInstance.igsFeaturesToGeoJSONFeatures(featureSet)
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
    }

    return []
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
      this.queryFeature([treeNode.dataRef.index]).then(features => {
        treeNode.dataRef.children =
          features && features.length ? features[0].children : []
        this.treeData = [...this.treeData]
        resolve()
      })
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
