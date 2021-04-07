<template>
  <div class="mp-widget-data-catalog">
    <a-tree
      checkable
      :tree-data="dataCatalogTreeData"
      :replace-fields="replaceFields"
      @check="onCheck"
    />
  </div>
</template>

<script lang="ts">
import { Mixins, Component } from 'vue-property-decorator'
import { WidgetMixin } from '@mapgis/web-app-framework'
import { Document } from '@mapgis/web-app-framework/src/store/layer/Document'
import { Map } from '@mapgis/web-app-framework/src/store/layer/Map'
import {
  dataCatalogManagerInstance,
  DataCatalogManager
} from '@mapgis/pan-spatial-map-store'

@Component({ name: 'MpDataCatalog' })
export default class MpDataCatalog extends Mixins(WidgetMixin) {
  // 数据目录树树据
  private dataCatalogTreeData: [] = []

  // 上次选中的节点列表
  private preCheckedNodes: [] = []

  // 替换treeNode中的title、key字段为treeData中对应的字段
  private replaceFields: object = {
    title: 'name',
    key: 'guid'
  }

  async mounted() {
    dataCatalogManagerInstance.init(this.widgetInfo.config)

    this.dataCatalogTreeData = await dataCatalogManagerInstance.getDataCatalogTreeData()
  }

  onCheck(checkedKeys: string[], info: { checked: boolean; chedkedNodes: [] }) {
    let newChecked = []
    let newUnChecked = []

    if (this.preCheckedNodes.length === 0) {
      newChecked = info.checkedNodes
    } else if (info.checkedNodes.length === 0) {
      newUnChecked = this.preCheckedNodes
    } else {
      // 计算哪些是新选中的,哪些时新取消选中的。

      // 查找新选中的(在之前的选中中没有,在当前的选中中有)
      for (let i = 0; i < info.checkedNodes.length; i++) {
        let isFind = false
        for (let j = 0; j < this.preCheckedNodes.length; j++) {
          if (info.checkedNodes[i].key === this.preCheckedNodes[j].key) {
            isFind = true
            break
          }
        }

        if (!isFind) {
          newChecked.push(info.checkedNodes[i])
        }
      }

      // 查找新取消选中的(在之前的选中中有,在当前的选中中没有)
      for (let i = 0; i < this.preCheckedNodes.length; i++) {
        let isFind = false
        for (let j = 0; j < info.checkedNodes.length; j++) {
          if (this.preCheckedNodes[i].key === info.checkedNodes[j].key) {
            isFind = true
            break
          }
        }

        if (!isFind) {
          newUnChecked.push(this.preCheckedNodes[i])
        }
      }
    }

    // 将新取消选中的图层从document中移除
    this.modifyDocument(newUnChecked, false)

    // 将新选中的图层节点添加到document
    this.modifyDocument(newChecked, true)

    this.preCheckedNodes = info.checkedNodes
  }

  private modifyDocument(nodeList: [], isChecked: boolean) {
    // 获取选中节点中的图层节点。
    const layerConfigNodeList: [] = []
    nodeList.forEach(vnode => {
      const { dataRef } = vnode.data.props

      if (dataCatalogManagerInstance.isLayerNode(dataRef)) {
        layerConfigNodeList.push(dataRef)
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
