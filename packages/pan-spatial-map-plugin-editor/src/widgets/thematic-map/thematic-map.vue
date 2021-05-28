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
        @check="onTreeCheck"
      />
    </a-spin>
    <template v-if="selected">
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
    </template>
  </div>
</template>

<script lang="ts">
import { Mixins, Component } from 'vue-property-decorator'
import { WidgetMixin } from '@mapgis/web-app-framework'
import {
  mapGetters,
  mapMutations,
  moduleTypes
} from '@mapgis/pan-spatial-map-store'
import ThematicMapAttributeTable from './components/ThematicMapAttributeTable'
import ThematicMapStatisticTable from './components/ThematicMapStatisticTable'
import ThematicMapTimeLine from './components/ThematicMapTimeLine'
import ThematicMapManageTools from './components/ThematicMapManageTools'
import ThematicMapSubjectAdd from './components/ThematicMapSubjectAdd'
import ThematicMapLayers from './components/ThematicMapLayers'

@Component({
  name: 'MpThematicMap',
  methods: {
    ...mapMutations([
      'setThematicMapConfig',
      'setSelected',
      'setSelectedList',
      'setVisible',
      'resetVisible'
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

  selected = ''

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
   * @param checkeddKeys<array>
   */
  onTreeCheck(checkeddKeys) {
    const selectedList = checkeddKeys.reduce((results, id) => {
      const node = this.getSujectNodeById(this.treeData, id, null)
      if (node) {
        results.push(node)
      }
      return results
    }, [])
    const selected = selectedList.length
      ? selectedList[selectedList.length - 1].id
      : ''
    this.setSelected(selected)
    this.setSelectedList(selectedList)
    this.selected = selected
    moduleTypes.forEach(v => this.setVisible(v))
  }

  /**
   * 专题服务面板打开
   */
  onOpen() {
    this.loading = true
    const {
      config,
      config: { subjectConfig }
    } = this.widgetInfo
    this.setThematicMapConfig(config)
    this.treeData = this.normalizeTreeData(subjectConfig)
    this.loading = false
  }

  /**
   * 专题服务面板关闭
   */
  onClose() {
    moduleTypes.forEach(v => this.resetVisible(v))
  }
}
</script>
