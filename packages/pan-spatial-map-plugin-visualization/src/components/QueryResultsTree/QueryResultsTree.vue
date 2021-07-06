<template>
  <div class="mp-query-result-tree">
    <a-spin :spinning="loading">
      <a-empty v-if="!treeData.length" />
      <a-tree
        showLine
        :checkable="multiple"
        :expandedKeys.sync="expandedKeys"
        :load-data="loadTreeData"
        :tree-data="treeData"
        @load="onTreeLoad"
        @check="onTreeSelect"
        @select="onTreeSelect"
        v-else
      />
    </a-spin>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Watch, Vue } from 'vue-property-decorator'
import {
  UUID,
  LayerType,
  Objects,
  Feature,
  Catalog
} from '@mapgis/web-app-framework'
import { Common } from '@mapgis/webclient-es6-service'
import {
  baseConfigInstance,
  dataCatalogManagerInstance
} from '@mapgis/pan-spatial-map-store'
import _uniq from 'lodash/uniq'

interface IQueryParams extends Catalog.DocInfoQueryParam {
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
@Component
export default class MpQueryResultTree extends Vue {
  // 待查询的图层：支持查询的类型图层如下：1.在线地图服务图层。2.在线矢量图层。3.关联了在线地图服务的在线瓦片图层
  @Prop({ type: Object, required: true, default: () => ({}) })
  readonly layer!: Record<string, any>

  // 待查询的图层的查询范围
  @Prop({ type: Object, required: true, default: () => ({}) })
  readonly queryRect!: Common.Rectangle | {}

  // 参与查询的地图索引,可选属性,仅对1、3两种类型的图层有效。
  @Prop({ type: Number, default: 0 })
  readonly mapIndex!: number

  // 参与查询的子图层名称列表,名称之间以逗号分隔。可选属性,仅对1、3两种类型的图层有效。
  @Prop({ type: String, default: '' })
  readonly querySublayerNames!: string

  // 参与查询的行政区划代码列表,行政区划代码之间以逗号分隔。可选属性,仅对1、3两种类型的图层有效，且图层url中须含有行政区代码。
  @Prop({ type: String, default: '' })
  readonly queryDistrictCode!: string

  // 是否多选
  @Prop({ type: Boolean, default: false })
  readonly multiple!: boolean

  // 分页显示的条目数
  @Prop({ type: Number, default: 20 })
  readonly pageCount!: number

  // 分页显示时的当前页码，从1开始。
  @Prop({ type: Number, default: 1 })
  readonly page!: number

  loading = false

  // 图层信息
  layerInfos: IQueryLayerInfo[] = []

  // 结果树数据
  treeData: ITreeNode[] = []

  // 已经加载的节点的子节点数据
  loadedChildNodes: string[] = []

  // 已经加载的节点
  loadedKeys: string[] = []

  // 默认展开的节点, 第一个节点
  defaultExpandedKeys: string[] = []

  // 展开的节点
  expandedKeys: string[] = []

  // 获取uuid
  get uuid() {
    return () => UUID.uuid()
  }

  // 获取范围
  get goemetry() {
    const { xmin, ymin, xmax, ymax } = this.queryRect
    return Objects.GeometryExp.creatRectByMinMax(xmin, ymin, xmax, ymax)
  }

