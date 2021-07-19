<template>
  <div class="mp-widget-thematic-map">
    <!-- 专题图树 -->
    <a-spin :spinning="loading">
      <a-empty v-if="!thematicMapTree.length" />
      <a-tree
        v-else
        @check="onTreeCheck"
        :show-line="true"
        :tree-data="thematicMapTree"
        :checkedKeys="checkedThematicMapKeys"
        :replace-fields="{ key: 'id' }"
        checkable
      >
        <span slot="custom" slot-scope="node" class="tree-node">
          <a-dropdown :trigger="['contextmenu']">
            <span>{{ node.title }}</span>
            <a-menu slot="overlay" @click="onTreeNodeMenuClick($event, node)">
              <!-- <a-menu-item v-show="!node.checkable" :key="handleKeys.create"
                >新建</a-menu-item
              > -->
              <!-- <a-menu-item v-show="node.checkable" :key="handleKeys.edit"
                >编辑</a-menu-item
              > -->
              <a-menu-item :key="handleKeys.remove">删除</a-menu-item>
            </a-menu>
          </a-dropdown>
        </span>
      </a-tree>
    </a-spin>
    <div v-show="checkedThematicMapNodes.length">
      <!-- 5类专题图图层 -->
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
      'setSelectedSubjectList',
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

  // 节点处理操作
  handleKeys = HandleKeys

  // 默认打开的功能模块
  defaultOpenModules: Array<ModuleType> = ['at', 'st', 'tl']

  // 选中的专题图树节点
  checkedThematicMapNodes: Array<ThematicMapSubjectConfigNode> = []

  // 专题图树
  thematicMapTree: Array<ThematicMapSubjectConfigNode> = []

  // type == 'subject'的节点
  subjectNode: NewSubjectConfig = {}

  get checkedThematicMapKeys() {
    return this.checkedThematicMapNodes.map(({ id }) => id)
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
  setModulesShow(type: ModuleType) {
    if (type) {
      this.setVisible(type)
    } else {
      this.defaultOpenModules.forEach(v => this.setVisible(v))
    }
  }

  /**
   * 设置面板隐藏
   * @param type
   * 若有参数则关闭除参数以外的面板
   * 若无参数则隐藏所有默认配置的面板
   */
  setModulesHide(type: ModuleType) {
    this.resetLinkage()
    this.defaultOpenModules.forEach(t => t !== type && this.resetVisible(t))
  }

  /**
   * 格式化专题图树
   * @param tree
   */
  normalizeThematicMapTree(tree: Array<ThematicMapSubjectConfigNode>) {
    return tree.map(node => {
      this.$set(node, 'checkable', node.nodeType === 'subject')
      this.$set(node, 'scopedSlots', { title: 'custom' })
      if (node.children && node.children.length) {
        this.normalizeThematicMapTree(node.children)
      }
      return node
    })
  }

  /**
   * 设置树数据
   * @param tree
   */
  setThematicMapTree(tree: Array<ThematicMapSubjectConfigNode>) {
    this.thematicMapTree = this.normalizeThematicMapTree(_cloneDeep(tree))
    this.setLoadingHide()
  }

  /**
   * todo 创建节点
   */
  onTreeNodeCreate(nodeData: ThematicMapSubjectConfigNode) {
    this.setModulesShow('sa')
  }

  /**
   * todo 编辑节点, 需要兼容新旧配置
   */
  onTreeNodeEdit(nodeData: ThematicMapSubjectConfigNode) {
    if (nodeData.parentId) {
      // 新的专题配置
      this.subjectNode = nodeData
    } else {
      // 旧配置
    }
    this.setModulesShow('sa')
  }

  /**
   * 移除节点
   */
  onTreeNodeRemove(nodeData: ThematicMapSubjectConfigNode) {
    this.setSelectedSubjectList(
      this.checkedThematicMapNodes.filter(s => s.id !== nodeData.id)
    )
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
   * 专题图树选中
   */
  onTreeCheck(checkedKeys, { checkedNodes, node, event }) {
    this.checkedThematicMapNodes = checkedNodes.map(
      ({ data }) => data.props.dataRef
    )
    this.setSelectedSubjectList(this.checkedThematicMapNodes)
    if (!this.checkedThematicMapNodes.length) {
      this.setModulesHide('mt')
    } else {
      this.setModulesShow()
    }
  }

  /**
   * 专题图面板打开
   */
  onOpen() {
    this.setLoadingShow()
    const { baseConfig, subjectConfig } = this.widgetInfo.config
    if (this.subjectConfig) {
      this.setThematicMapTree(this.subjectConfig)
    } else {
      this.setSubjectConfig(subjectConfig)
    }
    this.setBaseConfig(baseConfig)
    this.setModulesShow('mt')
  }

  /**
   * 专题图面板关闭
   */
  onClose() {
    this.checkedThematicMapNodes = []
    this.setSelectedSubjectList([])
    this.setModulesHide()
  }

  @Watch('subjectConfig', { deep: true })
  subjectConfigChanged(nV) {
    this.setLoadingShow()
    this.setThematicMapTree(nV)
  }
}
</script>
<style lang="less" scoped>
.tree-node-context-menue {
  box-shadow: 0 2px 8px rgb(0 0 0 / 15%);
}
</style>
