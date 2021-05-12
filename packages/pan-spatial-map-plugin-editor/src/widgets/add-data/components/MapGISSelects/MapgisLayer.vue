<template>
  <div class="mapgis-layer">
    <a-tree-select
      v-model="value"
      style="width: 100%"
      :tree-data="treeData"
      :treeDefaultExpandAll="defaultExpandAll"
      :replace-fields="replaceFields"
      search-placeholder="Please select"
      :load-data="handleLazyLoad"
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
import { uuid } from '@mapgis/webclient-store/src/utils/uuid'

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
export default class MapgisLayer extends Vue {
  @Prop(String) readonly ip!: string

  @Prop(String) readonly port!: string

  private value: any = ''

  private treeData: Record<string, any>[] = []

  private defaultExpandAll = false

  // 替换treeNode中的title、key字段为treeData中对应的字段
  private replaceFields: object = {
    title: 'name',
    key: 'id'
  }

  created() {
    this.init()
  }

  @Watch('ip', { deep: true })
  @Watch('port', { deep: true })
  init() {
    const { ip, port } = this
    if (!ip || !port) {
      return
    }
    this.treeData = []
    queryIgsServicesInfoInstance
      .getDataSource({ ip, port })
      .then(res => {
        console.log(res)
        this.treeData = res.reduce((result, item) => {
          result.push({
            id: uuid(),
            value: uuid(),
            name: item,
            lazy: true,
            level: 1,
            children: []
          })
          return result
        }, [])
        console.log(this.treeData)
      })
      .catch(err => {
        console.error(err)
      })
  }

  // 懒加载树节点数据
  handleLazyLoad(node) {
    console.log(node)
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
                  a.id = uuid()
                  a.level = 2
                  a.value = uuid()
                  if (a.children && a.children.length > 0) {
                    a.children.map(c => {
                      c.id = uuid()
                      c.level = 3
                      c.lazy = true
                      c.value = uuid()
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
            if (node.dataRef.children && node.dataRef.children.length > 0) {
              resolve()
              break
            }
            const userName = uuid()
            const password = uuid()
            this.$q
              .dialog({
                title: '身份验证',
                style: 'width:fit-content',
                message: `<div><span style="display: inline-block; width: 60px;">用户名</span>
                            <input id="${userName}" style="display: inline-block; width: 120px;"/></div><div style="margin-top:10px">
                            <span style="display: inline-block; width: 60px;">密码</span>
                            <input id="${password}" style="display: inline-block; width: 120px;" type="password"/></div>`,
                html: true,
                ok: {
                  push: true,
                  label: '确定',
                  color: 'title'
                },
                cancel: {
                  push: true,
                  label: '取消',
                  color: 'title'
                }
              })
              .onOk(data => {
                const user = document.getElementById(userName).value
                const pwd = document.getElementById(password).value
                this.resolveDataBase(this.ip, this.port, name, user, pwd)
                  .then(res => {
                    if (res && res.length > 0) {
                      const arr = [...res]
                      arr.map(a => {
                        a.id = uuid()
                        a.level = 2
                        if (a.children && a.children.length > 0) {
                          a.children.map(c => {
                            c.id = uuid()
                            c.level = 3
                            c.lazy = true
                            return c
                          })
                        }
                        return a
                      })
                      resolve()
                      this.defaultExpandAll = true
                      this.showTree = true
                    }
                  })
                  .catch(err => {
                    console.error(err)
                  })
              })
          }
          break
        case 3:
          const { gdbp, key, user, password } = node.dataRef
          // 展开简单要素类等节点
          queryIgsServicesInfoInstance
            .getGDBData({
              ip: this.ip,
              port: this.port,
              gdbp: gdbp,
              type: key,
              user: user,
              password: password
            })
            .then(res => {
              const arr: any[] = []
              switch (key) {
                case 'ds':
                  for (const { Name: dsName, SFClsInfos } of res) {
                    const children: any[] = []
                    const obj = {
                      id: uuid(),
                      value: uuid(),
                      name: dsName,
                      icon: 'tree-icon tree-icon-ds',
                      children: [
                        {
                          id: uuid(),
                          value: uuid(),
                          name: '简单要素类',
                          icon: 'tree-icon tree-icon-ds',
                          children
                        },
                        {
                          id: uuid(),
                          value: uuid(),
                          name: '注记类',
                          icon: 'tree-icon tree-icon-ds',
                          children
                        }
                      ]
                    }
                    for (const {
                      Name: clsName,
                      GeomType,
                      Type
                    } of SFClsInfos) {
                      const info = {
                        id: uuid(),
                        value: uuid(),
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
                          obj.children[0].children.push(info)
                          break
                      }
                    }
                    arr.push(obj)
                  }
                  break
                case 'acls':
                  for (const clsName of res) {
                    arr.push({
                      id: uuid(),
                      value: uuid(),
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
                      id: uuid(),
                      value: uuid(),
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
  resolveDataBase(ip, port, dataSource, user = '', password = '') {
    return new Promise((resolve, reject) => {
      queryIgsServicesInfoInstance
        .getDataBase({ ip, port, dataSource, user, password })
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
      this.$emit('igsLayerInfo', { gdbp: leafNode.gdbp, name: leafNode.name })
    }
  }
}
</script>

<style lang="scss" scoped>
.mapgis-layer {
  margin-left: 15px;
  flex-grow: 1;
}
</style>
