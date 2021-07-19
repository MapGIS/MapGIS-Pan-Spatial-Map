<template>
  <div class="mp-widget-thematic-map">
    <!-- 专题服务树 -->
    <a-spin :spinning="loading">
      <a-empty v-if="!thematicMapTree.length" />
      <a-tree
        v-else
        @check="onTreeCheck"
        :show-line="true"
        :tree-data="thematicMapTree"
        :replace-fields="{ key: 'id' }"
        :checkedKeys="checkedKeys"
        checkable
      >
        <span slot="custom" slot-scope="node" class="tree-node">
          <a-dropdown :trigger="['contextmenu']">
            <span>{{ node.title }}</span>
            <a-menu slot="overlay" @click="onTreeNodeMenuClick($event, node)">
              <!-- <a-menu-item v-show="!node.checkable" :key="handleKeys.create"
                >新建</a-menu-item
              > -->
              <a-menu-item v-show="node.checkable" :key="handleKeys.edit"
                >编辑</a-menu-item
              >
              <a-menu-item :key="handleKeys.remove">删除</a-menu-item>
            </a-menu>
          </a-dropdown>
        </span>
      </a-tree>
    </a-spin>
    <div v-show="checkedNodes.length">
      <!-- 5类专题服务图层 -->
      <thematic-map-layers />
      <!-- 属性表 -->
      <thematic-map-attribute-table />
      <!-- 统计表 -->
      <thematic-map-statistic-graph />
      <!-- 时间轴 -->
      <thematic-map-time-line />
      <!-- 工具栏 -->
      <thematic-map-manage-tools />
      <!-- 新建专题图 -->
      <thematic-map-subject-add :subject-node="subjectNode" />
    </div>
  </div>
</template>

<script lang="ts">
import { Mixins, Component, Watch } from 'vue-property-decorator'
import { WidgetMixin } from '@mapgis/web-app-framework'
import _cloneDeep from 'lodash/cloneDeep'
import { mapGetters, mapMutations, ModuleType, NewSubjectConfig } from './store'
import ThematicMapAttributeTable from './components/ThematicMapAttributeTable'
import ThematicMapStatisticGraph from './components/ThematicMapStatisticGraph'
import ThematicMapTimeLine from './components/ThematicMapTimeLine'
import ThematicMapManageTools from './components/ThematicMapManageTools'
import ThematicMapSubjectAdd from './components/ThematicMapSubjectAdd'
import ThematicMapLayers from './components/ThematicMapLayers'

enum HandleKeys {
  create = 'create',
  edit = 'edit',
  remove = 'remove'
}

