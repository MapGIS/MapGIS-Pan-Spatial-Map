<template>
  <div class="mp-widget-data-catalog">
    <div class="toolbal">
      <a-input placeholder="搜索数据" allow-clear @change="onChange"></a-input>
      <a-dropdown :trigger="['click']">
        <a-icon type="more" :style="{ fontSize: '24px' }"></a-icon>
        <a-menu slot="overlay">
          <a-menu-item key="0" @click="refreshTree">刷新</a-menu-item>
          <a-menu-item key="1" @click="bookMarksCheck">收藏</a-menu-item>
        </a-menu>
      </a-dropdown>
    </div>
    <a-tree
      checkable
      v-model="checkedNodeKeys"
      :tree-data="dataCatalogTreeData"
      :replace-fields="replaceFields"
    >
      <template v-slot:custom="item" class="tree-item-handle">
        <div
          v-if="item.children && item.children.length > 0"
          @click="onClick(item)"
          class="tree-node"
        >
          {{ item.name }}
        </div>
        <a-dropdown v-else :trigger="['contextmenu']">
          <div @click="onClick(item)">{{ item.name }}</div>
          <a-menu slot="overlay">
            <a-menu-item key="1" @click="showMetaDataInfo(item)"
              >元数据信息</a-menu-item
            >
            <a-menu-item key="2" @click="addToMark(item)">收藏</a-menu-item>
            <a-menu-item v-if="hasLegend(item)" key="3">上传图例</a-menu-item>
          </a-menu>
        </a-dropdown>
      </template>
    </a-tree>
    <mp-window-wrapper :visible="showMetaData">
      <mp-window
        title="元数据信息"
        :width="550"
        :height="400"
        :icon="widgetInfo.icon"
        :visible.sync="showMetaData"
      >
        <template>
          <mp-metadata-info :currentConfig="currentConfig" />
        </template>
      </mp-window>
    </mp-window-wrapper>
  </div>
</template>

<script lang="ts">
import { Mixins, Component, Watch } from 'vue-property-decorator'
import {
  WidgetMixin,
  Document,
  Map,
  LayerType
} from '@mapgis/web-app-framework'
import MpMetadataInfo from '../../components/MetadataInfo/MetadataInfo.vue'

import {
  dataCatalogManagerInstance,
  eventBus,
  DataCatalogManager,
  queryOGCInfoInstance
} from '@mapgis/pan-spatial-map-store'

@Component({
  name: 'MpDataCatalog',
  components: {
    MpMetadataInfo
  }
})
export default class MpDataCatalog extends Mixins(WidgetMixin) {
  // 数据目录树树据
  private dataCatalogTreeData: [] = []

  private originData: object[] = []

  // 上次选中的节点列表
  private preCheckedNodes: [] = []

  // 目录树中选中的节点的id列表。
  private checkedNodeKeys: string[] = []

  private dataCatalogManager = dataCatalogManagerInstance

  // 替换treeNode中的title、key字段为treeData中对应的字段
  private replaceFields: object = {
    title: 'name',
    key: 'guid'
  }

  private widgetInfo: any

  private document: any

  private showMetaData = false

  private currentConfig: Record<string, unknown> = {}

  private nodeParentLevel: number[] = []

  async mounted() {
    this.dataCatalogManager.init(this.widgetInfo.config)
    const data = await this.dataCatalogManager.getDataCatalogTreeData()
    this.dataCatalogTreeData = this.handleTreeData(data)
    console.log(this.dataCatalogTreeData)
    console.log(this.dataCatalogManager)

    this.originData = this.dataCatalogTreeData

    eventBus.$on('click-bookmark-item', this.bookMarkClick)
  }

  handleTreeData(data: object[]) {
    const this_ = this
    return data.map((item: any) => {
      this_.$set(item, 'scopedSlots', { title: 'custom' })
      if (item.children) {
        this_.handleTreeData(item.children)
      }
      return item
    })
  }

  onClick(item) {
    console.log(item)
  }

