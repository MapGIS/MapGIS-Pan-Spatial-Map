<template>
  <div class="mp-widget-data-catalog">
    <div class="toolbar">
      <a-input-search
        v-model="searchValue"
        placeholder="搜索数据"
        allow-clear
        enterButton
        @search="onSearch"
      ></a-input-search>
      <a-dropdown :trigger="['click']" class="action-more">
        <a-icon type="more"></a-icon>
        <a-menu slot="overlay">
          <a-menu-item key="0" @click="refreshTree">刷新</a-menu-item>
          <a-menu-item key="1" @click="bookMarksCheck">收藏</a-menu-item>
        </a-menu>
      </a-dropdown>
    </div>
    <div class="tree-container beauty-scroll">
      <a-tree
        checkable
        block-node
        :tree-data="dataCatalogTreeData"
        :replace-fields="replaceFields"
        v-model="checkedNodeKeys"
        :expanded-keys="expandedKeys"
        :filterTreeNode="searchValue !== '' ? filterTree : filterEmpty"
        :selectedKeys="selectedKeys"
        @expand="onExpand"
      >
        <span slot="custom" slot-scope="item" class="tree-item-handle">
          <img
            v-if="widgetInfo.config.iconConfig[nodeLevel(item)]"
            :src="baseUrl + widgetInfo.config.iconConfig[nodeLevel(item)]"
            class="tree-item-icon"
          />
          <span
            v-if="item.children && item.children.length > 0"
            class="tree-node"
            :id="`tree_${item.guid}`"
          >
            <span
              v-if="
                searchValue !== '' &&
                  item.name.toUpperCase().indexOf(searchValue.toUpperCase()) !==
                    -1
              "
            >
              <span class="unfilter-words" :title="item.description">
                {{
                  item.name.substr(
                    0,
                    item.name.toUpperCase().indexOf(searchValue.toUpperCase())
                  )
                }}
              </span>
              <span class="filter-words" :title="item.description">
                {{
                  item.name.substr(
                    item.name.toUpperCase().indexOf(searchValue.toUpperCase()),
                    searchValue.length
                  )
                }}
              </span>
              <span class="unfilter-words" :title="item.description">
                {{
                  item.name.substr(
                    item.name.toUpperCase().indexOf(searchValue.toUpperCase()) +
                      searchValue.length
                  )
                }}
              </span>
            </span>
            <span v-else :title="item.description">{{ item.name }}</span>
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
            :id="`tree_${item.guid}`"
          >
            <span
              v-if="
                searchValue !== '' &&
                  item.name.toUpperCase().indexOf(searchValue.toUpperCase()) !==
                    -1
              "
            >
              <span class="unfilter-words" :title="item.description">
                {{
                  item.name.substr(
                    0,
                    item.name.toUpperCase().indexOf(searchValue.toUpperCase())
                  )
                }}
              </span>
              <span class="filter-words" :title="item.description">
                {{
                  item.name.substr(
                    item.name.toUpperCase().indexOf(searchValue.toUpperCase()),
                    searchValue.length
                  )
                }}
              </span>
              <span class="unfilter-words" :title="item.description">
                {{
                  item.name.substr(
                    item.name.toUpperCase().indexOf(searchValue.toUpperCase()) +
                      searchValue.length
                  )
                }}
              </span>
            </span>
            <span v-else @click="onClick(item)" :title="item.description">{{
              item.name
            }}</span>
            <a-menu slot="overlay">
              <a-menu-item key="1" @click="showMetaDataInfo(item)">
                元数据信息
              </a-menu-item>
              <a-menu-item key="2" @click="addToMark(item)">收藏</a-menu-item>
              <a-menu-item
                v-if="hasLegend(item)"
                key="3"
                @click="onUploadLegend(item)"
              >
                上传图例
              </a-menu-item>
            </a-menu>
          </a-dropdown>
        </span>
      </a-tree>
    </div>
    <a-modal
      v-model="showUploader"
      :dialog-style="{ top: '150px' }"
      :width="300"
      :mask="false"
      title="上传图例"
      :footer="null"
    >
      <a-alert
        message="建议上传宽高比为1:1的图片"
        type="info"
        show-icon
        style="margin-bottom: 16px"
      />
      <a-upload
        name="file"
        accept=".jpg, image/*"
        :action="uploadUrl"
        :multiple="false"
        method="post"
        :withCredentials="true"
        :before-upload="beforeUpload"
        @change="onChangeFile"
      >
        <a-button>
          <a-icon type="upload" :style="{ fontSize: '18px' }" />
          上传图片
        </a-button>
      </a-upload>
    </a-modal>

    <mp-window-wrapper :visible="showMetaData">
      <mp-window
        title="元数据信息"
        :is-full-screen="true"
        :shrinkAction="false"
        :fullScreenAction="false"
        :icon="widgetInfo.icon"
        :visible.sync="showMetaData"
      >
        <template>
          <mp-metadata-info :currentConfig="currentConfig" />
        </template>
      </mp-window>
    </mp-window-wrapper>

    <mp-window-wrapper :visible="showNoSpatial">
      <mp-window
        title="非空间数据"
        :is-full-screen="true"
        :shrinkAction="false"
        :fullScreenAction="false"
        :icon="widgetInfo.icon"
        :visible.sync="showNoSpatial"
      >
        <template>
          <NonSpatial
            :url="nonSpatialUrl"
            :type="nonSpatialType"
            :treeConfig="widgetConfig"
          ></NonSpatial>
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
  LayerType,
  LoadStatus,
  Metadata
} from '@mapgis/web-app-framework'
import {
  dataCatalogManagerInstance,
  DataCatalogManager,
  eventBus,
  events,
  api
} from '@mapgis/pan-spatial-map-store'
import { fitBoundByLayer } from '../../util/fit-bound'