@Component({
  name: 'MpThematicMap',
  computed: {
    ...mapGetters(['subjectConfig'])
  },
  methods: {
    ...mapMutations([
      'setVisible',
      'setBaseConfig',
      'setSubjectConfig',
      'setSelectedList',
      'resetVisible',
      'resetLinkage',
      'removeSubjectConfigNode'
    ])
  },
  components: {
    ThematicMapAttributeTable,
    ThematicMapStatisticGraph,
    ThematicMapTimeLine,
    ThematicMapManageTools,
    ThematicMapSubjectAdd,
    ThematicMapLayers
  }
})
export default class MpThematicMap extends Mixins<Record<string, any>>(
  WidgetMixin
) {
  loading = false

  handleKeys = HandleKeys

  defaultOpenPanel: Array<ModuleType> = ['at', 'st', 'tl']

  checkedNodes: Array<ThematicMapTreeNode> = []

  thematicMapTree: Array<ThematicMapTreeNode> = []

  subjectNode: NewSubjectConfig = {}

  get checkedKeys() {
    return this.checkedNodes.map(({ id }) => id)
  }

  setLoadingShow() {
    if (!this.loading) {
      this.loading = true
    }
  }

  setLoadingHide() {
    if (this.loading) {
      this.loading = false
    }
  }

  /**
   * 设置面板显示
   * @param type
   * 如果有参数且符合ModuleType,则只打开参数对应的面板
   * 如果没有则打开全部默认配置的打开的面板
   */
  setPanelsShow(type: ModuleType) {
    if (type) {
      this.setVisible(type)
    } else {
      this.defaultOpenPanel.forEach(v => this.setVisible(v))
    }
  }

  /**
   * 设置面板隐藏
   * @param type
   * 若有参数则关闭除参数以外的面板
   * 若无参数则隐藏所有默认配置的面板
   */
  setPanelsHide(type: ModuleType) {
    this.resetLinkage()
    this.defaultOpenPanel.forEach(t => t !== type && this.resetVisible(t))
  }

  /**
   * 格式化专题服务树
   * @param tree
   */
  normalizeTreeData(tree: Array<ThematicMapTreeNode>) {
    return tree.map(node => {
      this.$set(node, 'checkable', node.nodeType === 'subject')
      this.$set(node, 'scopedSlots', { title: 'custom' })
      if (node.children && node.children.length) {
        this.normalizeTreeData(node.children)
      }
      return node
    })
  }

  /**
   * 设置树数据
   * @param tree
   */
  setTreeData(tree: Array<ThematicMapTreeNode>) {
    this.thematicMapTree = this.normalizeTreeData(_cloneDeep(tree))
    this.setLoadingHide()
  }

  /**
   * todo 创建节点
   */
  onTreeNodeCreate(nodeData: ThematicMapTreeNode) {
    this.setPanelsShow('sa')
  }

  /**
   * todo 编辑节点, 需要兼容新旧配置
   */
  onTreeNodeEdit(nodeData: ThematicMapTreeNode) {
    if (nodeData.parentId) {
      // 新的专题配置
      this.subjectNode = nodeData
    } else {
      // 旧配置
    }
    this.setPanelsShow('sa')
  }

  /**
   * 移除节点
   */
  onTreeNodeRemove(nodeData: ThematicMapTreeNode) {
    this.setSelectedList(this.checkedNodes.filter(s => s.id !== nodeData.id))
    this.removeSubjectConfigNode(nodeData)
  }

  /**
   * 节点下拉菜单点击
   * @param key HandleKeys
   * @param dataRef 节点数据
   */
  onTreeNodeMenuClick({ key }, { dataRef }) {
    switch (key) {
      case HandleKeys.create:
        this.onTreeNodeCreate(dataRef)
        break
      case HandleKeys.edit:
        this.onTreeNodeEdit(dataRef)
        break
      case HandleKeys.remove:
        this.onTreeNodeRemove(dataRef)
        break
      default:
        break
    }
  }

  /**
   * 专题服务树选中
   */
  onTreeCheck(checkedKeys, { checkedNodes, node, event }) {
    this.checkedNodes = checkedNodes.map(({ data }) => data.props.dataRef)
    this.setSelectedList(this.checkedNodes)
    if (!this.checkedNodes.length) {
      this.setPanelsHide('mt')
    } else {
      this.setPanelsShow()
    }
  }

  /**
   * 专题服务面板打开
   */
  onOpen() {
    this.setLoadingShow()
    const { baseConfig, subjectConfig } = this.widgetInfo.config
    if (this.subjectConfig) {
      this.setTreeData(this.subjectConfig)
    } else {
      this.setSubjectConfig(subjectConfig)
    }
    this.setBaseConfig(baseConfig)
    this.setPanelsShow('mt')
  }

  /**
   * 专题服务面板关闭
   */
  onClose() {
    this.checkedNodes = []
    this.setSelectedList()
    this.setPanelsHide()
  }

  @Watch('subjectConfig', { deep: true })
  subjectConfigChanged(nV) {
    this.setLoadingShow()
    this.setTreeData(nV)
  }
}
</script>
<style lang="less" scoped>
.tree-node-context-menue {
  box-shadow: 0 2px 8px rgb(0 0 0 / 15%);
}
</style>
