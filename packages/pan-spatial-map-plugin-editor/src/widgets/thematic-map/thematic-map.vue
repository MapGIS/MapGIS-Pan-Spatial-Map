<template>
  <div class="mp-widget-thematic-map">
    <!-- 专题服务树 -->
    <a-spin tip="正在加载..." :spinning="loading">
      <a-tree
        checkable
        :show-line="true"
        :tree-data="treeData"
        :replace-fields="{ key: 'id' }"
        @check="onTreeCheck"
      />
    </a-spin>
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
  </div>
</template>

<script lang="ts">
import { Mixins, Component } from 'vue-property-decorator'
import { WidgetMixin } from '@mapgis/web-app-framework'
import {
  ThematicMapInstance,
  TModuleType,
  IThematicMapSubjectConfig
} from '@mapgis/pan-spatial-map-store'
import ThematicMapAttributeTable from './components/ThematicMapAttributeTable'
import ThematicMapStatisticTable from './components/ThematicMapStatisticTable'
import ThematicMapTimeLine from './components/ThematicMapTimeLine'
import ThematicMapManageTools from './components/ThematicMapManageTools'
import ThematicMapSubjectAdd from './components/ThematicMapSubjectAdd'

@Component({
  name: 'MpThematicMap',
  components: {
    ThematicMapAttributeTable,
    ThematicMapStatisticTable,
    ThematicMapTimeLine,
    ThematicMapManageTools,
    ThematicMapSubjectAdd
  }
})
export default class MpThematicMap extends Mixins<{
  [k: string]: any
}>(WidgetMixin) {
  loading = false

  treeData: IThematicMapSubjectConfig[] = []

  /**
   * 获取专题服务树中选中的节点配置
   * @param treeData<array>
   * @param id<string>
   * @param node<object>
   */
  getSujectNodeById(
    treeData: IThematicMapSubjectConfig[],
    id: string,
    node: IThematicMapSubjectConfig | null
  ) {
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
   * @param results<array>
   */
  normalizeTreeData(treeData, results = []) {
    for (let i = 0; i < treeData.length; i++) {
      const item = treeData[i]
      if (item.nodeType) {
        results.push({
          ...item,
          checkable: item.nodeType === 'subject'
        })
      } else if (item.children && item.children.length) {
        this.getSujectNodeById(item.children, results)
      }
    }
    return results
  }

  /**
   * 专题服务树选中
   * @param checkeddKeys<array>
   */
  onTreeCheck(checkeddKeys) {
    const configList = checkeddKeys.reduce((results, id) => {
      const node = this.getSujectNodeById(this.treeData, id, null)
      if (node) {
        results.push(node)
      }
      return results
    }, [])
    console.log('选中的专题的列表', configList)
    ThematicMapInstance.setSelectedSujectConfigList(configList)
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
    const openModules: TModuleType[] = ['at', 'st', 'tl', 'mt']
    openModules.forEach(item => ThematicMapInstance.setVisible(item))
    ThematicMapInstance.setThematicMapConfig(config)
    this.treeData = this.normalizeTreeData(subjectConfig)
    // console.log('专题服务所有配置', config)
    this.loading = false
  }

  /**
   * 专题服务面板关闭
   */
  onClose() {
    ThematicMapInstance.resetVisible()
    ThematicMapInstance.reset()
  }
}
</script>
