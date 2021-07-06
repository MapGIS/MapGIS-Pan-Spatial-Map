<template>
  <div class="time-line-items">
    <a-row type="flex" align="middle">
      <a-checkbox @change="onTimeLineChange">
        开启时间轴
      </a-checkbox>
    </a-row>
    <a-row>
      <a-col>
        <a-input-group compact v-if="showTimeLine">
          <a-select
            v-model="timeType"
            style="width: 20%"
            :options="timeTypeList"
          />
          <a-input v-model="time" style="width: 80%" placeholder="请输入" />
        </a-input-group>
      </a-col>
    </a-row>
  </div>
</template>
<script lang="ts">
import { Vue, Component } from 'vue-property-decorator'

@Component
export default class TimeLineItems extends Vue {
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
