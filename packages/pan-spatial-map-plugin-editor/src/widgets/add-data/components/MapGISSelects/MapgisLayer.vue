<template>
  <div class="mapgis-layer">
    <a-tree-select
      v-model="value"
      style="width: 100%"
      :tree-data="treeData"
      :treeDefaultExpandAll="defaultExpandAll"
      :replace-fields="replaceFields"
      :load-data="handleLazyLoad"
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
import { Catalog, UUID } from '@mapgis/web-app-framework'
import SelectTreeMixin from '../../mixins/select-tree.ts'

const MapGISLocal = 'MapGISLocal'
const MapGISLocalPlus = 'MapGISLocalPlus'

/**
 * MapGIS图层选择组件
 * @vue-prop        {String}    ip              服务器地址
 * @vue-prop        {String}    port            服务器端口
 * @vue-data        {Array}     treeData        树节点数据
 * @vue-event       {String}    update:gdbp     更新gdbp地址
 */
@Component({
  name: 'MapgisLayer',
  components: {}
})
export default class MapgisLayer extends Mixins(SelectTreeMixin) {
  private defaultExpandAll = false

  // 构造选择树的根节点数据
  @Watch('ip', { deep: true })
  @Watch('port', { deep: true })
  init() {
    const { ip, port } = this
    if (!ip || !port) {
      return
    }
    this.treeData = []
    Catalog.DataSourceCatalog.getDataSource({ ip, port })
      .then(res => {
        this.treeData = res.reduce((result, item) => {
          result.push({
            id: UUID.uuid(),
            value: UUID.uuid(),
            name: item,
            lazy: true,
            level: 1,
            children: []
          })
          return result
        }, [])
      })
      .catch(err => {
        console.error(err)
      })
  }

  created() {
    this.init()
  }

  // 懒加载树节点数据
  private handleLazyLoad(node) {
    return new Promise(resolve => {
      const { level, name } = node.dataRef
      switch (level) {
        case 1:
          // 展开数据源
          if (name === MapGISLocal || name === MapGISLocalPlus) {
            // 本地数据源
            this.resolveDataBase(this.ip, this.port, name).then(res => {
              if (res && res.length > 0) {
                const arr = [...res]
                arr.map(a => {
                  a.id = UUID.uuid()
                  a.level = 2
                  a.value = UUID.uuid()
                  if (a.children && a.children.length > 0) {
                    a.children.map(c => {
                      c.id = UUID.uuid()
                      c.level = 3
                      c.lazy = true
                      c.value = UUID.uuid()
                      return c
                    })
                  }
                  return a
                })
                node.dataRef.children = arr
                this.treeData = [...this.treeData]
                resolve()
              }
            })
          } else {
          }
          break
        case 3:
          const { gdbp, key, user, password } = node.dataRef
          // 展开简单要素类等节点
          Catalog.DataSourceCatalog.getGDBData({
            ip: this.ip,
            port: this.port,
            gdbp: gdbp,
            type: key,
            user: user,
            password: password
          }).then(res => {
            const arr: any[] = []
            switch (key) {
              case 'ds':
                for (const { Name: dsName, SFClsInfos } of res) {
                  const children: any[] = []
                  const obj = {
                    id: UUID.uuid(),
                    value: UUID.uuid(),
                    name: dsName,
                    icon: 'tree-icon tree-icon-ds',
                    children: [
                      {
                        id: UUID.uuid(),
                        value: UUID.uuid(),
                        name: '简单要素类',
                        icon: 'tree-icon tree-icon-ds',
                        children: []
                      },
                      {
                        id: UUID.uuid(),
                        value: UUID.uuid(),
                        name: '注记类',
                        icon: 'tree-icon tree-icon-ds',
                        children: []
                      }
                    ]
                  }
                  for (const { Name: clsName, GeomType, Type } of SFClsInfos) {
                    const info = {
                      id: UUID.uuid(),
                      value: UUID.uuid(),
                      name: clsName,
                      icon: `tree-icon tree-icon-${GeomType}`,
                      leaf: true,
                      gdbp: `gdbp://${gdbp}/${key}/${dsName}/sfcls/${clsName}`
                    }
                    switch (Type) {
                      case 30:
                        obj.children[0].children.push(info)
                        break

                      default:
                        obj.children[1].children.push(info)
                        break
                    }
                  }
                  arr.push(obj)
                }
                break
              case 'acls':
                for (const clsName of res) {
                  arr.push({
                    id: UUID.uuid(),
                    value: UUID.uuid(),
                    name: clsName,
                    icon: 'tree-icon tree-icon-acls',
                    leaf: true,
                    gdbp: `gdbp://${gdbp}/${key}/${clsName}`
                  })
                }
                break
              default:
                for (const { Name: clsName, GeomType } of res) {
                  arr.push({
                    id: UUID.uuid(),
                    value: UUID.uuid(),
                    name: clsName,
                    icon: `tree-icon tree-icon-${GeomType}`,
                    leaf: true,
                    gdbp: `gdbp://${gdbp}/sfcls/${clsName}`
                  })
                }
                break
            }
            node.dataRef.children = arr
            this.treeData = [...this.treeData]
            resolve()
          })
          break
        default:
          break
      }
      resolve()
    })
  }

  // 获取数据库节点
  private resolveDataBase(ip, port, dataSource, user = '', password = '') {
    return new Promise((resolve, reject) => {
      Catalog.DataSourceCatalog.getDataBase({
        ip,
        port,
        dataSource,
        user,
        password
      })
        .then(res => {
          const arr: any[] = []
          for (const item of res) {
            const gdbp = `${dataSource}/${item}`
            const types = [
              ['要素数据集', 'ds'],
              ['简单要素类', 'sfcls_new'],
              ['注记类', 'acls'],
              ['对象类', 'ocls'],
              ['栅格目录', 'rcat'],
              ['栅格数据集', 'ras']
            ]
            arr.push({
              name: item,
              children: types.map(
                ([
                  name,
                  key,
                  icon = 'tree-icon tree-icon-ds',
                  children = []
                ]) => ({
                  name,
                  key,
                  icon,
                  children,
                  gdbp,
                  user,
                  password
                })
              ),
              icon: 'tree-icon tree-icon-gdb'
            })
          }
          resolve(arr)
        })
        .catch(err => {
          reject(err)
        })
    })
  }

  // 选中树节点时调用此函数
  private onSelectTreeChange(value, label, extra) {
    const node = extra.triggerNode.dataRef

    // 若节点没有children，说明选择的是末级叶子节点，可以添加该节点对应的服务
    if (!node.children) {
      this.$emit('igsLayerInfo', { gdbp: node.gdbp, name: node.name })
      eventBus.$emit('emitSelectNode', true)
    } else {
      eventBus.$emit('emitSelectNode', false)
    }
  }
}
</script>

<style lang="scss" scoped>
.mapgis-layer {
  margin-left: 16px;
  flex-grow: 1;
}
</style>
