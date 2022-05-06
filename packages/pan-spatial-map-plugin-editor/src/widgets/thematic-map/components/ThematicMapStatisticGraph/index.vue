<template>
  <!-- 统计表 -->
  <transition name="fade">
    <diV>
      <mp-window-wrapper :visible="visible">
        <mp-window
          @window-size="onWindowSize"
          :visible.sync="visible"
          :horizontal-offset="48"
          :vertical-offset="50"
          :width="chartWidth"
          :height="chartHeight"
          :has-padding="false"
          title="统计表"
          anchor="bottom-right"
        >
          <a-spin :spinning="loading">
            <div ref="statisticGraph" class="thematic-map-statistic-graph">
              <!-- 指标和图表切换 -->
              <!-- <mp-row-flex class="target" :span="[16, 8]" content-align="right">
                <mp-row-flex slot="label" :label-width="44" label="指标">
                  <a-select
                    @change="onTargetChange"
                    :value="target"
                    :options="targetList"
                    size="small"
                  />
                </mp-row-flex>
                <a-tooltip
                  v-for="item in chartConfig"
                  :key="item.type"
                  :title="item.tooltip"
                >
                  <a-icon
                    :type="item.iconType"
                    :class="{ active: item.type === activeChart }"
                    @click="onChartTypeChange(item.type)"
                  />
                </a-tooltip>
              </mp-row-flex> -->
              <!-- 图表 -->
              <!-- <div id="thematic-map-graph-chart" v-show="showChart" /> -->
              <div v-if="statisticParamas">
                <mp-statistics-setting
                  :queryParams="statisticParamas"
                  :groupFieldProp="graph.field"
                  :statisticsFieldProp="graph.showFields"
                  :statisticsTypeProp="statisticsType"
                  :showUI="false"
                  @statisticsResult="getResult"
                  @statisticsFieldColor="getStatisticsFieldColor"
                  @groupField="getGroupField"
                  @statisticsField="getStatisticsField"
                ></mp-statistics-setting>
                <mp-statistics-echarts
                  :statisticsFieldColor="statisticsFieldColor"
                  :groupField="groupField"
                  :statisticsField="statisticsField"
                  :echartsData="echartsData"
                  @echart="getEchart"
                ></mp-statistics-echarts>
              </div>
              <!-- 空数据提示 -->
              <div
                class="empty-tip"
                v-show="!echartsData || echartsData.length < 1"
              >
                <a-empty />
              </div>
            </div>
          </a-spin>
        </mp-window>
      </mp-window-wrapper>

      <!-- <mp-window-wrapper :visible="false">
        <mp-window
          :id="statisticsId"
          @window-size="onWindowSize"
          :visible="false"
          :horizontal-offset="48"
          :vertical-offset="50"
          :width="chartWidth"
          :height="chartHeight"
          :has-padding="false"
          title="统计表"
          anchor="bottom-right"
        >
          <template>
            <mp-attribute-statistics
              v-if="statisticParamas"
              :queryParams="statisticParamas"
              :groupFieldProp="graph.field"
              :statisticsFieldProp="graph.showFields"
              :statisticsTypeProp="'sum'"
            />
          </template>
        </mp-window>
      </mp-window-wrapper> -->
    </diV>
  </transition>
</template>
<script lang="ts">
import { Vue, Component, Watch } from 'vue-property-decorator'
// import * as echarts from 'echarts'
import {
  ModuleType,
  mapGetters,
  mapMutations,
  hasHighlightSubjectList,
} from '../../store'
// import { barChartOptions } from './config/barChartOptions'
// import { lineChartOptions } from './config/lineChartOptions'
// import { pieChartOptions } from './config/pieChartOptions'
import { baseConfigInstance } from '@mapgis/pan-spatial-map-common'
import { LayerType } from '@mapgis/web-app-framework'

enum windowMode {
  max = 'max',
  normal = 'normal',
}
enum ChartType {
  BAR = 'BAR',
  LINE = 'LINE',
  PIE = 'PIE',
}

interface IChartConfig {
  iconType: string
  tooltip: string
  type: keyof ChartType
}

interface IChartOption {
  title: string
  color: string
  x?: any[]
  y?: any[]
}

@Component({
  computed: {
    ...mapGetters([
      'loading',
      'isVisible',
      'pageGeojson',
      'subjectData',
      'linkageFid',
    ]),
  },
  methods: {
    ...mapMutations(['setLinkage', 'resetVisible', 'resetLinkage']),
  },
})
export default class ThematicMapStatisticGraph extends Vue {
  // 当前活动的图标
  // private activeChart: keyof ChartType = ChartType.BAR

