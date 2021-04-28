<template>
  <div class="mp-widget-thematic-map">
    <!-- 专题服务树 -->
    <a-spin tip="正在加载..." :spinning="loading">
      <a-tree
        :tree-data="subjectConfig"
        :replace-fields="replaceFields"
        @select="onSelect"
        @check="onCheck"
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

  subjectConfig: IThematicMapSubjectConfig[] = []

  // ant-tree 数据格式化
  get replaceFields() {
    return {
      key: 'id'
    }
  }

  onSelect() {}

  onCheck() {}

  /**
   * 专题服务面板打开
   */
  onOpen() {
    this.loading = true
    const {
      config,
      config: { subjectConfig }
    } = this.widgetInfo
    ThematicMapInstance.setThematicMapConfig(config)
    this.subjectConfig = subjectConfig
    this.loading = false
    const openModules: TModuleType[] = ['at', 'st', 'tl', 'mt']
    openModules.forEach(item => ThematicMapInstance.setVisible(item))
    console.log('总配置数据/专题配置数据', config, subjectConfig)
  }

  /**
   * 专题服务面板关闭
   */
  onClose() {
    ThematicMapInstance.resetVisible()
    ThematicMapInstance.resetThematicMapConfig()
  }
}
</script>
