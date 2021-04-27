<template>
  <mp-window-wrapper :visible="mtVisible">
    <transition name="slide-fade">
      <mp-placement
        class="thematic-map-manage-tools"
        position="center-right"
        v-show="mtVisible"
      >
        <a-row v-for="icon in iconList" :key="icon.type">
          <a-col>
            <a-tooltip placement="left" :content="icon.tooltip">
              <a-icon :type="icon.type" @lcick="onToolIconChange(icon)" />
            </a-tooltip>
          </a-col>
        </a-row>
      </mp-placement>
    </transition>
  </mp-window-wrapper>
</template>
<script lang="ts">
/**
 * @description 工具栏
 */
import { Mixins, Component, InjectReactive } from 'vue-property-decorator'
import { WidgetMixin } from '@mapgis/web-app-framework'
// import {  } from '@vue/pan-spatial-map-store'

interface IIcon {
  type: string
  tooltip: string
}
@Component
export default class ThematicMapManageTools extends Mixins<{
  [k: string]: any
}>(WidgetMixin) {
  @InjectReactive({ from: 'visible', default: false })
  readonly mtVisible!: boolean

  iconList: IIcon[] = [
    {
      type: 'table',
      tooltip: '属性表',
      configType: 'attribute'
    },
    {
      type: 'bar-chart',
      tooltip: '统计表',
      configType: 'statistic'
    },
    {
      type: 'clock-circle',
      tooltip: '时间轴',
      configType: 'timeLine'
    },
    {
      type: 'file-add',
      tooltip: '新建专题图',
      configType: 'subjectAdd'
    }
  ]

  /**
   * 按钮变化
   * @param item<object>
   */
  onToolIconChange(item: IIcon) {
    // TODO
  }
}
</script>
<style lang="less">
.slide-fade-enter-active,
.slide-fade-leave-active {
  transition: all 0.3s ease;
}

.slide-fade-enter,
.slide-fade-leave-to {
  transform: translateX(100%);
  opacity: 0;
}
</style>
<style lang="less" scoped>
@import './index.less';
</style>
