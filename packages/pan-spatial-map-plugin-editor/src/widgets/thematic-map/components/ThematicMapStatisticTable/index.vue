<template>
  <mp-window-wrapper class="thematic-map-statistic-table" :visible="stVisible">
    <mp-window
      title="统计表"
      :visible.sync="stVisible"
      anchor="top-left"
      :verticalOffset="60"
    >
      <div class="thematic-map-statistic-table">
        <!-- 指标和图表切换 -->
        <a-row type="flex" align="middle" class="statistic-table-head">
          <a-col span="16">
            <row-flex :span="[4, 20]" label="指标">
              <a-select v-model="target">
                <a-select-option v-for="item in targetList" :key="item.value">{{
                  item.label
                }}</a-select-option>
              </a-select>
            </row-flex>
          </a-col>
          <a-col span="8">
            <a-tooltip
              v-for="item in chartConfig"
              :key="item.type"
              :content="item.tooltip"
              placement="bottom"
            >
              <a-icon
                :type="item.iconType"
                :class="{ active: item.type === activeChart }"
                @click="onChartTypeChange(item.type)"
              />
            </a-tooltip>
          </a-col>
        </a-row>
        <!-- 图表 -->
        <div id="thematic-map-statistic-table-chart" />
      </div>
    </mp-window>
  </mp-window-wrapper>
</template>
<script lang="ts">
/**
 * @description 统计表
 */
import { Mixins, Component, Watch } from 'vue-property-decorator'
import { WidgetMixin } from '@mapgis/web-app-framework'
import { ThematicMapInstance } from '@mapgis/pan-spatial-map-store'
import echarts from 'echarts'
import RowFlex from '../RowFlex'
import { barChartOptions } from './config/barChartOptions'
import { lineChartOptions } from './config/lineChartOptions'
import { pieChartOptions } from './config/pieChartOptions'

type TChartType = 'bar' | 'line' | 'pie'

interface IChartConfig {
  iconType: string
  tooltip: string
  type: TChartType
}

@Component({
  components: {
    RowFlex
  }
})
export default class ThematicMapStatisticTable extends Mixins<{
  [k: string]: any
}>(WidgetMixin) {
  stVisible = false

  // 当前活动的图标
  activeChart: TChartType = 'bar'

  // 指标
  target = ''

  // 指标列表
  targetList: any[] = [
    {
      label: '测试数据',
      value: '111'
    }
  ]

  // 图表
  chart: HTMLCanvasElement | null = null

  // 3种图表配置
  chartConfig: IChartConfig[] = [
    {
      iconType: 'bar-chart',
      tooltip: '柱状图',
      type: 'bar'
    },
    {
      iconType: 'line-chart',
      tooltip: '折线图',
      type: 'line'
    },
    {
      iconType: 'pie-chart',
      tooltip: '饼图',
      type: 'pie'
    }
  ]

  get visible() {
    return ThematicMapInstance.isVisible('st')
  }

  /**
   * 图表类型变化
   * @param type<string>
   */
  onChartTypeChange(type: TChartType) {
    let options
    switch (type) {
      case 'bar':
        options = barChartOptions({
          title: '柱状图',
          x: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
          y: [120, 200, 150, 80, 70, 110, 130]
        })
        break
      case 'line':
        options = lineChartOptions({
          title: '折线图',
          x: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
          y: [120, 200, 150, 80, 70, 110, 130]
        })
        break
      case 'pie':
        options = pieChartOptions({
          title: '饼图',
          data: [
            { value: 1048, name: '搜索引擎' },
            { value: 735, name: '直接访问' },
            { value: 580, name: '邮件营销' },
            { value: 484, name: '联盟广告' },
            { value: 300, name: '视频广告' }
          ]
        })
        break
      default:
        break
    }
    this.activeChart = type
    if (this.chart) {
      this.chart.clear()
      this.chart.setOption(options)
      this.chart.resize()
    }
  }

  /**
   * 监听弹框开关
   */
  @Watch('visible')
  watchVisible(nV) {
    this.stVisible = nV
    this.$nextTick(() => nV && this.onChartTypeChange('bar'))
  }

  mounted() {
    this.chart = echarts.init(
      document.getElementById('thematic-map-statistic-table-chart')
    )
  }
}
</script>
<style lang="less" scoped>
@import './index.less';
</style>
