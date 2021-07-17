<template>
  <div class="server-tree-select">
    <mp-row-flex label="服务地址" label-align="right" :span="[6, 18]">
      <a-dropdown :visible="dropdownVisible" :trigger="['click']">
        <a-input
          @click.stop
          @change="urlChange"
          :value="url"
          placeholder="请按示例输入地址"
        >
          <a-icon
            slot="suffix"
            type="down"
            class="arrow-icon"
            :class="{ rotate180: dropdownVisible }"
            @click.stop="showDropdown"
          />
        </a-input>
        <a-spin
          :spinning="loading"
          class="server-tree-select-content"
          slot="overlay"
        >
          <a-tree
            @load="catalogTreeLoaded"
            @select="catalogTreeSelected"
            :load-data="catalogTreeLoadData"
            :loaded-keys="loadedKeys"
            :show-line="true"
            :tree-data="catalogTreeData"
            :replace-fields="{
              key: 'guid',
              title: 'name'
            }"
          />
        </a-spin>
      </a-dropdown>
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
  </div>
</template>
<script lang="ts">
import { Vue, Component, Prop } from 'vue-property-decorator'
import { Layer, LayerType, Catalog } from '@mapgis/web-app-framework'
import { dataCatalogManagerInstance } from '@mapgis/pan-spatial-map-store'
import url from 'url'
import _cloneDeep from 'lodash/cloneDeep'
import _last from 'lodash/last'

@Component
export default class ServerTreeSelect extends Vue {
  loading = false

  dropdownVisible = false

  // 数据地址
  url = ''

  // 目录树
  catalogTreeData: Layer[] = []

  // 已加载的树节点
  loadedKeys: string[] = []

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
   * 打开选择器
   */
  showDropdown() {
    this.dropdownVisible = !this.dropdownVisible
  }

  /**
   * 关闭选择器
   */
  hideDropdown() {
    if (this.dropdownVisible) {
      this.dropdownVisible = false
    }
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
   * 处理目录树， 筛选出IGSVector和IGSMapImage数据
   */
  handleCatalog(tree: Layer[]) {
    for (let i = 0; i < tree.length; i++) {
      const node = tree[i]
      if (this.isGdbp(node.serverType)) {
        this.$set(node, 'isLeaf', true)
      }
      if (node.children && node.children.length > 0) {
        this.$set(node, 'selectable', false)
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
  catalogTreeLoadData(treeNode: any) {
    return new Promise(resolve => {
      const {
        dataRef,
        dataRef: { ip, port, serverName, serverType, children }
      } = treeNode

      if (!children && serverType === LayerType.IGSMapImage) {
        const fn = Catalog.DocumentCatalog.getDocInfo({
          ip,
          port,
          serverName
        })
        if (fn && fn.then) {
          fn.then(docInfo => {
            if (docInfo && docInfo.MapInfos.length) {
              const { CatalogLayer } = docInfo.MapInfos[0]
              const layerIndex = Catalog.DocumentCatalog.getLayerIndexesByNamesOrCodes(
                CatalogLayer
              )
              const layers = Catalog.DocumentCatalog.getLayersByIndexes(
                layerIndex.join(','),
                CatalogLayer
              )
              treeNode.dataRef.children = layers.map(
                ({ LayerName, LayerIndex, URL }) => ({
                  ip,
                  port,
                  gdbp: URL,
                  name: LayerName,
                  guid: LayerIndex,
                  isLeaf: true
                })
              )
              this.catalogTreeData = [...this.catalogTreeData]
              resolve()
            }
          })
        }
      } else {
        resolve()
      }
    })
  }

  /**
   * 加载节点
   */
  catalogTreeLoaded(loadedKeys: string[]) {
    this.loadedKeys = loadedKeys
  }

  /**
   * 选择节点
   */
  catalogTreeSelected(selectedKeys: string[], { node }: any) {
    const { ip, port, gdbp, gdbps } = node.dataRef
    const _gdbp = gdbp || gdbps
    if (_gdbp) {
      this.url = `http://${ip}:${port}/igs/rest/mrms/layers/?gdbp=${_gdbp}`
      this.emitChange({
        ip,
        port,
        gdbp: _gdbp
      })
      this.hideDropdown()
    }
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
    let params = { ip, port }
    if (gdbp) {
      params = {
        ...params,
        gdbp
      }
    } else if (layerName) {
      const docName = _last(pathname.split('/'))
      params = {
        ...params,
        docName,
        layerName,
        layerIndex: layerIdxs
      }
    }
    this.emitChange(params)
  }

  /**
   * 派发Change事件
   */
  emitChange(params: any) {
    if (!params) {
      this.$message.warn('请按照示例输入正确的数据服务地址')
    } else {
      this.$emit('change', params)
    }
  }

  created() {
    this.getCatalogTreeData()
  }
}
</script>
<style lang="less" scoped>
.server-tree-select {
  margin-bottom: 8px;
  .example {
    word-break: break-all;
    white-space: normal;
    font-size: 12px;
    color: @text-color-secondary;
    margin-bottom: 4px !important;
  }
  &-content {
    max-height: 320px;
    overflow-y: auto;
    padding: 2px 8px;
    background: @white;
    box-shadow: @box-shadow-base;
  }
}
.arrow-icon {
  color: #c7c7c7;
  font-size: 12px;
  transition: transform 0.3s;
  cursor: pointer;
  &.rotate180 {
    transform: rotate(180deg);
  }
}
</style>