import MpMetadataInfo from '../../components/MetadataInfo/MetadataInfo.vue'
import NonSpatial from './non-spatial.vue'

@Component({
  name: 'MpDataCatalog',
  components: {
    MpMetadataInfo,
    NonSpatial
  }
})
export default class MpDataCatalog extends Mixins(WidgetMixin) {
  // 搜索框输入值
  private searchValue: any = ''

  // 记录上一次搜索值
  private lastSearchVal = ''

  // 包含搜索关键字的树节点key组成的数组
  private hasKeywordArr = []

  // 高亮搜索节点的下标
  private searchIndex = -1

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

  // 图片上传器的显隐
  private showUploader = false

  // 上传地址
  private uploadUrl = ''

  // 上传图例的节点
  private legendNode = {}

  // 非空间数据窗口的显隐
  private showNoSpatial = false

  // 非空间数据资源url
  private nonSpatialUrl = ''

  // 非空间数据类型(文档数据、图片数据、...)
  private nonSpatialType = ''

  // 目录树配置
  private widgetConfig = {}

  private imposeNode = {}

  // 设置选中的树节点
  get selectedKeys() {
    if (this.hasKeywordArr.length > 0 && this.searchIndex !== -1) {
      return [this.hasKeywordArr[this.searchIndex]]
    }
    return []
  }

  get nodeLevel() {
    return function(node) {
      return node.pos.split('-').length - 1
    }
  }

  created() {
    this.$message.config({
      top: '100px',
      duration: 2,
      maxCount: 1
    })

    this.widgetConfig = this.widgetInfo.config
  }

  async mounted() {
    this.uploadUrl = `${this.baseUrl}/api/local-storage/pictures`

    this.dataCatalogManager.init(this.widgetInfo.config)
    this.dataCatalogTreeData = await this.dataCatalogManager.getDataCatalogTreeData()
    this.dataCatalogTreeData = this.handleTreeData(this.dataCatalogTreeData)

    eventBus.$on(events.OPEN_DATA_BOOKMARK_EVENT, this.bookMarkClick)
    eventBus.$on('emitImposeService', this.imposeService)
  }

