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
</template>

<script lang="ts">
import { Mixins, Component, Watch } from 'vue-property-decorator'
import { WidgetMixin } from '@mapgis/web-app-framework'
import _cloneDeep from 'lodash/cloneDeep'
import {
  mapGetters,
  mapMutations,
  NewSubjectConfig,
  ModuleType,
  moduleTypeList
} from './store'
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
      'updateSubjectConfig',
      'setSelectedSubjectList',
      'resetVisible',
      'resetLinkage'
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
  flag = true

  loading = false

  // 节点处理操作
  handleKeys = HandleKeys

  // 选中的专题图树节点
  checkedThematicMapNodes: Array<ThematicMapSubjectConfigNode> = []

  // 专题图树
  thematicMapTree: Array<ThematicMapSubjectConfigNode> = []

  // 专题节点
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
   * @param type 打开参数对应的面板
   * @param exclude 打开除参数外的面板
   */
  setModulesShow(type: ModuleType, exclude: ModuleType = 'create') {
    if (type) {
      this.setVisible(type)
    } else {
      moduleTypeList.forEach(v => v !== exclude && this.setVisible(v))
    }
  }

  /**
   * 设置面板隐藏
   * @param exclude
   * 若有参数则关闭除参数以外的面板
   * 若无参数则隐藏所有默认配置的面板
   */
  setModulesHide(exclude: ModuleType) {
    moduleTypeList.forEach(t => t !== exclude && this.resetVisible(t))
    this.resetLinkage()
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
   * todo 创建节点
   */
  onTreeNodeCreate(nodeData: ThematicMapSubjectConfigNode) {
    this.setModulesShow('create')
  }

  /**
   * todo 编辑节点, 需要兼容新旧配置
   */
  onTreeNodeEdit(nodeData: ThematicMapSubjectConfigNode) {
    if (nodeData.parentId) {
      // 新的专题配置
      this.subjectNode = nodeData
    } else {
      // 旧配置, 需要转换为新配置回显编辑
    }
    this.setModulesShow('create')
  }

  /**
   * 移除节点
   */
  onTreeNodeRemove(nodeData: ThematicMapSubjectConfigNode) {
    this.setSelectedSubjectList(
      this.checkedThematicMapNodes.filter(s => s.id !== nodeData.id)
    )
    const recursion = (
      tree: Array<ThematicMapSubjectConfigNode>,
      node: ThematicMapSubjectConfigNode
    ) => {
      for (let i = 0; i < tree.length; i++) {
        const n = tree[i]
        if (n.id === node.id) {
          tree.splice(
            tree.findIndex(({ id }) => id === node.id),
            1
          )
          i--
        } else if (n.children && n.children.length) {
          recursion(n.children, node)
        }
      }
      return tree
    }
    this.updateSubjectConfig(recursion(this.subjectConfig, nodeData))
      .then(() => {
        this.$message.success('删除成功')
      })
      .catch(err => {
        this.$message.error('删除失败')
      })
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
      this.setModulesHide('tools')
    } else {
      this.setModulesShow()
    }
  }

  /**
   * 专题图面板打开
   * fixme 未对接服务，取store里缓存的配置
   */
  onOpen() {
    if (this.flag) {
      this.setSubjectConfig(this.subjectConfig)
      this.setModulesShow('tools')
      this.flag = false
    }
  }

  /**
   * 专题图面板关闭
   */
  onClose() {
    this.flag = true
    this.checkedThematicMapNodes = []
    this.setSelectedSubjectList([])
    this.setModulesHide()
    this.setLoadingHide()
    // this.setBaseConfig(null)
    // this.setSubjectConfig([])
  }

  /**
   * 保存后更新了store里的subjectConfig后需要更新专题配置树
   */
  @Watch('subjectConfig', { deep: true })
  subjectConfigChanged(nV) {
    this.setLoadingShow()
    this.thematicMapTree = this.normalizeThematicMapTree(_cloneDeep(nV))
    this.setLoadingHide()
  }

  created() {
    const { baseConfig, subjectConfig = [] } = this.widgetInfo.config
    this.setBaseConfig(baseConfig)
    this.setSubjectConfig(subjectConfig)
  }
}
</script>
<style lang="less" scoped>
.tree-node-context-menue {
  box-shadow: @box-shadow-base;
}
</style>
