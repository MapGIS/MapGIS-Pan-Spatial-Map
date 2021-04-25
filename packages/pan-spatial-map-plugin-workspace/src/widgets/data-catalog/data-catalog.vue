<template>
  <div class="mp-widget-data-catalog">
    <div class="toolbal">
      <a-input
        v-model="searchValue"
        placeholder="搜索数据"
        allow-clear
        @change="onChange"
      ></a-input>
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
      :tree-data="dataCatalogTreeData"
      :replace-fields="replaceFields"
      v-model="checkedNodeKeys"
      :expanded-keys="expandedKeys"
      :filterTreeNode="searchValue !== '' ? filterTree : filterEmpty"
      @expand="onExpand"
    >
      <template v-slot:custom="item" class="tree-item-handle">
        <span
          v-if="item.children && item.children.length > 0"
          @click="onClick(item)"
          class="tree-node"
        >
          <span
            v-if="
              searchValue !== '' &&
                item.name.toUpperCase().indexOf(searchValue.toUpperCase()) !==
                  -1
            "
          >
            <span class="unfilter-words"
              >{{
                item.name.substr(
                  0,
                  item.name.toUpperCase().indexOf(searchValue.toUpperCase())
                )
              }}
            </span>
            <span class="filter-words">{{
              item.name.substr(
                item.name.toUpperCase().indexOf(searchValue.toUpperCase()),
                searchValue.length
              )
            }}</span>
            <span class="unfilter-words">{{
              item.name.substr(
                item.name.toUpperCase().indexOf(searchValue.toUpperCase()) +
                  searchValue.length
              )
            }}</span>
          </span>
          <span v-else>{{ item.name }}</span>
        </span>
        <a-dropdown
          v-else
          :trigger="['contextmenu']"
          :class="
            searchValue !== '' &&
            item.name.toUpperCase().indexOf(searchValue.toUpperCase()) !== -1
              ? 'filter-dropdown'
              : ''
          "
        >
          <span
            v-if="
              searchValue !== '' &&
                item.name.toUpperCase().indexOf(searchValue.toUpperCase()) !==
                  -1
            "
          >
            <span class="unfilter-words"
              >{{
                item.name.substr(
                  0,
                  item.name.toUpperCase().indexOf(searchValue.toUpperCase())
                )
              }}
            </span>
            <span class="filter-words">{{
              item.name.substr(
                item.name.toUpperCase().indexOf(searchValue.toUpperCase()),
                searchValue.length
              )
            }}</span>
            <span class="unfilter-words">{{
              item.name.substr(
                item.name.toUpperCase().indexOf(searchValue.toUpperCase()) +
                  searchValue.length
              )
            }}</span>
          </span>
          <span v-else @click="onClick(item)">{{ item.name }}</span>
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
import {
  dataCatalogManagerInstance,
  DataCatalogManager,
  eventBus,
  queryOGCInfoInstance,
  getWidgetConfig
} from '@mapgis/pan-spatial-map-store'

import MpMetadataInfo from '../../components/MetadataInfo/MetadataInfo.vue'

@Component({
  name: 'MpDataCatalog',
  components: {
    MpMetadataInfo
  }
})
export default class MpDataCatalog extends Mixins(WidgetMixin) {
  // 搜索框输入值
  private searchValue: any = ''

  // 展开的树节点
  private expandedKeys: string[] = []

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

  // 是否显示元数据信息窗口
  private showMetaData = false

  // 元数据信息组件Props值
  private currentConfig: Record<string, unknown> = {}

