<template>
  <div class="mp-query-result-tree">
    <a-spin :spinning="loading">
      <a-empty v-if="!treeData.length" />
      <a-tree
        v-else
        @load="onTreeLoad"
        @check="onTreeSelect"
        @select="onTreeSelect"
        :checkedKeys="selectedKeys"
        :selectedKeys="selectedKeys"
        :expandedKeys.sync="expandedKeys"
        :load-data="loadDataMethod"
        :tree-data="treeData"
        :replace-fields="{ title: 'layerName' }"
        :checkable="multiple"
        showLine
      />
    </a-spin>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Watch, Mixins } from 'vue-property-decorator'
import { Rectangle } from '@mapgis/webclient-es6-service/common/Rectangle'
import {
  UUID,
  Layer,
  LayerType,
  Rectangle3D,
  Objects,
  Feature,
  Catalog,
  MapMixin
} from '@mapgis/web-app-framework'
import {
  baseConfigInstance,
  dataCatalogManagerInstance
} from '@mapgis/pan-spatial-map-common'
import _last from 'lodash/last'

const { DocumentCatalog } = Catalog
const {
  FeatureQueryParam,
  FeatureIGS,
  FeatureGeoJSON,
  GFeature,
  ArcGISFeatureQuery,
  FeatureQuery,
  FeatureConvert
} = Feature

interface ILayerParams extends Layer {
  ip: string
  port: string
  docName?: stirng
  tileName?: stirng
}

interface ILayerInfoItem {
  layerName: string
  layerIndex: string
  layerId?: string
  layerGdbp?: string
}

interface ITreeNode extends ILayerInfoItem {
  key: string
  children?: ITreeNode[]
  isLeaf?: boolean
  selectable?: boolean
  feature?: GFeature
}

/**
 * 目前支持的图层类型有:
 * IGSTile瓦片(4) IGS瓦片
 * IGSMapImage地图(5) IGS矢量文档(doc)
 * IGSVector矢量(6) IGS矢量图层(gdbp)
 * IGSScene(23) 三维DOC3D和IGSIMAGE3D (gdbp)
 * ArcGISMapImage(10)  ArcGIS IMAGE REST
 */
@Component
export default class MpQueryResultTree extends Mixins(MapMixin) {
  // 组件唯一标识
  @Prop() readonly vueKey!: string

  // 待查询的图层：支持查询的类型图层如下：1.在线地图服务图层。2.在线矢量图层。3.关联了在线地图服务的在线瓦片图层
  @Prop({ type: Object, default: () => ({}) })
  readonly layer!: Record<string, unknown>

  // 待查询的图层的查询范围
  @Prop({ type: [Object, Array] })
  readonly geometry!: Rectangle | Rectangle3D

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
  @Prop({ type: Number, default: 100 })
  readonly pageCount!: number

  // 分页显示时的当前页码，从1开始。
  @Prop({ type: Number, default: 1 })
  readonly page!: number

  loading = false

  // 结果树数据
  treeData: ITreeNode[] = []

  // 已经加载的节点的children集合
  loadedNodeDataChildren: ITreeNode[] = []

  // 已经加载的节点的dataRef集合
  loadedNodeData: ITreeNode[] = []

  // 展开的节点
  expandedKeys: string[] = []

  // 选中的节点
  selectedKeys: string[] = []

  // 根据图层url格式化图层的ip,port,docName等信息
  get layerParams() {
    const { ip: baseIp, port: basePort } = baseConfigInstance.config
    let _ip = baseIp
    let _port = basePort

    if (typeof this.layer._parseUrl === 'function') {
      const { ip, port, docName } = this.layer._parseUrl(this.layer.url)
      _ip = ip
      _port = port
      this.layer.docName = docName
    }

    this.layer.ip = _ip
    this.layer.port = _port

    return this.layer
  }

  @Watch('layer.id')
  layerChanged() {
    this.getTreeData()
  }

  @Watch('geometry', { deep: true })
  geometryChanged(nV) {
    if (nV) {
      // this.getTreeData()
      this.onRefresh()
    }
  }

  /**
   * 获取IGSMapImage图层信息
   * @param {object}
   */
  async getIGSMapImageLayerInfo({ ip, port, docName }: ILayerParams) {
    const docInfo = await DocumentCatalog.getDocInfo({
      ip,
      port,
      serverName: docName
    })
    if (docInfo && docInfo.MapInfos.length > this.mapIndex) {
      const mapInfo: DocInfoMapInfo = docInfo.MapInfos[this.mapIndex]
      if (mapInfo) {
        const { CatalogLayer } = mapInfo
        const layerIndexes: string[] = DocumentCatalog.getLayerIndexesByNamesOrCodes(
          CatalogLayer,
          this.querySublayerNames,
          this.queryDistrictCode,
          [],
          []
        )
        const layers = DocumentCatalog.getLayersByIndexes(
          layerIndexes.join(','),
          CatalogLayer
        )
        return layers.map<ILayerInfoItem>(({ LayerName, LayerIndex }) => ({
          layerName: LayerName,
          layerIndex: LayerIndex
        }))
      }
    }
    return []
  }