  @Watch('checkedNodeKeys', { deep: false })
  onCheckedNodeKeysChenged() {
    let newChecked = []
    let newUnChecked = []
    eventBus.$emit(
      events.DATA_SELECTION_KEYS_CHANGE_EVENT,
      this.checkedNodeKeys
    )

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
      const doc: Document = this.document
      layerConfigNodeList.forEach(
        async (layerConfigNode): Layer => {
          if (isChecked) {
            // 如果是选中了节点
            // 1.根据图层节点的配置,生成webclient-store中定义的图层.
            const layer = DataCatalogManager.generateLayerByConfig(
              layerConfigNode
            )
            // 2.将图层添加到全局的document中。
            if (layer) {
              if (layer.loadStatus === LoadStatus.notLoaded) {
                await layer.load()
              }

              doc.defaultMap.add(layer)
            }
          } else {
            // 如果是取消选中了节点
            // 1.通过节点的key,将图层从document中移除。
            doc.defaultMap.remove(
              doc.defaultMap.findLayerById(layerConfigNode.guid)
            )
          }
          eventBus.$emit(events.DATA_SELECTION_CHANGE_EVENT)
        }
      )
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

  // 点击搜索或按下回车键时的回调
  onSearch(value) {
    this.expandedKeys = []
    const keyword: string = value
    if (keyword !== '') {
      this.hasKeyWord(this.dataCatalogTreeData, keyword)
      this.hasKeywordArr = JSON.parse(JSON.stringify(this.expandedKeys))
      this.getAllKeys(this.dataCatalogTreeData)
    }
    if (this.lastSearchVal === value) {
      if (!this.timer) {
        this.setSearchIndex()
      }
    } else {
      this.searchIndex = -1
      this.timer = setTimeout(_ => {
        this.setSearchIndex()
      }, 700)
    }
    this.lastSearchVal = value
  }

  // 跳转到包含搜索关键字的节点处
  setSearchIndex() {
    if (this.hasKeywordArr.length > 0) {
      if (this.searchIndex >= this.hasKeywordArr.length - 1) {
        this.searchIndex = 0
      } else {
        this.searchIndex++
      }
      const element = this.$el.querySelector(
        `#tree_${this.hasKeywordArr[this.searchIndex]}`
      )
      if (element) {
        element.scrollIntoView()
      }
      this.timer = null
    }
  }

  // 刷新按钮
  async refreshTree() {
    const config = await api.getWidgetConfig('data-catalog')
    this.dataCatalogManager.init(config)
    this.dataCatalogTreeData = await this.dataCatalogManager.getDataCatalogTreeData()
    this.dataCatalogTreeData = this.handleTreeData(this.dataCatalogTreeData)
  }

  // 收藏按钮
  bookMarksCheck() {
    eventBus.$emit(
      events.ADD_ALL_SELECTED_DATA_BOOKMARK_EVENT,
      this.widgetInfo.label,
      this.checkedNodeKeys,
      this.dataCatalogTreeData
    )
  }

  onClick(item) {
    const widgetConfig = this.widgetInfo.config
    this.nonSpatialType = item.data

    if (item.description.includes('非空间数据')) {
      this.showNoSpatial = true

      if (
        widgetConfig.treeConfig.useLocalData ||
        widgetConfig.treeConfig.useLocalParam
      ) {
        this.nonSpatialUrl = `${this.baseUrl}/api/non-spatial/files?pageNumber=0&pageSize=1000&path=${item.data}&protocol=ftp&url=ftp://192.168.21.191:21`
      }
    }
  }

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
        getCapabilitiesURL = Metadata.OGCMetadataQuery.generateWMSGetCapabilitiesURL(
          url
        )
      } else if (item.serverType === LayerType.OGCWMTS) {
        getCapabilitiesURL = Metadata.OGCMetadataQuery.generateWMTSGetCapabilitiesURL(
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
      events.ADD_DATA_BOOKMARK_EVENT,
      { params: item, type: this.widgetInfo.label },
      this.dataCatalogTreeData
    )
  }

