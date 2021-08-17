<template>
  <div class="common">
    <!-- 年度或时间 -->
    <mp-row-flex label="年度/时间" :label-width="76">
      <a-input
        v-model="selfTime"
        :allow-clear="true"
        placeholder="请输入年度/时间"
      />
    </mp-row-flex>
    <!-- 服务设置 -->
    <div class="server-tree-select">
      <mp-row-flex label="服务地址" :label-width="76">
        <mp-tree-select
          @change="selfUriChange"
          :value="selfUri"
          :load-data="catalogTreeLoadData"
          :tree-data="catalogTreeData"
          :loading="loading"
          :replace-fields="{
            key: 'guid',
            title: 'name'
          }"
          filter-prop="serverUri"
          label-prop="serverUri"
        />
      </mp-row-flex>
      <mp-row-flex
        v-for="{ label, content } in examples"
        :key="label"
        :label-width="76"
        class="server-tree-select-example"
      >
        {{ label }}：{{ content }}
      </mp-row-flex>
    </div>
    <!-- 统计属性 -->
    <mp-row-flex label="统计属性" :label-width="76">
      <a-select v-model="field" :options="fields" />
    </mp-row-flex>
  </div>
</template>
<script lang="ts">
import { Vue, Component, Prop } from 'vue-property-decorator'
import { Feature, Layer, LayerType, Catalog } from '@mapgis/web-app-framework'
import {
  dataCatalogManagerInstance,
  baseConfigInstance
} from '@mapgis/pan-spatial-map-store'
import url from 'url'
import _cloneDeep from 'lodash/cloneDeep'
import _debounce from 'lodash/debounce'
import _last from 'lodash/last'

interface IField {
  type: string
  label: string
  value: string
}

@Component
export default class Common extends Vue {
  @Prop({ default: () => ({}) }) readonly subjectConfig!: Record<string, any>

  // 属性列表
  fields: Array<IField> = []

  // 目录树
  catalogTreeData: Layer[] = []

  // 示例
  examples = [
    {
      label: ' 示例1',
      serverType: 'IGSVector',
      content: 'http://<server>:<port>/igs/rest/mrms/layers?gdbp={gdbp}'
    },
    {
      label: '示例2',
      serverType: 'IGSMapImage',
      content:
        'http://<server>:<port>/igs/rest/mrms/docs/{docName}?layerName={layerName}&layerIndex={layerIndex}'
    }
  ]

  // 年度
  get selfTime() {
    return this.subjectConfig.time || ''
  }

  set selfTime(value) {
    this.$emit('time-change', value)
  }

  // 服务地址
  get selfUri() {
    return ''
  }

  set selfUri(value) {
    this.$emit('server-change', this.getServerParams(value))
  }

  // 统计属性
  get field() {
    return this.subjectConfig.field || this.fields[0]?.value || undefined
  }

  set field(nV) {
    this.$emit('field-change', nV)
  }

  /**
   * 是否有gdbp
   */
  isGdbp(serverType) {
    return LayerType.IGSVector === serverType
  }

  /**
   * 是否doc
   */
  isDoc(serverType) {
    return LayerType.IGSMapImage === serverType
  }

  /**
   * IGSMapImage地图文档(5)
   * IGSVector矢量(6)
   */
  isGdbpDoc(serverType: LayerType) {
    return serverType && (this.isGdbp(serverType) || this.isDoc(serverType))
  }

  /**
   * server全地址
   */
  getServerUri(node) {
    const {
      ip,
      port,
      gdbp,
      gdbps,
      serverType,
      layerIndex,
      layerName,
      docName
    } = node
    let serverUri = `http://${ip}:${port}/igs/rest/mrms/`
    switch (serverType) {
      case LayerType.IGSMapImage:
        serverUri += `docs/${docName}?layerName=${layerName}&layerIndex=${layerIndex}`
        break
      case LayerType.IGSVector:
        serverUri += `layers?gdbp=${gdbp || gdbps}`
        break
      default:
        break
    }
    return serverUri
  }

