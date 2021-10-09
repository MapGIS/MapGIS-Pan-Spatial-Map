<template>
  <div class="common">
    <!-- 服务地址设置 -->
    <div class="server-tree-select">
      <mp-row-flex :label-width="76" label-align="right" label="服务地址">
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
          placeholder="请选择或按照示例输入服务地址"
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
    <mp-row-flex :label-width="76" label-align="right" label="统计属性">
      <a-select
        v-model="field"
        :options="fields"
        placeholder="请选择统计属性"
      />
    </mp-row-flex>
  </div>
</template>
<script lang="ts">
import { Vue, Component, Prop } from 'vue-property-decorator'
import { Layer, LayerType, Catalog } from '@mapgis/web-app-framework'
import { dataCatalogManagerInstance } from '@mapgis/pan-spatial-map-common'
import url from 'url'
import _cloneDeep from 'lodash/cloneDeep'
import _last from 'lodash/last'
import FieldInstance from '../../../store/fields'
import { NewSubjectConfig } from '../../../../../store'

interface IServerParams {
  ip: string
  port: string
  gdbp?: string
  docName?: string
  layerName?: string
  layerIndex?: string
}

interface IField {
  type: string
  label: string
  value: string
}

@Component
export default class Common extends Vue {
  @Prop({ default: () => ({}) }) readonly subjectConfig!: NewSubjectConfig

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

  // 服务地址
  get selfUri() {
    const { gdbp, docName, ...others } = this.subjectConfig
    const serverType = docName
      ? LayerType.IGSMapImage
      : gdbp
      ? LayerType.IGSVector
      : null
    return this.getServerUri({
      ...others,
      gdbp,
      docName,
      serverType
    })
  }

  set selfUri(value) {
    this.$emit('change', this.getServerParams(value))
  }

  // 统计属性
  get field() {
    return this.subjectConfig.field || this.fields[0]?.value
  }

  set field(nV) {
    this.$emit('change', {
      ...this.subjectConfig,
      field: nV
    })
  }

  /**
   * 是否gdbp
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
  getServerUri(node: Layer) {
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
        serverUri = ''
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
   * 异步加载目录树节点数据的回调
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
   * 设置查询的属性列表
   */
  setFields(serverParams) {
    if (serverParams) {
      const { ip, port, gdbp, docName, layerIndex } = serverParams

      FieldInstance.fetchFields(serverParams).then(fields => {
        this.fields = fields.map(({ alias, value }) => ({
          label: alias,
          value
        }))
        this.field = this.fields[0]?.value
      })
    }
  }

  /**
   * 服务地址变化
   */
  selfUriChange(value: string) {
    if (!/^(https|http)?:\/\//.test(value)) {
      this.$message.warn('请输入正确的数据服务地址')
      return
    }
    this.setFields(this.getServerParams(value))
    this.selfUri = value
  }

  created() {
    this.getCatalogTreeData()
  }
}
</script>
<style lang="less" scoped>
.common {
  ::v-deep {
    .ant-input,
    .ant-select-selection {
      border-color: transparent;
      &:hover {
        border-color: @primary-color;
      }
    }
  }

  .server-tree-select {
    &-example {
      word-break: break-all;
      white-space: normal;
      font-size: @font-size-sm;
      color: #a7a4a4;
      margin: 4px 0;
    }
    + div {
      margin: 10px 0 12px 0;
    }
  }
}
</style>
