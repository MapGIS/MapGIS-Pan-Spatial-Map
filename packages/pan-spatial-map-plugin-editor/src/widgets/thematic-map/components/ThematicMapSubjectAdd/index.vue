<template>
  <mp-window-wrapper :visible="saVisible">
    <mp-window
      title="新建专题图"
      :visible.sync="saVisible"
      anchor="center-center"
      :verticalOffset="60"
    >
      <div class="thematic-map-subject-add">
        <!-- 基础选项 -->
        <base-items />
        <!-- 时间轴模块 -->
        <time-line-items />
        <!-- 属性表模块 -->
        <attribute-table-items />
        <!-- 统计表模块 -->
        <statistic-table-items />
        <!-- 弹框模块 -->
        <popup-items />
        <!-- 保存按钮 -->
        <div class="save-btn">
          <a-button type="primary" @click="onSave">保存</a-button>
        </div>
      </div>
    </mp-window>
  </mp-window-wrapper>
</template>
<script lang="ts">
/**
 * @description 新建专题图
 */
import { Mixins, Component, Watch } from 'vue-property-decorator'
import { WidgetMixin } from '@mapgis/web-app-framework'
import { ThematicMapInstance } from '@mapgis/pan-spatial-map-store'
import BaseItems from './components/BaseItems'
import TimeLineItems from './components/TimeLineItems'
import AttributeTableItems from './components/AttributeTableItems'
import StatisticTableItems from './components/StatisticTableItems'
import PopupItems from './components/PopupItems'

@Component({
  components: {
    BaseItems,
    TimeLineItems,
    AttributeTableItems,
    StatisticTableItems,
    PopupItems
  }
})
export default class ThematicMapSubjectAdd extends Mixins<{
  [k: string]: any
}>(WidgetMixin) {
  saVisible = true

  get visible() {
    return ThematicMapInstance.isVisible('sa')
  }

  onSave() {}

  @Watch('visible')
  watchVisible(nV) {
    this.saVisible = nV
  }
}
</script>
<style lang="less" scoped>
@import './index.less';
</style>