  /**
   * 根据uri获取服务参数
   */
  getServerParams(uri) {
    let params: Record<string, any>
    if (uri) {
      const {
        hostname: ip,
        port,
        pathname,
        query: { gdbp, layerName, layerIndex }
      } = url.parse(uri, true)
      const docName = _last(pathname.split('/'))

      if (gdbp) {
        params = {
          ip,
          port,
          gdbp
        }
      } else if (docName) {
        params = {
          ip,
          port,
          docName,
          layerName,
          layerIndex
        }
      }
    }

    return params
  }

  /**
   * 处理目录树， 筛选出IGSVector和IGSMapImage数据
   */
  handleCatalog(tree: Layer[]) {
    for (let i = 0; i < tree.length; i++) {
      const node = tree[i]
      const isGdbp = this.isGdbp(node.serverType)
      this.$set(node, 'isLeaf', isGdbp)
      this.$set(node, 'selectable', isGdbp)
      this.$set(node, 'serverUri', this.getServerUri(node))
      if (node.children && node.children.length > 0) {
        this.handleCatalog(node.children)
      }
      if (node.children && node.children.length === 0) {
        node.children = null
      }
      if (!this.isGdbpDoc(node.serverType) && !node.children) {
        tree.splice(i, 1)
        i--
      }
    }
    return tree
  }

  /**
   * 获取目录树数据
   */
  getCatalogTreeData() {
    this.loading = true
    dataCatalogManagerInstance
      .getDataCatalogTreeData()
      .then(result => {
        this.catalogTreeData = this.handleCatalog(_cloneDeep(result))
        this.loading = false
      })
      .catch(() => {
        this.loading = false
      })
  }

  /**
   * 异步加载节点数据的回调
   */
  async catalogTreeLoadData(treeNode: any) {
    const {
      dataRef,
      dataRef: { ip, port, serverName, serverType, children }
    } = treeNode
    if (!children && serverType === LayerType.IGSMapImage) {
      const { DocumentCatalog } = Catalog
      const docInfo = await DocumentCatalog.getDocInfo({
        ip,
        port,
        serverName
      })
      if (docInfo && docInfo.MapInfos.length) {
        const { CatalogLayer } = docInfo.MapInfos[0]
        const layerIndex = DocumentCatalog.getLayerIndexesByNamesOrCodes(
          CatalogLayer
        )
        const layers = DocumentCatalog.getLayersByIndexes(
          layerIndex.join(','),
          CatalogLayer
        )
        treeNode.dataRef.children = layers.map(({ LayerName, LayerIndex }) => ({
          name: LayerName,
          guid: LayerIndex,
          isLeaf: true,
          selectable: true,
          serverUri: this.getServerUri({
            ip,
            port,
            serverType,
            docName: serverName,
            layerName: LayerName,
            layerIndex: LayerIndex
          })
        }))
        this.catalogTreeData = [...this.catalogTreeData]
      }
    }
  }

  /**
   * 查询的属性列表
   */
  async getFields(serverParams) {
    let fields = []
    if (serverParams) {
      const { ip: baseIp, port: basePort } = baseConfigInstance.config
      const {
        ip = baseIp,
        port = basePort,
        gdbp,
        docName,
        layerIndex
      } = serverParams
      const result = await Feature.FeatureQuery.query({
        ip,
        port,
        gdbp,
        docName,
        layerIdxs: layerIndex,
        IncludeAttribute: false,
        IncludeGeometry: false,
        IncludeWebGraphic: false,
        f: 'json'
      })

      if (result) {
        const { FldName, FldType, FldAlias } = result.AttStruct
        fields = FldName.map((v: string, i: number) => ({
          type: FldType[i],
          label: FldAlias[i] || v,
          value: FldAlias[i] || v
        }))
      }
    }

    this.fields = fields
    this.field = this.fields[0]?.value
  }

  /**
   * 服务地址变化
   */
  selfUriChange(value: string) {
    if (!/^(https|http)?:\/\//.test(value)) {
      this.$message.warn('请输入正确的数据服务地址')
      return
    }
    this.getFields(this.getServerParams(value))
    this.selfUri = value
  }

  created() {
    this.getCatalogTreeData()
  }
}
</script>
<style lang="less" scoped>
.server-tree-select {
  margin-bottom: 10px;
  ::v-deep .ant-row-flex {
    margin-bottom: 4px;
  }
  &-example {
    word-break: break-all;
    white-space: normal;
    font-size: 12px;
    color: @text-color-secondary;
    margin-bottom: 4px !important;
  }
}
</style>
