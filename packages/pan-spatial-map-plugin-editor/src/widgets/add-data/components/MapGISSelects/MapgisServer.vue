<template>
  <div class="mapgis-server">
    <a-tree-select
      v-model="value"
      style="width: 100%"
      :tree-data="treeData"
      :replace-fields="replaceFields"
      :dropdownStyle="{
        'max-height': '200px',
        overflow: 'auto',
        left: '196px',
        top: '404px',
        'min-width': '566px'
      }"
      @change="onSelectTreeChange"
    >
    </a-tree-select>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Prop, Watch, Emit } from 'vue-property-decorator'
import { queryIgsServicesInfoInstance } from '@mapgis/pan-spatial-map-store'

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
export default class MapgisServer extends Vue {
  @Prop(String) readonly ip!: string

  @Prop(String) readonly port!: string

  @Prop(String) readonly type!: string

  // 当前选中的条目
  private value: any = ''

  // 选择树数据
  private treeData: Record<string, any>[] = []

  // 替换treeNode中的title、key字段为treeData中对应的字段
  private replaceFields: object = {
    title: 'name',
    key: 'id'
  }

  @Watch('ip', { deep: true })
  @Watch('port', { deep: true })
  @Watch('type', { deep: true })
  init() {
    const { ip, port, type } = this
    if (!ip || !port || !type) {
      return
    }
    if (type === 'doc') {
      queryIgsServicesInfoInstance
        .getDocs({ ip, port })
        .then(res => {
          console.log(res)

          this.treeData = this.parseDocs(res)
        })
        .catch(() => {})
    } else if (type === 'tile') {
      queryIgsServicesInfoInstance
        .getTiles({ ip, port })
        .then(res => {
          console.log(res)

          this.treeData = this.parseTiles(res)
        })
        .catch(() => {})
    }
  }

  created() {
    this.init()
  }

  // 解析文档列表
  parseDocs(params) {
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
  parseTiles(params) {
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
    console.log(data)

    return data
  }

  // 获取选中的叶子节点
  getLeafNode(id, treeData) {
    let leaf: any = null
    for (let i = 0; i < treeData.length; i++) {
      const data = treeData[i]
      if (data.id === id) {
        if (!data.children) {
          leaf = data
          return leaf
        }
      } else {
        if (data.children) {
          leaf = this.getLeafNode(id, data.children)
          if (leaf) {
            return leaf
          }
        }
      }
    }
  }

  // 选中树节点时调用此函数
  onSelectTreeChange(value, label, extra) {
    console.log(extra)
    const node = extra.triggerNode.dataRef
    const leafNode = this.getLeafNode(node.id, this.treeData)

    if (!leafNode) {
      return false
    } else {
      debugger
      this.$emit('serverName', node.name)
    }
  }
}
</script>

<style lang="scss" scoped>
.mapgis-server {
  margin-left: 15px;
  flex-grow: 1;
}
</style>
