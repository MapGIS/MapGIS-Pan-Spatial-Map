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
    <!-- 工具栏 -->
    <thematic-map-manage-tools />
  </div>
</template>

<script lang="ts">
import { Mixins, Component, ProvideReactive } from 'vue-property-decorator'
import { WidgetMixin } from '@mapgis/web-app-framework'
import {
  ThematicMapInstance,
  IThematicMapSubjectConfig
} from '@mapgis/pan-spatial-map-store'
import ThematicMapAttributeTable from './components/ThematicMapAttributeTable'
import ThematicMapStatisticTable from './components/ThematicMapStatisticTable'
import ThematicMapTimeLine from './components/ThematicMapTimeLine'
import ThematicMapManageTools from './components/ThematicMapManageTools'

@Component({
  name: 'MpThematicMap',
  components: {
    ThematicMapAttributeTable,
    ThematicMapStatisticTable,
    ThematicMapTimeLine,
    ThematicMapManageTools
  }
})
export default class MpThematicMap extends Mixins<{
  [k: string]: any
}>(WidgetMixin) {
  @ProvideReactive() visible = 'visible'

  visible = false

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
    this.visible = true
    console.log('总配置数据/专题配置数据', config, subjectConfig)
  }

  /**
   * 专题服务面板关闭
   */
  onClose() {
    this.visible = false
    ThematicMapInstance.resetThematicMapConfig()
  }
}
</script>

<style lang="less" scoped></style>
