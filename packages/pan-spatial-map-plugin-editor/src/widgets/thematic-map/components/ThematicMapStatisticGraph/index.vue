<template>
  <!-- 统计表 -->
  <mp-window-wrapper :visible="visible">
    <mp-window
      title="统计表"
      :visible.sync="visible"
      anchor="top-left"
      :horizontalOffset="12"
      :verticalOffset="50"
    >
      <div class="thematic-map-statistic-graph">
        <a-spin :spinning="loading">
          <!-- 指标和图表切换 -->
          <mp-row-flex
            class="thematic-map-statistic-graph-head"
            :span="[16, 8]"
            content-align="right"
          >
            <template #label>
              <mp-row-flex :span="[4, 20]" label="指标">
                <a-select
                  :value="target"
                  :options="targetList"
                  @change="onTargetChange"
                />
              </mp-row-flex>
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
          </mp-row-flex>
          <!-- 图表 -->
          <div id="thematic-map-graph-chart" v-show="showChart" />
          <!-- 空数据友好提示 -->
          <a-empty v-show="!showChart" />
        </a-spin>
      </div>
    </mp-window>
  </mp-window-wrapper>
</template>
<script lang="ts">
import { Vue, Component, Watch, Mixins } from 'vue-property-decorator'
import { Feature } from '@mapgis/web-app-framework'
import * as echarts from 'echarts'
import { mapGetters, mapMutations, highlightSubjectTypes } from '../../store'
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
  computed: {
    ...mapGetters([
      'loading',
      'isVisible',
      'pageDataSet',
      'subjectData',
      'linkageItem'
    ])
  },
  methods: {
    ...mapMutations(['setLinkageItem', 'resetVisible', 'resetLinkage'])
  }
})
export default class ThematicMapStatisticGraph extends Vue {
  vueKey = 'gragh'

  // 默认标注图标
  defaultIcon = ''

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

  get visible() {
    return this.graph && this.isVisible('graph')
  }

  set visible(nV) {
    if (!nV) {
      this.resetVisible('graph')
    }
  }

  // 是否支持图属高亮
  get hasHighlight() {
    return highlightSubjectTypes.includes(this.subjectData?.subjectType)
  }

  // 图表配置
  get graph() {
    return this.subjectData?.graph
  }

  // 图表是否有数据,是否展示友好提示
  get showChart() {
    const { x, y } = this.chartOption
    return x.length && y.length
  }

  /**
   * 将query的结果设置图表配置里
   * @param dataSet
   */
  getChartOptions(dataSet: Feature.FeatureIGS | null) {
    const xArr = []
    const yArr = []
    if (dataSet && dataSet.AttStruct.FldName && this.graph) {
      const {
        SFEleArray,
        AttStruct: { FldName }
      } = dataSet
      const xIndex = FldName.indexOf(this.graph.field)
      const yIndex = FldName.indexOf(this.target)
      SFEleArray.forEach(({ AttValue }) => {
        if (AttValue) {
          xArr.push(AttValue[xIndex])
          yArr.push(AttValue[yIndex])
        }
      })
    }
    this.chartOption.x = xArr
    this.chartOption.y = yArr
    this.onChartTypeChange('bar')
  }

  /**
   * 设置指标列表数据
   * @param <object>
   */
  getTargetList() {
    if (!this.graph) return
    const { showFields, showFieldsTitle } = this.graph
    const targetList = showFields.map(value => {
      const label =
        showFieldsTitle && showFieldsTitle[value]
          ? showFieldsTitle[value]
          : value
      return { label, value }
    })
    const [firstTarget] = targetList
    this.targetList = targetList
    this.target = firstTarget?.value
    this.chartOption.title = firstTarget?.label
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
        this.chart.showLoading()
        this.chart.setOption(options(this.chartOption))
        this.chart.resize()
        this.chart.hideLoading()
      }
    })
  }

  /**
   * 指标选项变化, 获取某指标对应的统计数据
   * @param value
   */
  onTargetChange(value: string) {
    this.target = value
    this.chartOption.title = value
    this.getChartOptions(this.pageDataSet)
  }

  /**
   * 取消高亮图表图形
   * @param {Number} 数据索引
   */
  onClearHighlight(dataIndex) {
    this.chart.dispatchAction({
      type: 'downplay',
      dataIndex
    })
    this.chart.dispatchAction({
      type: 'hideTip',
      dataIndex
    })
  }

  /**
   * 高亮图表图形
   * @param {Number} 数据索引
   */
  onHighlight(dataIndex) {
    this.chart.dispatchAction({
      type: 'showTip',
      seriesIndex: 0,
      dataIndex
    })
    this.chart.dispatchAction({
      type: 'highlight',
      dataIndex
    })
  }

  /**
   * 监听: 高亮配置
   */
  @Watch('hasHighlight')
  watchHasHighlight(nV) {
    if (nV) {
      this.chart.on('mouseover', ({ dataIndex }) => {
        this.setLinkageItem({
          from: this.vueKey,
          itemIndex: dataIndex
        })
      })
      this.chart.on('mouseout', this.resetLinkage)
    }
  }

  /**
   * 监听: 分页数据变化
   */
  @Watch('pageDataSet', { deep: true })
  watchPageDataSet(nV: Feature.FeatureIGS | null) {
    this.getTargetList()
    this.getChartOptions(nV)
  }

  /**
   * 监听: 联动项变化
   */
  @Watch('linkageItem', { deep: true })
  watchHighlightItem(nV) {
    if (!nV) {
      this.onClearHighlight()
    } else if (nV.from !== this.vueKey) {
      this.onHighlight(nV.itemIndex)
    }
  }

  mounted() {
    const chartDom: HTMLDivElement = document.getElementById(
      'thematic-map-graph-chart'
    )
    this.chart = echarts.init(chartDom)
  }
}
</script>
<style lang="less" scoped>
@import './index.less';
</style>