  /**
   * 获取IGSTile图层信息
   * @param {object}
   */
  async getIGSTileLayerInfo({ ip, port, id, serverName }: ILayerParams) {
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
   * @param {object}
   */
  getIGSVectorLayerInfo({ gdbps }: ILayerParams) {
    const res: ILayerInfoItem[] = []
    if (gdbps) {
      res.push({
        layerName: _last(gdbps.split('/')),
        layerIndex: ''
      })
    }
    return res
  }

  /**
   * 获取IGSScene图层信息
   * @param {object}
   */
  getArcGISMapImageLayerInfo({ id, allSublayers }: ILayerParams) {
    return allSublayers.reduce<ILayerInfoItem[]>(
      (arr, { id, title, visible }, index) => {
        if (visible) {
          arr.push({
            layerId: id,
            layerIndex: id,
            layerName: title
          })
        }
        return arr
      },
      []
    )
  }

  /**
   * 获取IGSScene图层信息
   * @param {object}
   */
  getIGSSceneLayerInfo({ id, activeScene }: ILayerParams) {
    const layerConfig = dataCatalogManagerInstance.getLayerConfigByID(id)
    if (layerConfig && layerConfig.bindData) {
      const { gdbps } = layerConfig.bindData
      return activeScene.sublayers.reduce<ILayerInfoItem[]>(
        (arr, item, index) => {
          if (item.visible) {
            arr.push({
              layerId: item.id,
              layerName: item.title || item.name,
              layerIndex: `${index}`,
              layerGdbp: gdbps
            })
          }
          return arr
        },
        []
      )
    }
    return []
  }

  /**
   * 获取数据
   */
  async getTreeData() {
    try {
      this.loading = true
      const {
        layerParams,
        layerParams: { isVisible, type }
      } = this
      if (isVisible) {
        let treeData = []
        switch (type) {
          case LayerType.IGSMapImage:
            treeData = await this.getIGSMapImageLayerInfo(layerParams)
            break
          case LayerType.IGSTile:
            treeData = await this.getIGSTileLayerInfo(layerParams)
            break
          case LayerType.IGSVector:
            treeData = this.getIGSVectorLayerInfo(layerParams)
            break
          case LayerType.ArcGISMapImage:
            treeData = this.getArcGISMapImageLayerInfo(layerParams)
            break
          case LayerType.IGSScene:
            treeData = this.getIGSSceneLayerInfo(layerParams)
            break
          default:
            break
        }
        this.treeData = treeData.map<ITreeNode>((node: ILayerInfoItem) => ({
          ...node,
          key: UUID.uuid(),
          selectable: false
        }))
        if (this.treeData.length) {
          this.expandedKeys.push(this.treeData[0]?.key)
        }
      }
    } finally {
      this.loading = false
    }
  }

  /**
   * igs要素查询
   * @param {Object} queryOptions 要素查询参数
   */
  async igsQueryFeature(queryOptions) {
    const featureIGS = await FeatureQuery.query(queryOptions)
    if (featureIGS.SFEleArray && featureIGS.SFEleArray.length) {
      const geojson: FeatureGeoJSON = FeatureConvert.featureIGSToFeatureGeoJSON(
        featureIGS
      )
      const { features } = geojson
      if (features && features.length) {
        return features.map(item => ({
          key: UUID.uuid(),
          isLeaf: true,
          selectable: true,
          layerName: item.properties.fid,
          feature: item
        }))
      }
    }
    return []
  }

  /**
   * igs三维要素查询
   * @param {Object} queryOptions 要素查询参数
   * @param {string} specialLayerId 图层ID
   */
  async igsQuery3DFeature(
    queryOptions: FeatureQueryParam,
    specialLayerId: string
  ) {
    const sceneController = Objects.SceneController.getInstance(
      this.Cesium,
      this.CesiumZondy,
      this.CesiumZondy.getWebGlobe(this.vueKey)
    )
    if (!sceneController) {
      return Promise.reject('WebGlobe未初始化')
    }
    const featureIGS: FeatureIGS = await FeatureQuery.query(
      {
        ...queryOptions,
        rtnLabel: false
      },
      false,
      true
    )
    const { AttStruct, SFEleArray = [] } = featureIGS
    if (!SFEleArray || !SFEleArray.length) {
      return []
    }
    const { source } = sceneController.findSource(specialLayerId)
    return SFEleArray.map(({ AttValue = [], bound = {}, FID }) => {
      const boundObj =
        source && source.length
          ? sceneController.localExtentToGlobelExtent(
              bound,
              source[0].root.transform
            )
          : bound
      const properties = {
        FID,
        specialLayerId: specialLayerId,
        specialLayerBound: boundObj,
        ...AttStruct.FldName.reduce((obj, n, i) => {
          obj[n] = AttValue[i]
          return obj
        }, {})
      }
      return {
        key: UUID.uuid(),
        isLeaf: true,
        selectable: true,
        layerName: FID,
        feature: {
          geometry: {
            coordinates: [],
            type: '3DPolygon'
          },
          properties
        }
      }
    })
  }

  /**
   * arcgis要素查询
   * @param {Object} queryOptions 要素查询参数
   */
  async arcGISQueryFeature(queryOptions: FeatureQueryParam) {
    const { layerIndex, serverUrl, geometry } = queryOptions
    const { count: totalCount } = await ArcGISFeatureQuery.getTotal({
      geometry,
      layerIndex,
      serverUrl,
      f: 'json'
    })
    const { features }: FeatureGeoJSON = await ArcGISFeatureQuery.query({
      ...queryOptions,
      totalCount
    })
    return features && features.length
      ? features.map((item: GFeature) => ({
          key: UUID.uuid(),
          isLeaf: true,
          selectable: true,
          layerName: item.properties.ID,
          feature: item
        }))
      : []
  }

  /**
   * 要素查询
   * @param {Object}
   */
  async queryFeatures({ layerId, layerIndex, layerGdbp }: ITreeNode) {
    const { ip, port, type, docName, gdbps, url } = this.layerParams
    const queryOptions = {
      ip,
      port,
      page: this.page - 1,
      pageCount: this.pageCount,
      geometry: this.geometry,
      coordPrecision: 8,
      f: 'json'
    }
    let children = []
    switch (type) {
      case LayerType.IGSMapImage:
        children = await this.igsQueryFeature({
          docName,
          mapIndex: this.mapIndex,
          layerIdxs: layerIndex,
          ...queryOptions
        })
        break
      case LayerType.IGSVector:
        children = await this.igsQueryFeature({
          gdbp: gdbps,
          ...queryOptions
        })
        break
      case LayerType.ArcGISMapImage:
        children = await this.arcGISQueryFeature({
          layerIndex,
          serverUrl: url,
          ...queryOptions
        })
        break
      case LayerType.IGSScene:
        children = await this.igsQuery3DFeature(
          {
            gdbp: layerGdbp,
            ...queryOptions
          },
          layerId
        )
        break
      default:
        break
    }
    return children
  }

  /**
   * 异步加载数据
   * @param {object}
   */
  loadDataMethod({ dataRef }) {
    return new Promise(resolve => {
      if (!dataRef || dataRef.children) {
        resolve()
        return
      }
      this.queryFeatures(dataRef)
        .then(children => {
          dataRef.children = children
          this.treeData = [...this.treeData]
          resolve()
        })
        .catch(e => {
          this.$message.error(e || '请求错误')
          resolve([])
        })
    })
  }

  /**
   *  节点加载
   *  @param {array}
   * @param {object}
   */
  onTreeLoad(loadedKeys, { node: { dataRef } }) {
    this.loadedNodeData.push(dataRef)
    this.loadedNodeDataChildren = [
      ...this.loadedNodeDataChildren,
      ...(dataRef.children || [])
    ]
    this.$emit('on-loaded', loadedKeys, this.loadedNodeDataChildren)
  }

  /**
   * 节点选中
   * @param selectedKeys
   * @param treeNode
   */
  onTreeSelect(selectedKeys, { selectedNodes, checkedNodes, node }) {
    this.selectedKeys = selectedKeys
    const vnodes = this.multiple ? checkedNodes : selectedNodes
    // 选中节点数据
    const data = node.dataRef
    // 选中节点的数据集合
    const selectedData = vnodes.length
      ? vnodes.map(({ data }) => data.props.dataRef)
      : []
    this.$root.$emit('clear-query-selection', this.vueKey)
    this.$emit('on-select', selectedKeys, selectedData, data)
  }

  /**
   * 清除节点选中和已加载的节点的children集合
   */
  onClearTreeSelect(vueKey) {
    if (this.vueKey !== vueKey) {
      this.selectedKeys = []
    }
  }

  /**
   * 刷新
   */
  onRefresh() {
    this.loading = true
    this.selectedKeys = []
    this.loadedNodeDataChildren = []
    Promise.all(this.loadedNodeData.map(dataRef => this.queryFeatures(dataRef)))
      .then((childrenArr = []) => {
        const loadedKeys = []
        const loadedNodeDataChildren = childrenArr.flat()
        this.loadedNodeData.forEach((dataRef, i) => {
          loadedKeys.push(dataRef.key)
          dataRef.children = childrenArr[i] || []
        })
        this.$emit('on-loaded', loadedKeys, loadedNodeDataChildren)
        this.loadedNodeDataChildren = loadedNodeDataChildren
        this.treeData = [...this.treeData]
        this.loading = false
      })
      .catch(e => {
        this.loading = false
        this.$message.error(e || '请求错误')
      })
  }

  created() {
    this.getTreeData()
    this.$root.$on('clear-query-selection', this.onClearTreeSelect)
  }

  beforeDestroy() {
    this.$root.$off('clear-query-selection', this.onClearTreeSelect)
  }
}
</script>
<style scoped lang="less">
.mp-query-result-tree {
  padding: 4px 8px;
  overflow: auto;
  .hoverScrollbar();
  .ant-tree > li:first-child {
    padding-top: 0;
  }
  .ant-tree > li:last-child {
    padding-bottom: 10px;
  }
}
</style>
