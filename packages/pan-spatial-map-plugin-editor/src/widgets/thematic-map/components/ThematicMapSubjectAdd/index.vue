<template>
  <!-- 新建专题图 -->
  <mp-window-wrapper :visible="saVisible">
    <mp-window
      title="新建专题图"
      :visible.sync="saVisible"
      anchor="top-center"
      :verticalOffset="20"
    >
      <div class="thematic-map-subject-add">
        <div class="subject-add-content">
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
        </div>
        <!-- 保存按钮 -->
        <div class="subject-add-save-btn">
          <a-button type="primary" @click="onSave">保存配置</a-button>
        </div>
      </div>
    </mp-window>
  </mp-window-wrapper>
</template>
<script lang="ts">
import {
  Mixins,
  Component,
  Watch,
  ProvideReactive
} from 'vue-property-decorator'
import { WidgetMixin } from '@mapgis/web-app-framework'
import { ThematicMapInstance } from '@mapgis/pan-spatial-map-store'
import BaseItems from './components/BaseItems.vue'
import TimeLineItems from './components/TimeLineItems.vue'
import AttributeTableItems from './components/AttributeTableItems.vue'
import StatisticTableItems from './components/StatisticTableItems.vue'
import PopupItems from './components/PopupItems.vue'

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
  // @ProvideReactive() formData!: any

  saVisible = false

  // formData = {}

  get visible() {
    return ThematicMapInstance.isVisible('sa')
  }

  onSave() {}

  @Watch('visible')
  watchVisible(nV) {
    this.saVisible = nV
  }

  created() {
    this.saVisible = this.visible
  }
}
</script>
<style lang="less" scoped>
@import './index.less';
</style>
