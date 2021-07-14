<template>
  <div class="source-target">
    <mp-row-flex label="服务地址" label-align="right" :span="[6, 18]">
      <a-input
        @change="urlChange"
        :value="url"
        auto-size
        placeholder="请按示例输入地址"
      >
        <a-tooltip slot="suffix" title="数据选择">
          <a-icon type="plus-circle" @click="drawerShow" />
        </a-tooltip>
      </a-input>
    </mp-row-flex>
    <mp-row-flex
      v-for="{ label, content } in examples"
      :key="label"
      :label="label"
      :span="[6, 18]"
      align="top"
      label-align="right"
      class="example"
    >
      {{ content }}
    </mp-row-flex>
    <a-drawer
      @close="drawerClose"
      title="数据选择"
      placement="right"
      wrapClassName="source-target-drawer"
      :mask-closable="false"
      :visible="drawerVisible"
    >
      <a-spin :spinning="loading">
        <mp-row-flex label="服务选择" :span="[24, 24]">
          <a-tree-select
            @change="serverTypeChange"
            :value="serverType"
            :tree-data="serverTypeTree"
            :replaceFields="{
              title: 'name',
              value: 'guid'
            }"
            placeholder="请选择"
            class="drawer-select"
          />
        </mp-row-flex>
        <mp-row-flex label="图层选择" :span="[24, 24]" v-show="layerVisible">
          <a-select
            @change="layerChange"
            :value="layer"
            :options="layerList"
            placeholder="请选择"
            class="drawer-select"
          />
        </mp-row-flex>
      </a-spin>
      <div class="drawer-footer">
        <a-button @click="drawerClose">
          取消
        </a-button>
        <a-button type="primary" @click="drawerSave">
          保存
        </a-button>
      </div>
    </a-drawer>
  </div>
</template>
<script lang="ts">
import { Vue, Component, Prop } from 'vue-property-decorator'
import {
  WidgetMixin,
  Layer,
  LayerType,
  Catalog,
  UrlUtil
} from '@mapgis/web-app-framework'
import { dataCatalogManagerInstance, api } from '@mapgis/pan-spatial-map-store'
import url from 'url'
import _cloneDeep from 'lodash/cloneDeep'
import _last from 'lodash/last'

interface IServerBase {
  ip: string
  port: string
}

interface IIGSMapImage {
  docName: string
  layerIndex: string
  layerName: string
}

interface IIGSVector {
  gdbp: string
}

interface IServerObj {
  type: 'doc' | 'gdbp'
  data: IServerBase & (IIGSMapImage | IIGSVector)
}

@Component
export default class SourceTarget extends Vue {
  // 数据地址
  url = ''

  // 加载
  loading = false

  // 数据选择弹框
  drawerVisible = false

  // 服务节点
  serverNode = null

  // 服务选择
  serverType = ''

  // 服务树
  serverTypeTree = []

  // 图层选择
  layerVisible = false

  // 图层
  layer = ''