  // 指标
  // private target = ''

  // 指标列表
  // private targetList = []

  // 图表
  private chart: HTMLCanvasElement | null = null

  // 图表宽度
  private chartWidth = 360

  private chartHeight = 250

  // 图表配置
  // private chartOption: IChartOption = {
  //   title: '',
  //   color: '',
  //   x: [],
  //   y: [],
  // }

  // 3种图表配置
  // private chartConfig: IChartConfig[] = [
  //   {
  //     iconType: 'bar-chart',
  //     tooltip: '柱状图',
  //     type: ChartType.BAR,
  //   },
  //   {
  //     iconType: 'line-chart',
  //     tooltip: '折线图',
  //     type: ChartType.LINE,
  //   },
  //   {
  //     iconType: 'pie-chart',
  //     tooltip: '饼图',
  //     type: ChartType.PIE,
  //   },
  // ]

  private echartsData = []

  private statisticsFieldColor = []

  private groupField = {}

  private statisticsField = []

  get visible() {
    return this.graph && this.isVisible(ModuleType.GRAPH)
  }

  set visible(nV) {
    if (!nV) {
      this.resetVisible(ModuleType.GRAPH)
    }
  }

  // 是否支持图属高亮
  get hasHighlight() {
    return hasHighlightSubjectList.includes(this.subjectData?.subjectType)
  }

  // 图表配置
  get graph() {
    return this.subjectData?.graph
  }

  get statisticsType() {
    return this.graph.type || 'sum'
  }

  // 图表是否有数据,是否展示友好提示
  // get showChart() {
  //   const { x, y } = this.chartOption
  //   return x.length && y.length
  // }

  /**
   * 窗口变化
   * @param {string} mode <max | normal> 模式=
   */
  onWindowSize(mode?: keyof windowMode) {
    this.$nextTick(() => {
      if (this.chart) {
        this.chart.resize({
          width:
            mode === windowMode.MAX
              ? this.$refs.statisticGraph.clientWidth
              : this.chartWidth,
        })
      }
    })
  }

  /**
   * 将query的结果设置图表配置里
   */
  // getChartOptions() {
  //   const xArr = []
  //   const yArr = []
  //   const geojson = this.pageGeojson
  //   if (geojson && geojson.features?.length && this.graph) {
  //     geojson.features.forEach(({ properties }) => {
  //       xArr.push(properties[this.graph.field])
  //       yArr.push(properties[this.target])
  //     })
  //   }
  //   this.chartOption.x = xArr
  //   this.chartOption.y = yArr
  //   this.onChartTypeChange(ChartType.BAR)
  // }

  /**
   * 设置指标列表数据
   * @param <object>
   */
  // getTargetList() {
  //   if (!this.graph || !this.graph.showFields.length) {
  //     return
  //   }
  //   const { fieldColors, showFields, showFieldsTitle } = this.graph
  //   this.targetList = showFields.map((value) => ({
  //     label:
  //       showFieldsTitle && showFieldsTitle[value]
  //         ? showFieldsTitle[value]
  //         : value,
  //     value,
  //   }))
  //   if (this.targetList.length) {
  //     const { label, value } = this.targetList[0]
  //     this.target = value
  //     this.chartOption.title = label
  //     if (fieldColors) {
  //       this.chartOption.color = fieldColors[showFields.indexOf(this.target)]
  //     }
  //   }
  // }

  /**
   * 图表类型变化
   * @param {string} type<BAR | LINE | PIE> 类型
   */
  // onChartTypeChange(type: keyof ChartType) {
  //   this.$nextTick(() => {
  //     let options: (a: IChartOption) => any
  //     switch (type) {
  //       case ChartType.BAR:
  //         options = barChartOptions
  //         break
  //       case ChartType.LINE:
  //         options = lineChartOptions
  //         break
  //       case ChartType.PIE:
  //         options = pieChartOptions
  //         break
  //       default:
  //         break
  //     }
  //     this.activeChart = type
  //     if (this.chart) {
  //       this.chart.clear()
  //       this.chart.showLoading()
  //       this.chart.setOption(options(this.chartOption))
  //       this.chart.resize()
  //       this.chart.hideLoading()
  //     }
  //   })
  // }