  /**
   * 根据图层url格式化图层的ip,port,serverName等信息
   */
  get queryParams(): IQueryParams {
    const { url, ...others } = this.layer
    const { ip: baseIp, port: basePort } = baseConfigInstance.config

    return typeof this.layer._parseUrl === 'function'
      ? {
          ...this.layer._parseUrl(url),
          ...others
        }
      : {
          ip: baseIp,
          port: basePort,
          ...others
        }
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
   * 获取IGSMapImage图层信息
   * @param queryParams
   */
  async getIGSMapImageLayerInfo({ ip, port, docName }: IQueryParams) {
    const docInfo = await Catalog.DocumentCatalog.getDocInfo({
      ip,
      port,
      serverName: docName
    })
    if (docInfo && docInfo.MapInfos.length > this.mapIndex) {
      const mapInfo: DocInfoMapInfo = docInfo.MapInfos[this.mapIndex]
      if (mapInfo) {
        const { CatalogLayer } = mapInfo
        const layerIndexes: string[] = Catalog.DocumentCatalog.getLayerIndexesByNamesOrCodes(
          CatalogLayer,
          this.querySubLayerNames,
          this.queryDistrictCode,
          [],
          []
        )
        const names = Catalog.DocumentCatalog.getLayersByIndexes(
          layerIndexes.join(','),
          CatalogLayer
        ).map(({ LayerName }) => LayerName)
        if (names.length && names.length === layerIndexes.length) {
          return names.map<IQueryLayerInfo>((name, i) => ({
            layerName: name,
            layerIndex: layerIndexes[i]
          }))
        }
      }
    }
    return []
  }

  /**
   * 获取IGSTile图层信息
   * @param queryParams
   */
  async getIGSTileLayerInfo({ ip, port, serverName, id }: IQueryParams) {
    const layerConfig = dataCatalogManagerInstance.getLayerConfigByID(id)
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
   * @param queryParams
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
      const {
        queryParams,
        queryParams: { id, type }
      } = this
      if (id) {
        let layerInfos = []
        switch (type) {
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
          key: this.uuid()
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
   * 图层要素查询
   * 要求同一次查询的图层类型是一样的。
   */
  async queryFeature(treeNodeIndexs: number[]) {
    const queryLayerInfos = treeNodeIndexs.map(i => this.layerInfos[i])
    if (queryLayerInfos.length) {
      const _type = !queryLayerInfos[0].layerIndex ? 'IGSVector' : 'IGSMapImage'
      const { ip, port, docName, gdbps } = this.queryParams
      let otherParams = {}
      switch (LayerType[_type]) {
        case LayerType.IGSMapImage:
          otherParams = {
            docName,
            layerIdxs: this.getLayerIdxs(queryLayerInfos),
            mapIndex: this.mapIndex
          }
          break
        case LayerType.IGSVector:
          otherParams = { gdbp: gdbps }
          break
        default:
          break
      }
      const result = await Feature.FeatureQuery.query({
        ip,
        port,
        geometry: this.goemetry,
        page: this.page - 1,
        pageCount: this.pageCount,
        f: 'json',
        ...otherParams
      })
      if (result) {
        const resultArray = Array.isArray(result) ? result : [result]
        return resultArray.map<ITreeNode>((featureSet, index) => {
          const { layerName } = this.layerInfos[treeNodeIndexs[index]]
          let resultForPerLayer = []
          if (featureSet.SFEleArray) {
            const geoJson = Feature.FeatureConvert.featureIGSToFeatureGeoJSON(
              featureSet
            )
            const { features } = geoJson
            if (features && features.length) {
              resultForPerLayer = features.map(item => ({
                key: this.uuid(),
                title: item.properties.fid,
                feature: item,
                isLeaf: true
              }))
            }
          }
          return {
            key: this.uuid(),
            title: layerName,
            children: resultForPerLayer
          }
        })
      }
    }

    return []
  }

  /**
   * 设置树节点的selectable
   * @param treeData 数据
   */
  setTreeDataSelectable(treeData) {
    return treeData.map(node => {
      const _node = { ...node }
      if (!_node.isLeaf) {
        _node.selectable = false
      }
      if (_node.children && _node.children.length) {
        this.setTreeDataSelectable(_node.children)
      }
      return _node
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
      this.queryFeature([treeNode.dataRef.index]).then(features => {
        const children = features && features.length ? features[0].children : []
        treeNode.dataRef.children = children
        this.treeData = this.setTreeDataSelectable(this.treeData)
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
    const { children } = node.dataRef
    this.loadedChildNodes = children
    this.loadedChildNodes = _uniq([...this.loadedChildNodes, ...children])
    this.$emit('on-node-loaded', loadedKeys, this.loadedChildNodes)
  }

  /**
   * 结果树选中
   * @param selectedKeys
   * @param treeNode
   */
  onTreeSelect(selectedKeys, { selectedNodes, checkedNodes, node }) {
    const vnodes = this.multiple ? checkedNodes : selectedNodes
    // 当前节点的数据
    const nodeData = node.dataRef
    // 选中节点的数据集合
    const selectedDatas = vnodes.length
      ? vnodes.map(({ data }) => data.props.dataRef)
      : []
    this.$emit('on-select', selectedKeys, selectedDatas, nodeData)
  }

  created() {
    this.getLayerInfos()
  }
}
</script>
