<template>
  <div class="mapgis-server">
    <a-tree-select
      v-model="value"
      style="width: 100%"
      :tree-data="treeData"
      :replace-fields="replaceFields"
      :dropdownStyle="{
        'max-height': '200px',
        overflow: 'auto'
      }"
      @change="onSelectTreeChange"
    >
    </a-tree-select>
  </div>
</template>

<script lang="ts">
import {
  Component,
  Vue,
  Prop,
  Watch,
  Emit,
  Mixins
} from 'vue-property-decorator'
import { eventBus } from '@mapgis/pan-spatial-map-store'
import { Catalog } from '@mapgis/web-app-framework'
import SelectTreeMixin from '../../mixins/select-tree.ts'

/**
 * MapGIS地图服务选择组件
 * @vue-prop        {String}    ip              服务器地址
 * @vue-prop        {String}    port            服务器端口
 * @vue-prop        {String}    type            服务类型
 * @vue-data        {Array}     treeData        树节点数据
 */
@Component({
  name: 'MapgisServer',
  components: {}
})
export default class MapgisServer extends Mixins(SelectTreeMixin) {
  @Prop(String) readonly type!: string

  // 构造选择树的根节点数据
  @Watch('ip', { deep: true })
  @Watch('port', { deep: true })
  @Watch('type', { deep: true })
  init() {
    const { ip, port, type } = this
    if (!ip || !port || !type) {
      return
    }
    if (type === 'doc') {
      Catalog.DocumentCatalog.getDocs({ ip, port })
        .then(res => {
          this.treeData = this.parseDocs(res)
        })
        .catch(() => {})
    } else if (type === 'tile') {
      Catalog.DocumentCatalog.getTiles({ ip, port })
        .then(res => {
          this.treeData = this.parseTiles(res)
        })
        .catch(() => {})
    }
  }

  created() {
    this.init()
  }

  // 解析文档列表
  private parseDocs(params) {
    let data: any[] = []
    if (Array.isArray(params)) {
      data = params.reduce((result, item) => {
        result.push({
          id: item,
          name: item,
          value: item,
          canSelect: true,
          type: 'doc'
        })
        return result
      }, [])
    } else {
      const { DOCNames, DirDOCs } = params
      if (DOCNames) {
        const arr = DOCNames.reduce((result, item) => {
          result.push({
            id: item,
            name: item,
            value: item,
            canSelect: true,
            type: 'doc'
          })
          return result
        }, [])
        data = data.concat(arr)
      }
      if (DirDOCs) {
        const arr = DirDOCs.reduce((result, item) => {
          const { DirName: dirName, DOCNames: docNames } = item
          result.push({
            id: dirName,
            name: dirName,
            value: dirName,
            canSelect: true,
            children: docNames.map(item2 => ({
              id: item2,
              name: item2,
              value: item2,
              canSelect: true,
              type: 'doc'
            }))
          })
          return result
        }, [])
        data = data.concat(arr)
      }
    }

    return data
  }

  // 解析瓦片列表
  private parseTiles(params) {
    let data: any[] = []
    if (Array.isArray(params)) {
      data = params.reduce((result, item) => {
        result.push({
          id: item,
          name: item,
          value: item,
          canSelect: true,
          type: 'tile'
        })
        return result
      }, [])
    } else {
      const { HDFNames, DirHDFs } = params
      if (HDFNames) {
        const arr = HDFNames.reduce((result, item) => {
          result.push({
            id: item,
            name: item,
            value: item,
            canSelect: true,
            type: 'tile'
          })
          return result
        }, [])
        data = data.concat(arr)
      }
      if (DirHDFs) {
        const arr = DirHDFs.reduce((result, item) => {
          const { DirName: dirName, HDFNames: tileNames } = item
          result.push({
            id: dirName,
            name: dirName,
            value: dirName,
            canSelect: true,
            children: tileNames.map(item2 => ({
              id: item2,
              name: item2,
              value: item2,
              canSelect: true,
              type: 'tile'
            }))
          })
          return result
        }, [])
        data = data.concat(arr)
      }
    }
    return data
  }

  // 选中树节点时调用此函数
  private onSelectTreeChange(value, label, extra) {
    const node = extra.triggerNode.dataRef

    // 若节点没有children，说明选择的是末级叶子节点，可以添加该节点对应的服务
    if (!node.children) {
      this.$emit('serverName', node.name)
      eventBus.$emit('emitSelectNode', true)
    } else {
      eventBus.$emit('emitSelectNode', false)
    }
  }
}
</script>

<style lang="scss" scoped>
.mapgis-server {
  margin-left: 16px;
  flex-grow: 1;
}
</style>