  // 图层树
  layerList = []

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
        'http://<server>:<port>/igs/rest/mrms/{docName}?layerName={layerName}&layerIdxs={layerIdxs}'
    }
  ]

  /**
   * 派发事件
   */
  emitServerParams(params) {
    if (!params) {
      this.$message.warn('请按照示例输入正确的数据服务地址')
    } else {
      this.$emit('change', params)
    }
  }

  /**
   * 是否gdbp和doc类型图层
   * IGSMapImage地图文档(5)
   * IGSVector矢量(6)
   */
  isServerType({ serverType }) {
    return (
      serverType &&
      [LayerType.IGSMapImage, LayerType.IGSVector].includes(serverType)
    )
  }

  /**
   * 处理目录树， 筛选出IGSVector和IGSMapImage数据
   */
  handleDataCatalog(tree: any[]) {
    if (!tree.length) {
      return []
    }
    for (let i = 0; i < tree.length; i++) {
      const node = tree[i]
      if (node.children && node.children.length > 0) {
        this.$set(node, 'selectable', false)
        this.handleDataCatalog(node.children)
      }
      if (node.children && node.children.length === 0) {
        node.children = null
      }
      if (!this.isServerType(node) && !node.children) {
        tree.splice(i, 1)
        i--
      }
    }
    return tree
  }

  /**
   * 关闭数据服务选择弹框
   */
  drawerClose() {
    this.drawerVisible = false
    // this.layerVisible = false
    // this.url = ''
    // this.layer = ''
    // this.serverType = ''
    // this.serverNode = null
  }

  /**
   * 展示数据服务选择弹框
   * todo 筛选出serverType为IGSMapImage和IGSVector2种
   */
  drawerShow() {
    this.drawerVisible = true
    this.loading = true
    dataCatalogManagerInstance
      .getDataCatalogTreeData()
      .then(result => {
        this.serverTypeTree = this.handleDataCatalog(_cloneDeep(result))
        this.loading = false
      })
      .catch(() => {
        this.loading = false
      })
  }

  /**
   * 保存数据服务选择
   */
  drawerSave() {
    const { ip, port, gdbp, gdbps } = this.serverNode
    const _gdbp = gdbp || gdbps
    this.emitServerParams({
      ip,
      port,
      gdbp: _gdbp
    })
    this.url = `http://${ip}:${port}/igs/rest/mrms/layers/?gdbp=${_gdbp}`
    this.drawerVisible = false
  }

  /**
   * 服务选择变化
   * 如果是IGSVector直接拿gdbp组装url, 如果是IGSMapImage,需要获取它的子图层
   */
  async serverTypeChange(value, label, extra) {
    const {
      dataRef,
      dataRef: { ip, port, serverName }
    } = extra.triggerNode
    this.serverType = value
    this.serverNode = dataRef
    if (dataRef.serverType === LayerType.IGSMapImage) {
      const docInfo = await Catalog.DocumentCatalog.getDocInfo({
        ip,
        port,
        serverName
      })
      if (docInfo && docInfo.MapInfos.length) {
        const { CatalogLayer } = docInfo.MapInfos[0]
        const layerIndex = Catalog.DocumentCatalog.getLayerIndexesByNamesOrCodes(
          CatalogLayer
        )
        const layers = Catalog.DocumentCatalog.getLayersByIndexes(
          layerIndex.join(','),
          CatalogLayer
        )
        this.layerList = layers.map(({ LayerName, LayerIndex, URL }) => ({
          ip,
          port,
          gdbp: URL,
          label: LayerName,
          value: LayerIndex
        }))
        this.layerVisible = true
      }
    }
  }

  /**
   * 图层选择变化
   * IGSMapImage子图层选中后拿其gdbp组装url
   */
  layerChange(value, option) {
    this.layer = value
    this.serverNode = { ...option.data.props }
  }

  /**
   * 地址输入框变化
   */
  urlChange(e) {
    this.url = e.target.value
    if (!/^(https|http)?:\/\//.test(this.url)) {
      this.$message.warn('请按照示例输入正确的数据服务地址')
      return
    }
    const {
      hostname: ip,
      port,
      pathname,
      query: { gdbp, layerName, layerIdxs }
    } = url.parse(this.url, true)
    let params
    if (gdbp) {
      params = { gdbp }
    } else if (layerName) {
      const docName = _last(pathname.split('/'))
      params = {
        docName,
        layerName,
        layerIndex: layerIdxs
      }
    }
    this.emitServerParams({ ip, port, ...params })
  }

  created() {}
}
</script>
<style lang="less" scoped>
.source-target {
  margin-bottom: 8px;
  .example {
    word-break: break-all;
    white-space: normal;
    font-size: 12px;
    color: @text-color-secondary;
    margin-bottom: 4px !important;
  }
}

.source-target-drawer {
  /deep/ .ant-row-flex {
    margin-bottom: 12px;
    .row-flex-col-left {
      margin-bottom: 4px;
    }
  }
  .drawer-footer {
    width: 100%;
    text-align: center;
    position: absolute;
    bottom: 20px;
    left: 0;
    padding-top: 12px;
    border-top: 1px solid @border-color-base;
    button:first-of-type {
      margin-right: 8px;
    }
  }

  .drawer-select {
    width: 100%;
  }
}
</style>