  // 监听书签项点击事件
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

  // 点击上传图例响应事件
  private onUploadLegend(item) {
    this.showUploader = true
    this.legendNode = item
  }

  // 上传文件之前的钩子
  private beforeUpload(file) {
    const isLt2M = file.size / 1024 / 1024 < 2
    if (!isLt2M) {
      this.$message.error('上传图片大小需小于2M')
    }
    return isLt2M
  }

  // 上传文件状态改变时的回调
  private async onChangeFile(info) {
    if (info.file.status === 'uploading' || info.file.status === 'error') {
      return
    }
    if (info.file.status === 'done') {
      const url = info.file.response.url
      const legendConfig = await api.getWidgetConfig('legend')
      const key = this.legendNode.name
      if (url) {
        legendConfig[key] = url
        const res = await api.saveWidgetConfig({
          name: 'legend',
          config: JSON.stringify(legendConfig)
        })
        eventBus.$emit(events.UPLOAD_LEGEND_SUCCESS_EVENT)
        this.showUploader = false
      }
    }
  }

  // 监听服务叠加事件
  imposeService(params) {
    this.imposeNode = {}
    const node = this.getServiceNode(
      params.name,
      params.type,
      this.dataCatalogTreeData
    )
    const { Cesium, map, webGlobe, CesiumZondy } = this

    if (Object.keys(node).length > 0) {
      if (this.dataCatalogManager.checkedLayerConfigIDs.includes(node.guid)) {
        return false
      } else {
        eventBus.$on(events.DATA_SELECTION_CHANGE_EVENT, () => {
          eventBus.$off(events.DATA_SELECTION_CHANGE_EVENT)
          const doc: Document = this.document

          if (doc.defaultMap && doc.defaultMap.allLayers.length > 0) {
            const imposeLayer =
              doc.defaultMap.allLayers[doc.defaultMap.allLayers.length - 1]
            console.log(imposeLayer)

            if (imposeLayer.type !== LayerType.IGSScene) {
              fitBoundByLayer(imposeLayer, {
                Cesium,
                map,
                webGlobe,
                CesiumZondy
              })
            } else {
              this.switchMapMode()
            }
          }
        })
        this.dataCatalogManager.checkedLayerConfigIDs.push(node.guid)
      }
    } else {
      return false
    }
  }

  // 获取该叠加服务对应的节点
  private getServiceNode(name, type, tree) {
    tree.forEach(item => {
      if (item.name === name && item.serverType === +type) {
        this.imposeNode = item
      } else {
        if (item.children && item.children.length > 0) {
          this.getServiceNode(name, type, item.children)
        }
      }
    })

    return this.imposeNode
  }
}
</script>

<style lang="less" scoped>
.mp-widget-data-catalog {
  height: 100%;
  display: flex;
  flex-direction: column;
  .toolbar {
    display: flex;
    justify-content: center;
    align-content: center;
    .action-more {
      font-size: 17px;
      color: @text-color;
      padding-left: 12px;
      &:hover {
        color: @primary-color;
      }
    }
  }
  .tree-container {
    flex-grow: 1;
    overflow-y: auto;
    overflow-x: hidden;
    .tree-item-handle {
      display: flex;
      width: 100%;
      overflow: hidden;
      align-items: center;
      .tree-item-icon {
        width: 1em;
        height: 1em;
        vertical-align: -0.125em;
        margin-right: 5px;
      }
      > span {
        flex: 1;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
    }
  }
}

.ant-dropdown-trigger.anticon-more {
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

.filter-dropdown {
  flex-direction: row;
}

.unfilter-words {
  color: @text-color !important;
}
.filter-words {
  color: @primary-color !important;
}
</style>
