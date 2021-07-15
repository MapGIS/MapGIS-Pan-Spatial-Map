<template>
  <div class="mp-widget-thematic-map">
    <!-- 专题服务树 -->
    <a-spin :spinning="loading">
      <a-empty v-if="!treeData.length" />
      <a-tree
        v-else
        @check="onTreeCheck"
        :show-line="true"
        :tree-data="treeData"
        :replace-fields="{ key: 'id' }"
        :checkedKeys="checkedKeys"
        checkable
      >
        <span slot="custom" slot-scope="node" class="tree-node">
          <a-dropdown :trigger="['contextmenu']">
            <span>{{ node.title }}</span>
            <a-menu slot="overlay" @click="onTreeNodeMenuClick($event, node)">
              <!-- <a-menu-item key="add" v-show="!node.checkable">添加</a-menu-item> -->
              <a-menu-item key="remove">删除</a-menu-item>
            </a-menu>
          </a-dropdown>
        </span>
      </a-tree>
    </a-spin>
    <div v-show="checkedNodes.length">
      <!-- 属性表 -->
      <thematic-map-attribute-table />
      <!-- 统计表 -->
      <thematic-map-statistic-graph />
      <!-- 时间轴 -->
      <thematic-map-time-line />
      <!-- 新建专题图 -->
      <thematic-map-subject-add />
      <!-- 工具栏 -->
      <thematic-map-manage-tools />
      <!-- 5类专题服务图层 -->
      <thematic-map-layers />
    </div>
  </div>
</template>

<script lang="ts">
import { Mixins, Component, Watch } from 'vue-property-decorator'
import { WidgetMixin } from '@mapgis/web-app-framework'
import _cloneDeep from 'lodash/cloneDeep'
import { mapGetters, mapMutations, ModuleType } from './store'
import ThematicMapAttributeTable from './components/ThematicMapAttributeTable'
import ThematicMapStatisticGraph from './components/ThematicMapStatisticGraph'
import ThematicMapTimeLine from './components/ThematicMapTimeLine'
import ThematicMapManageTools from './components/ThematicMapManageTools'
import ThematicMapSubjectAdd from './components/ThematicMapSubjectAdd'
import ThematicMapLayers from './components/ThematicMapLayers'

@Component({
  name: 'MpThematicMap',
  computed: {
    ...mapGetters(['subjectConfig'])
  },
  methods: {
    ...mapMutations([
      'setBaseConfig',
      'setSubjectConfig',
      'removeSubjectConfigNode',
      'setSelectedList',
      'setVisible',
      'resetVisible',
      'resetHighlight'
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

  defaultOpenPanel = ['at', 'st', 'tl']

  checkedNodes: Array<Record<string, any>> = []

  treeData: any[] = []

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
    this.resetHighlight()
    this.defaultOpenPanel.forEach(t => t !== type && this.resetVisible(t))
  }

  /**
   * 格式化专题服务树
   * @param treeData
   */
  normalizeTreeData(treeData) {
    return treeData.map(node => {
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
  setTreeData(tree) {
    this.treeData = this.normalizeTreeData(_cloneDeep(tree))
    this.setLoadingHide()
  }

  /**
   * 节点下拉菜单点击
   * @param key:  add | remove
   * @param dataRef 节点数据
   */
  onTreeNodeMenuClick({ key }, { dataRef, dataRef: { id } }) {
    switch (key) {
      case 'remove': {
        this.setSelectedList(this.checkedNodes.filter(s => s.id !== id))
        this.removeSubjectConfigNode(dataRef)
        break
      }
      case 'add':
        this.setPanelsShow('mt')
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
