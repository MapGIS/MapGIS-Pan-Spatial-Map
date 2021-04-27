<template>
  <mp-window-wrapper :visible="atVisible">
    <mp-window
      title="属性表"
      :visible.sync="atVisible"
      anchor="top-right"
      :verticalOffset="60"
    >
      <div class="thematic-map-attribute-table">
        <!-- 专题和时间选项 -->
        <a-row
          type="flex"
          align="middle"
          justify="space-between"
          class="attribute-table-head"
        >
          <a-col span="13">
            <a-row type="flex" align="middle">
              <a-col span="4">专题：</a-col>
              <a-col span="20">
                <a-select v-model="subject">
                  <a-select-option
                    v-for="item in subjectList"
                    :key="item.value"
                    >{{ item.label }}</a-select-option
                  >
                </a-select>
              </a-col>
            </a-row>
          </a-col>
          <a-col span="10">
            <a-row type="flex" align="middle">
              <a-col span="5">时间：{{ time }}</a-col>
              <a-col span="19">
                <a-select v-model="time">
                  <a-select-option v-for="item in timeList" :key="item.value">{{
                    item.label
                  }}</a-select-option>
                </a-select>
              </a-col>
            </a-row>
          </a-col>
        </a-row>
        <!-- 分页列表 -->
        <a-table
          row-key="id"
          :loading="loading"
          :columns="tableColumns"
          :data-source="tableData"
          :pagination="tablePagination"
          :scroll="tableScroll"
        />
      </div>
    </mp-window>
  </mp-window-wrapper>
</template>
<script lang="ts">
/**
 * @description 属性表
 */
import {
  Mixins,
  Component,
  InjectReactive,
  Watch
} from 'vue-property-decorator'
import { WidgetMixin } from '@mapgis/web-app-framework'
import {ThematicMapInstance} from '@mapgis/pan-spatial-map-store'

@Component
export default class ThematicMapAttributeTable extends Mixins<{
  [k: string]: any
}>(WidgetMixin) {
  @InjectReactive({ from: 'visible', default: false })
  atVisible!: boolean

  // 加载开关
  loading = false

  // 专题
  subject = ''

  // 专题列表
  subjectList: any[] = []

  // 时间
  time = ''

  // 时间列表
  timeList: (string | number)[] = []

  tableColumns: any[] = [
    {
      title: '年份',
      dataIndex: 'date'
    },
    {
      title: '数量',
      dataIndex: 'amount'
    },
    {
      title: '类型',
      dataIndex: 'type'
    }
  ]

  tableData: Record<string, any>[] = [
    {
      id: '111',
      date: '2013',
      amount: 120,
      type: '雨伞'
    },
    {
      id: '222',
      date: '2014',
      amount: 23,
      type: '鞋子'
    },
    {
      id: '333',
      date: '2015',
      amount: 55,
      type: '雨衣'
    }
  ]

  get tableScroll() {
    return {
      x: 500,
      y: 360
    }
  }

  get tablePagination() {
    return {
      showSizeChanger: true,
      pageSizeOptions: ['10', '15', '20', '30', '50'],
      showTotal: total => `共${total}条`
    }
  }

  get currentYear() {
    return ThematicMapInstance.getCurrentYear
  }

  @Watch('currentYear')
  watchCurrentYear(nV) {
    this.time = nV
    console.log('属性表获取到的当前年度', nV)
  }
}
</script>
<style lang="less" scoped>
@import './index.less';
</style>