  async mounted() {
    this.dataCatalogManager.init(this.widgetInfo.config)

    this.dataCatalogTreeData = await this.dataCatalogManager.getDataCatalogTreeData()
    this.dataCatalogTreeData = this.handleTreeData(this.dataCatalogTreeData)
    eventBus.$on('click-bookmark-item', this.bookMarkClick)
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

    // 修改说明：原有代码赋址属于浅拷贝，指向同一内存地址，checkedNodeKeys变化时preCheckedNodeKeys也会变化，这样preCheckedNodeKeys就无法记录上一次勾选的checkedNodeKeys。
    // 修改人：何龙 2021年04月21日
    this.preCheckedNodeKeys = JSON.parse(JSON.stringify(this.checkedNodeKeys))
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
          if (layer) doc.defaultMap.add(layer)
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

  // 按需筛选树节点高亮显示（搜索内容不为空时筛选条件）
  filterTree(node) {
    return (
      node.dataRef.name
        .toUpperCase()
        .indexOf(this.searchValue.toUpperCase()) !== -1
    )
  }

  // 按需筛选树节点（搜索内容为空时筛选条件）
  filterEmpty() {}

  // 目录树展开/收起节点时触发
  onExpand(expandedKeys) {
    this.expandedKeys = expandedKeys
  }

  // 筛选所有包含搜索关键字的节点
  hasKeyWord(tree: object[], keyword: string) {
    const data = []
    tree.forEach((item: any, index: number) => {
      if (item.name.toUpperCase().indexOf(keyword.toUpperCase()) !== -1) {
        this.expandedKeys.push(item.guid)
      }
      if (item.children && item.children.length > 0) {
        this.hasKeyWord(item.children, keyword)
      }
    })
  }

  // 获取所有包含关键字节点的父节点
  getAllKeys(tree: object[]) {
    const data: string[] = []
    for (let i = 0; i < tree.length; i++) {
      const node = tree[i]
      if (node.children) {
        const arr = this.getAllKeys(node.children)
        if (
          node.children.some(
            item => this.expandedKeys.includes(item.guid) === true
          ) ||
          arr.length > 0
        ) {
          this.expandedKeys.push(node.guid)
          data.push(node.guid)
        }
      }
    }
    return data
  }

  // 搜索框内容变化时的回调
  onChange(e: any) {
    this.expandedKeys = []
    const keyword: string = e.target.value
    if (keyword !== '') {
      this.hasKeyWord(this.dataCatalogTreeData, keyword)
      this.getAllKeys(this.dataCatalogTreeData)
    }
  }

  // 刷新按钮
  async refreshTree() {
    getWidgetConfig('data-catalog')
    this.dataCatalogManager.init(this.widgetInfo.config)
    this.dataCatalogTreeData = await this.dataCatalogManager.getDataCatalogTreeData()
  }

  // 收藏按钮
  bookMarksCheck() {
    eventBus.$emit(
      'check-to-mark',
      this.checkedNodeKeys,
      this.dataCatalogTreeData
    )
  }

  onClick(item) {}

  // 对目录树数据进行处理
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

  // 是否显示上传图例
  hasLegend(node) {
    const nodeParentLevel = node.pos
      .split('-')
      .slice(1)
      .map(item => +item)
    const LabelArr = []
    this.getNodeLabel(this.dataCatalogTreeData, 0, LabelArr, nodeParentLevel)
    if (LabelArr.some(item => item.indexOf('专题') !== -1)) {
      return true
    } else {
      return false
    }
  }

  // 串联该节点所在层级的description
  getNodeLabel(node, index, labelArr, nodeParentLevel) {
    labelArr.push(node[nodeParentLevel[index]].description)
    if (
      node[nodeParentLevel[index]].children &&
      node[nodeParentLevel[index]].children.length > 0
    ) {
      index++
      this.getNodeLabel(
        node[nodeParentLevel[index - 1]].children,
        index,
        labelArr,
        nodeParentLevel
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
      this.showMetaData = true
      this.currentConfig = layer
    }
  }

  // 右键菜单收藏按钮响应事件
  addToMark(item) {
    eventBus.$emit(
      'add-to-mark',
      { params: item, type: '基础数据' },
      this.dataCatalogTreeData
    )
  }

  // 监听书签项点击事件('click-bookmark-item')
  bookMarkClick(node) {
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

::v-deep.ant-tree-title {
  display: flex;
}

.filter-dropdown {
  flex-direction: row;
}

.unfilter-words {
  color: #000000a6 !important;
}
.filter-words {
  color: @primary-color !important;
}
</style>
