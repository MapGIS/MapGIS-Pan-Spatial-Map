<template>
  <div class="mp-widget-data-catalog">
    <a-tree
      checkable
      :tree-data="dataCatalogTreeData"
      :replace-fields="replaceFields"
      v-model="checkedNodeKeys"
    />
  </div>
</template>

<script lang="ts">
import { Mixins, Component, Watch } from 'vue-property-decorator'
import { WidgetMixin, Document, Map } from '@mapgis/web-app-framework'
import {
  dataCatalogManagerInstance,
  DataCatalogManager
} from '@mapgis/pan-spatial-map-store'

@Component({ name: 'MpDataCatalog' })
export default class MpDataCatalog extends Mixins(WidgetMixin) {
  // 数据目录树树据
  private dataCatalogTreeData: [] = []

  // 替换treeNode中的title、key字段为treeData中对应的字段
  private replaceFields: object = {
    title: 'name',
    key: 'guid'
  }

  // 目录树中选中的节点的id列表。
  private checkedNodeKeys: string[] = []

  // 目录树中上次选中的节点的id列表
  private preCheckedNodeKeys: [] = []

  private dataCatalogManager = dataCatalogManagerInstance

  async mounted() {
    this.dataCatalogManager.init(this.widgetInfo.config)

    this.dataCatalogTreeData = await this.dataCatalogManager.getDataCatalogTreeData()
  }

  @Watch('checkedNodeKeys', { deep: false })
  onCheckedNodeKeysChenged() {
    let newChecked = []
    let newUnChecked = []

    if (this.preCheckedNodeKeys.length === 0) {
      newChecked = this.checkedNodeKeys
    } else if (this.checkedNodeKeys.length === 0) {
      newUnChecked = this.preCheckedNodeKeys
    } else {
      // 计算哪些是新选中的,哪些时新取消选中的。

      // 查找新选中的(在之前的选中中没有,在当前的选中中有)
      for (let i = 0; i < this.checkedNodeKeys.length; i++) {
        let isFind = false
        for (let j = 0; j < this.preCheckedNodeKeys.length; j++) {
          if (this.checkedNodeKeys[i] === this.preCheckedNodeKeys[j]) {
            isFind = true
            break
          }
        }

        if (!isFind) {
          newChecked.push(this.checkedNodeKeys[i])
        }
      }

      // 查找新取消选中的(在之前的选中中有,在当前的选中中没有)
      for (let i = 0; i < this.preCheckedNodeKeys.length; i++) {
        let isFind = false
        for (let j = 0; j < this.checkedNodeKeys.length; j++) {
          if (this.preCheckedNodeKeys[i] === this.checkedNodeKeys[j]) {
            isFind = true
            break
          }
        }

        if (!isFind) {
          newUnChecked.push(this.preCheckedNodeKeys[i])
        }
      }
    }

    // 将新取消选中的图层从document中移除
    this.modifyDocument(newUnChecked, false)

    // 将新选中的图层节点添加到document
    this.modifyDocument(newChecked, true)

    // 给dataCatalogManager中的变量赋值
    const checkedLayerConfigIDs = this.getCheckedLayerConfigIDs()

    // 如果两者不相等则重新赋值
    if (
      this.dataCatalogManager.checkedLayerConfigIDs.toString() !==
      checkedLayerConfigIDs.toString()
    ) {
      this.dataCatalogManager.checkedLayerConfigIDs = checkedLayerConfigIDs
    }

    //
    this.preCheckedNodeKeys = this.checkedNodeKeys
  }

  @Watch('dataCatalogManager.checkedLayerConfigIDs')
  onCheckedLayerConfigIDsChanged() {
    // 如果两者不相等则重新赋值
    if (
      this.dataCatalogManager.checkedLayerConfigIDs.toString() !==
      this.getCheckedLayerConfigIDs().toString()
    ) {
      this.checkedNodeKeys = this.dataCatalogManager.checkedLayerConfigIDs
    }
  }

  private getCheckedLayerConfigIDs(): string[] {
    const checkedLayerConfigIDs = []
    this.checkedNodeKeys.forEach(key => {
      const layerConfig = this.dataCatalogManager.getLayerConfigByID(key)

      if (layerConfig) checkedLayerConfigIDs.push(key)
    })

    return checkedLayerConfigIDs
  }

  private modifyDocument(nodekeys: [], isChecked: boolean) {
    // 获取选中节点中的图层节点。
    const layerConfigNodeList: [] = []
    nodekeys.forEach(key => {
      const layerConfig = this.dataCatalogManager.getLayerConfigByID(key)

      if (layerConfig) {
        layerConfigNodeList.push(layerConfig)
      }
    })

    if (layerConfigNodeList.length > 0) {
      // 选中节点中保含有图层节点
      const doc: Document = this.document.clone()

      layerConfigNodeList.forEach(layerConfigNode => {
        if (isChecked) {
          // 如果是选中了节点
          // 1.根据图层节点的配置,生成webclient-store中定义的图层.
          const layer = DataCatalogManager.generateLayerByConfig(
            layerConfigNode
          )
          // 2.将图层添加到全局的document中。
          doc.defaultMap.add(layer)
        } else {
          // 如果是取消选中了节点
          // 1.通过节点的key,将图层从document中移除。
          doc.defaultMap.remove(
            doc.defaultMap.findLayerById(layerConfigNode.guid)
          )
        }
      })

      this.document = doc
    }
  }
}
</script>

<style lang="less" scoped></style>
