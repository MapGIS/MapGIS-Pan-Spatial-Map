<template>
  <div class="statistic-graph">
    <a-row type="flex" align="middle">
      <a-checkbox @change="onStatisticTableChange">
        开启统计图
      </a-checkbox>
    </a-row>
    <template v-if="showStatisticTable">
      <mp-row-flex label="横轴字段" label-align="right">
        <a-select v-model="xAxisKey" :options="xAxisFields" />
      </mp-row-flex>
      <mp-row-flex label="统计指标" label-align="right">
        <a-select
          v-model="targetField"
          mode="tags"
          :options="targetFieldList"
        />
      </mp-row-flex>
      <a-table
        row-key="id"
        :loading="tableLoading"
        :columns="tableColumns"
        :data-source="tableData"
        :scroll="{ y: 250 }"
      />
    </template>
  </div>
</template>
<script lang="ts">
import { Vue, Component } from 'vue-property-decorator'

@Component
export default class StatisticGraph extends Vue {
  showStatisticTable = false

  xAxisKey = ''

  xAxisFields = []

  targetField = []

  targetFieldList = []

  tableLoading = false

  tableColumns = [
    {
      title: '字段名',
      dataIndex: 'key'
    },
    {
      title: '别名',
      dataIndex: 'val'
    }
  ]

  tableData = []

  onStatisticTableChange(e) {
    this.showStatisticTable = e.target.checked
  }
}
</script>
<style lang="less" scoped></style>