  /**
   * 指标选项变化, 获取某指标对应的统计数据
   * @param value
   */
  // onTargetChange(value: string) {
  //   this.target = value
  //   this.chartOption.title = value
  //   this.getChartOptions()
  // }

  /**
   * 取消高亮图表图形
   * @param {number} dataIndex 索引
   */
  onClearHighlight(dataIndex) {
    if (!this.chart) {
      return
    }
    this.chart.dispatchAction({
      type: 'downplay',
      dataIndex,
    })
    this.chart.dispatchAction({
      type: 'hideTip',
      dataIndex,
    })
  }

  /**
   * 高亮图表图形
   * @param {number} dataIndex 索引
   */
  onHighlight(dataIndex) {
    if (!this.chart) {
      return
    }
    this.chart.dispatchAction({
      type: 'showTip',
      seriesIndex: 0,
      dataIndex,
    })
    this.chart.dispatchAction({
      type: 'highlight',
      dataIndex,
    })
  }

  /**
   * 设置高亮
   * @param {string} fid 要素fid
   */
  setHighlight(fid: string) {
    if (!this.pageGeojson) return
    const { features } = this.pageGeojson
    let name
    for (let i = 0; i < features.length; i++) {
      const feature = features[i]
      if (feature.properties.fid === fid) {
        const groupFieldValue = this.groupField.value
        name = feature.properties[groupFieldValue]
        break
      }
    }
    const keys = Object.keys(this.echartsData[0])
    const dataIndex = keys.indexOf(name)
    // const dataIndex = this.echartsData.findIndex(
    //   ({ properties }) => properties.fid === fid
    // )
    this.onClearHighlight(dataIndex)
    this.onHighlight(dataIndex)
  }

  /**
   * 图表事件绑定
   */
  setChartEventBind() {
    if (!this.chart) {
      return
    }
    this.chart.on('mouseout', this.resetLinkage)
    this.chart.on('mouseover', (e) => {
      if (!this.pageGeojson) return
      const fids = []
      const { features } = this.pageGeojson
      const { name } = e
      for (let i = 0; i < features.length; i++) {
        const feature = features[i]
        const groupFieldValue = this.groupField.value
        if (feature.properties[groupFieldValue] === name) {
          fids.push(feature.properties.fid)
        }
      }
      // TODO 这里暂时不支持多要素联动
      this.setLinkage(fids[0])
    })
  }

  /**
   * 监听: 高亮配置
   */
  @Watch('hasHighlight')
  hasHighlightChanged(has) {
    has && this.setChartEventBind()
  }

  /**
   * 监听: 分页数据变化
   */
  // @Watch('pageGeojson', { deep: true })
  // pageGeojsonChanged() {
  //   this.getTargetList()
  //   this.getChartOptions()
  // }

  /**
   * 监听: 联动项变化
   */
  @Watch('linkageFid')
  linkageFidChanged(nV) {
    this.setHighlight(nV)
  }

  // private statisticsId = `${new Date().getTime()}-${Math.floor(
  //   Math.random() * 10
  // )}-statistics`

  get statisticParamas() {
    console.log(baseConfigInstance.config)
    const { ip: baseConfigIp, port: baseConfigPort } = baseConfigInstance.config
    if (!this.subjectData) {
      return null
    }
    const { ip, port, docName, layerName, layerIndex, gdbp } = this.subjectData
    const paramIp = ip && ip !== '' ? ip : baseConfigIp
    const paramPort = port && port !== '' ? port : baseConfigPort
    const serverType =
      gdbp && gdbp.length > 0 ? LayerType.IGSVector : LayerType.IGSMapImage
    return {
      ip: paramIp,
      port: paramPort,
      serverName: docName,
      layerIndex,
      serverType,
      gdbp,
    }
  }

  mounted() {
    // const chartDom: HTMLDivElement = document.getElementById(
    //   'thematic-map-graph-chart'
    // )
    // this.chart = echarts.init(chartDom)
  }

  beforeDestroy() {
    this.resetLinkage()
  }

  getResult(result) {
    if (result) {
      this.echartsData = result.data
    }
  }

  getStatisticsFieldColor(data) {
    this.statisticsFieldColor = [...data]
  }

  getGroupField(data) {
    this.groupField = { ...data }
  }

  getStatisticsField(data) {
    this.statisticsField = [...data]
  }

  getEchart(echartObj) {
    this.chart = echartObj
    this.setChartEventBind()
  }
}
</script>
<style lang="less" scoped>
@import './index.less';
</style>