  @Watch('checkedNodeKeys', { deep: false })
  onCheckedNodeKeysChenged() {
    let newChecked = []
    let newUnChecked = []

    console.log(this.checkedNodeKeys)

    if (this.preCheckedNodes.length === 0) {
      newChecked = this.checkedNodeKeys
    } else if (this.checkedNodeKeys.length === 0) {
      newUnChecked = this.preCheckedNodes
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

    console.log('this is dataCatalogManager.checkedLayerConfigIDs')

    console.log(this.dataCatalogManager.checkedLayerConfigIDs)

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
    console.log('this is checkedLayerConfigIDs')

    console.log(checkedLayerConfigIDs)

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

  private formatData(tree: object[], keyword: string) {
    let data: object[] = []
    tree.forEach((item: any, index: number) => {
      if (item.name.indexOf(keyword) !== -1) {
        data = this.structData(data, item, keyword)
      } else {
        if (item.children) {
          const arr: object[] = this.formatData(item.children, keyword)
          if (arr.length > 0) {
            data = this.structData(data, item, keyword)
          }
        }
      }
    })
    return data
  }

  private structData(data: object[], item: any, keyword: string) {
    data.push({
      ...item,
      children: item.children ? this.formatData(item.children, keyword) : []
    })
    return data
  }

  onChange(e: any) {
    const data: object[] = this.originData
    const keyword: string = e.target.value
    if (keyword !== '') {
      this.dataCatalogTreeData = this.formatData(data, keyword)
    } else if (keyword === '') {
      this.dataCatalogTreeData = this.originData
    }
  }

  async refreshTree() {
    this.dataCatalogTreeData = await this.dataCatalogManager.getDataCatalogTreeData()
  }

  // 是否显示上传图例
  hasLegend(node) {
    this.nodeParentLevel = node.pos
      .split('-')
      .slice(1)
      .map(item => +item)
    const LabelArr = []
    this.getNodeLabel(this.dataCatalogTreeData, 0, LabelArr)
    if (LabelArr.some(item => item.indexOf('专题') !== -1)) {
      return true
    } else {
      return false
    }
  }

  // 串联该节点所在层级的description
  getNodeLabel(node, index, labelArr) {
    labelArr.push(node[this.nodeParentLevel[index]].description)
    if (
      node[this.nodeParentLevel[index]].children &&
      node[this.nodeParentLevel[index]].children.length > 0
    ) {
      index++
      this.getNodeLabel(
        node[this.nodeParentLevel[index - 1]].children,
        index,
        labelArr
      )
    }
  }

  // 判断是否是OGC图层
  isOGCLayer(type) {
    return type === LayerType.OGCWMS || type === LayerType.OGCWMTS
  }

  // 元数据信息按钮响应事件
  showMetaDataInfo(item) {
    if (this.isOGCLayer(item.serverType)) {
      console.log('这是OGC图层')
      this.showMetaData = false
      const url = item.serverURL
      let getCapabilitiesURL = ''
      if (item.serverType === LayerType.OGCWMS) {
        getCapabilitiesURL = queryOGCInfoInstance.generateWMSGetCapabilitiesURL(
          url
        )
      } else if (item.serverType === LayerType.OGCWMTS) {
        getCapabilitiesURL = queryOGCInfoInstance.generateWMTSGetCapabilitiesURL(
          url
        )
      }
      window.open(getCapabilitiesURL)
    } else {
      const layer = {
        ip: item.ip,
        port: item.port,
        gdbps: item.gdbps,
        serverName: item.serverName,
        type: item.serverType
      }

      console.log('查看元数据信息')
      console.log(layer)

      this.showMetaData = true
      this.currentConfig = layer
    }
  }

  // 右键菜单收藏按钮响应事件
  addToMark(item) {
    console.log('收藏')
    console.log(item)
    eventBus.$emit(
      'add-to-mark',
      { params: item, type: '基础数据' },
      this.dataCatalogTreeData
    )
  }

  // 收藏按钮
  bookMarksCheck() {
    console.log('勾选收藏')

    eventBus.$emit(
      'check-to-mark',
      this.checkedNodeKeys,
      this.dataCatalogTreeData
    )
  }

  // 监听书签项点击事件('click-bookmark-item')
  bookMarkClick(node) {
    // debugger
    if (this.dataCatalogManager.checkedLayerConfigIDs.includes(node.guid)) {
      const index = this.dataCatalogManager.checkedLayerConfigIDs.findIndex(
        item => item === node.guid
      )
      this.dataCatalogManager.checkedLayerConfigIDs.splice(index, 1)
    } else {
      this.dataCatalogManager.checkedLayerConfigIDs.push(node.guid)
    }
  }
}
</script>

<style lang="less" scoped>
.mp-widget-data-catalog {
  position: relative;
  padding: 26px 16px;
}
.toolbal {
  display: flex;
  justify-content: center;
  align-content: center;
}
.ant-dropdown-trigger {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-content: center;
  cursor: pointer;
}
.ant-input-affix-wrapper {
  width: 320px;
  height: 36px;
  padding: 0 12px;

  ::v-deep .ant-input {
    height: 100%;
    border-radius: 0;
    padding: 6px 12px;
  }

  ::v-deep .ant-input-suffix {
    svg {
      width: 20px;
      height: 20px;
      cursor: pointer;
      outline: 0 !important;
      border: 0;
      color: inherit;
      background: transparent;
      padding: 0;
      margin-right: 12px;
    }
  }
}
</style>
