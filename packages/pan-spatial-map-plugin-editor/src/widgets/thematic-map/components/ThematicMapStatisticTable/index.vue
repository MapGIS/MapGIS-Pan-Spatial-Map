<template>
  <!-- 统计表 -->
  <mp-window-wrapper class="thematic-map-statistic-table" :visible="stVisible">
    <mp-window
      title="统计表"
      :visible.sync="stVisible"
      anchor="top-left"
      :horizontalOffset="12"
      :verticalOffset="50"
    >
      <div class="thematic-map-statistic-table">
        <a-spin :spinning="loading">
          <!-- 指标和图表切换 -->
          <row-flex
            class="statistic-table-head"
            :span="[16, 8]"
            content-align="right"
          >
            <template #label>
              <row-flex :span="[4, 20]" label="指标">
                <a-select
                  :value="target"
                  :options="targetList"
                  @change="onTargetChange"
                />
              </row-flex>
            </template>
            <a-tooltip
              v-for="item in chartConfig"
              :key="item.type"
              :title="item.tooltip"
              placement="bottom"
            >
              <a-icon
                :type="item.iconType"
                :class="{ active: item.type === activeChart }"
                @click="onChartTypeChange(item.type)"
              />
            </a-tooltip>
          </row-flex>
          <!-- 图表 -->
          <div id="thematic-map-statistic-table-chart" v-show="showChart" />
          <!-- 空数据友好提示 -->
          <a-empty :image="simpleImage" v-show="!showChart" />
        </a-spin>
      </div>
    </mp-window>
  </mp-window-wrapper>
</template>
<script lang="ts">
import { Vue, Component, Watch } from 'vue-property-decorator'
import {
  queryFeaturesInstance,
  FeatureQueryParam,
  ThematicMapInstance
} from '@mapgis/pan-spatial-map-store'
import { Empty } from 'ant-design-vue'
import * as echarts from 'echarts'
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

interface IChartOption {
  title: string
  x?: any[]
  y?: any[]
}

@Component({
  components: {
    RowFlex
  }
})
export default class ThematicMapStatisticTable extends Vue {
  loading = false

  // 当前活动的图标
  activeChart: TChartType = 'bar'

  // 指标
  target = ''

  // 指标列表
  targetList = []

  // 图表
  chart: HTMLCanvasElement | null = null

  // 图表配置
  chartOption: IChartOption = {
    title: '',
    x: [],
    y: []
  }

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

  get stVisible() {
    return ThematicMapInstance.isVisible('st')
  }

  set stVisible(nV) {
    if (!nV) {
      ThematicMapInstance.resetVisible('st')
    }
  }

  // 获取选中专题
  get selected() {
    return ThematicMapInstance.getSelected
  }

  // 获取时间轴已选中的年度(回显至时间选项)
  get selectedTime() {
    return ThematicMapInstance.getSelectedTime
  }

  // 获取分页变化
  get pageParam() {
    return ThematicMapInstance.pageParam
  }

  // 获取选中专题对应年度的配置数据以及配置数据, 结果参考getSelectedSujectConfig的注释说明或者ts接口
  get selectedConfigSubData() {
    return ThematicMapInstance.getSelectedConfig?.configSubData
  }

  /**
   * 图表是否有数据,是否展示友好提示
   */
  get showChart() {
    const { x, y } = this.chartOption
    return x.length && y.length
  }

  /**
   * 图表类型变化
   * @param type<string>
   */
  onChartTypeChange(type: TChartType) {
    this.$nextTick(() => {
      let options: (a: IChartOption) => any
      switch (type) {
        case 'bar':
          options = barChartOptions
          break
        case 'line':
          options = lineChartOptions
          break
        case 'pie':
          options = pieChartOptions
          break
        default:
          break
      }
      this.activeChart = type
      if (this.chart) {
        this.chart.clear()
        this.chart.setOption(options(this.chartOption))
        this.chart.resize()
      }
      this.loading = false
    })
  }

  /**
   * 指标选项变化
   * @param value<string>
   */
  onTargetChange(value) {
    this.target = value
    this.chartOption.title = value
    this.onUpdateStatistic()
  }

  /**
   * 设置指标数据
   * @param <object>
   */
  onSetTargetList() {
    let targetList = []
    let chartTitle = ''
    if (this.selectedConfigSubData) {
      const {
        field,
        graph: { showFields, showFieldsTitle }
      } = this.selectedConfigSubData
      chartTitle = field
      const isFieldsTitle =
        showFieldsTitle && Object.keys(showFieldsTitle).length
      targetList = showFields.reduce((results, item) => {
        if (item) {
          const obj = {}
          obj.label = item
          obj.value =
            isFieldsTitle && isFieldsTitle[item] ? isFieldsTitle[item] : item
          results.push(obj)
        }
        return results
      }, [])
    }
    this.targetList = targetList
    this.onTargetChange(chartTitle || targetList[0]?.value)
  }

  /**
   * 更新图表数据
   */
  async onUpdateStatistic() {
    const xArr = []
    const yArr = []
    if (ThematicMapInstance.getRequestParams) {
      const fn = queryFeaturesInstance.query(
        ThematicMapInstance.getRequestParams
      )
      if (fn && fn.then) {
        this.loading = true
        const dataSet = await fn
        if (dataSet && dataSet.AttStruct.FldName) {
          const {
            SFEleArray,
            AttStruct: { FldName }
          } = dataSet
          const {
            graph: { field }
          } = this.selectedConfigSubData

          const xIndex = FldName.indexOf(field)
          const yIndex = FldName.indexOf(this.target)
          SFEleArray.forEach(({ AttValue }) => {
            if (AttValue) {
              xArr.push(AttValue[xIndex])
              yArr.push(AttValue[yIndex])
            }
          })
        }
      }
    }
    this.chartOption.x = xArr
    this.chartOption.y = yArr
    this.onChartTypeChange('bar')
  }

  /**
   * 监听: 选中的专题的变化
   */
  @Watch('selected')
  watchSelected() {
    this.onSetTargetList()
  }

  /**
   * 监听: 年度时间轴数据变化
   */
  @Watch('selectedTime')
  watchSelectedTime() {
    this.onSetTargetList()
  }

  /**
   * 监听: 选中的专题的变化
   */
  @Watch('pageParam', { deep: true })
  watchPageParam() {
    this.onUpdateStatistic()
  }

  beforeCreate() {
    this.simpleImage = Empty.PRESENTED_IMAGE_SIMPLE
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
