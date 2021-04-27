<template>
  <div></div>
</template>
<script lang="ts">
/**
 * @description 专题添加
 */
import { Mixins, Component } from 'vue-property-decorator'
import { WidgetMixin } from '@mapgis/web-app-framework'
import TimeLineItems from './components/TimeLineItems'
import AttributeTableItems from './components/AttributeTableItems'
import StatisticTableItems from './components/StatisticTableItems'
import PopupItems from './components/PopupItems'

interface IVueExtends {
  [k: string]: any
}

@Component({
  components: {
    TimeLineItems,
    AttributeTableItems,
    StatisticTableItems,
    PopupItems
  }
})
export default class ThematicMapSubjectAdd extends Mixins<IVueExtends>(
  WidgetMixin
) {}
</script>
<style lang="less" scoped></style>
