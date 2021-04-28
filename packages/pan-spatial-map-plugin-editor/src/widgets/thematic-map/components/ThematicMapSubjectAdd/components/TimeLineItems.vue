<template>
  <div class="time-line-items">
    <a-row type="flex" align="middle">
      <a-checkbox @change="onTimeLineChange">
        开启时间轴
      </a-checkbox>
    </a-row>
    <row-flex justify="space-between" :span="[5, 18]" v-if="showTimeLine">
      <template #label>
        <a-select v-model="timeType" :options="timeTypeList" />
      </template>
      <a-input v-model="time" placeholder="请输入" />
    </row-flex>
  </div>
</template>
<script lang="ts">
import { Mixins, Component } from 'vue-property-decorator'
import { WidgetMixin } from '@mapgis/web-app-framework'
import RowFlex from '../../RowFlex'

@Component({
  components: {
    RowFlex
  }
})
export default class TimeLineItems extends Mixins<{
  [k: string]: any
}>(WidgetMixin) {
  showTimeLine = false

  time = ''

  timeType = 'year'

  timeTypeList: string[] = [
    {
      label: '年',
      value: 'year'
    },
    {
      label: '季',
      value: 'season'
    },
    {
      label: '月',
      value: 'month'
    },
    {
      label: '日',
      value: 'day'
    },
    {
      label: '时',
      value: 'hour'
    }
  ]

  onTimeLineChange(e) {
    this.showTimeLine = e.target.checked
  }
}
</script>
<style lang="less" scoped></style>
