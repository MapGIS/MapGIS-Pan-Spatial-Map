<template>
  <div class="mp-widget-thematic-map">
    <!-- 专题服务树 -->
    <a-spin :spinning="loading">
      <a-empty v-if="!treeData.length" />
      <a-tree
        v-else
        checkable
        :show-line="true"
        :tree-data="treeData"
        :replace-fields="{ key: 'id' }"
        :checkedKeys="checkedKeys"
        @check="onTreeCheck"
      />
    </a-spin>
    <div v-show="checkedKeys.length">
      <!-- 属性表 -->
      <thematic-map-attribute-table />
      <!-- 统计表 -->
      <thematic-map-statistic-table />
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
import { mapGetters, mapMutations, moduleTypes } from './store'
import ThematicMapAttributeTable from './components/ThematicMapAttributeTable'
import ThematicMapStatisticTable from './components/ThematicMapStatisticTable'
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
      'setSelectedList',
      'setVisible',
      'resetVisible',
      'resetHighlight'
    ])
  },
  components: {
    ThematicMapAttributeTable,
    ThematicMapStatisticTable,
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

  checkedKeys: string[] = []

  treeData: any[] = []

  /**
   * 获取专题服务树中选中的节点配置
   * @param treeData<array>
   * @param id<string>
   * @param node<object>
   */
  getSujectNodeById(treeData: any[], id: string, node: any) {
    if (!treeData) {
      return null
    }
    for (let i = 0; i < treeData.length; i++) {
      const item = treeData[i]
      if (item.nodeType === 'subject' && item.id === id) {
        node = item
        break
      } else if (item.children && item.children.length) {
        node = this.getSujectNodeById(item.children, id, node)
      }
    }
    return node
  }

  /**
   * 格式化专题服务树
   * @param treeData<array>
   */
  normalizeTreeData(treeData) {
    if (!treeData || !treeData.length) {
      return []
    }
    for (let i = 0; i < treeData.length; i++) {
      const item = treeData[i]
      if (item.nodeType) {
        const isSubject = item.nodeType === 'subject'
        item.checkable = isSubject
        item.selectable = isSubject
        if (item.children && item.children.length) {
          this.normalizeTreeData(item.children)
        }
      }
    }
    return treeData
  }

  /**
   * 专题服务树选中
   * @param checkedKeys<array>
   */
  onTreeCheck(checkedKeys) {
    if (!checkedKeys.length) {
      this.onClose()
    } else {
      const selectedList = checkedKeys.reduce((results, id) => {
        const node = this.getSujectNodeById(this.treeData, id, null)
        if (node) {
          results.push(node)
        }
        return results
      }, [])
      this.checkedKeys = checkedKeys
      this.setSelectedList(selectedList)
      moduleTypes.forEach(v => this.setVisible(v))
    }
  }

  /**
   * 专题服务面板打开
   */
  onOpen() {
    this.loading = true
    const { baseConfig, subjectConfig } = this.widgetInfo.config
    let _subjectConfig = subjectConfig
    if (this.subjectConfig) {
      _subjectConfig = this.subjectConfig
    } else {
      this.setSubjectConfig(_subjectConfig)
    }
    this.setBaseConfig(baseConfig)
    this.treeData = this.normalizeTreeData(_subjectConfig)
    this.setVisible('mt')
    this.loading = false
  }

  /**
   * 专题服务面板关闭
   */
  onClose() {
    this.checkedKeys = []
    this.setSelectedList([])
    this.resetVisible()
    this.resetHighlight()
  }

  @Watch('subjectConfig', { deep: true })
  subjectConfigChanged(nV) {
    this.loading = true
    this.treeData = this.normalizeTreeData(nV)
    this.loading = false
  }
}
</script>
