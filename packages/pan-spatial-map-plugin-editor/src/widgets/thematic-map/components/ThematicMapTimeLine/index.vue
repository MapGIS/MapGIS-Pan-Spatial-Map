<template>
  <mp-window-wrapper :visible="tlVisible">
    <mp-window title="时间轴" :visible.sync="tlVisible" anchor="center-center">
      <div class="thematic-map-time-line">
        <div id="thematic-map-time-line-chart" />
        <a-row type="flex" align="middle" justify="space-between">
          <a-col :span="btn.span" v-for="btn in btns" :key="btn.name">
            <a-tooltip placement="bottom" :title="btn.tooltip">
              <a-icon
                class="thematic-map-time-line-btn"
                :type="btn.name"
                @click="btn.func"
              />
            </a-tooltip>
          </a-col>
        </a-row>
        <div
          class="thematic-map-time-line-chart-mask"
          v-show="!timeLineList.length"
        >
          暂无年度数据
        </div>
      </div>
    </mp-window>
  </mp-window-wrapper>
</template>
<script lang="ts">
/**
 * @description 时间轴
 */
import { Mixins, Component, Watch } from 'vue-property-decorator'
import { WidgetMixin } from '@mapgis/web-app-framework'
import { ThematicMapInstance } from '@mapgis/pan-spatial-map-store'
import echarts from 'echarts'
import { chartOption } from './config/timeLineChartOption'

@Component
export default class ThematicMapTimeLine extends Mixins<{ [k: string]: any }>(
  WidgetMixin
) {
  tlVisible = false

  // 图表
  chart: any = null

  // 播放开关
  isPlay = false

  // 当前播放的数据索引
  currentIndex = 0

  get visible() {
    return ThematicMapInstance.isVisible('tl')
  }

  // 年度列表数据
  get timeLineList() {
    return [2013, 2014, 2015, 2017, 2020, 2021]
  }

  /**
   * 时间轴操作按钮
   */
  get btns() {
    let playName = 'play-circle'
    let playTooltip = '播放'
    if (this.isPlay) {
      playName = 'pause-circle'
      playTooltip = '暂停'
    }
    return [
      { name: 'redo', tooltip: '重置', span: 5, func: this.reset },
      { name: 'backward', tooltip: '上一年', span: 6, func: this.prev },
      { name: playName, tooltip: playTooltip, span: 6, func: this.btnPlay },
      { name: 'forward', tooltip: '下一年', span: 6, func: this.next }
    ]
  }

  /**
   * 图表初始化
   */
  onUpdateChart() {
    if (this.chart) {
      this.chart.setOption(
        chartOption({
          currentIndex: this.currentIndex,
          autoPlay: this.isPlay,
          data: this.timeLineList
        })
      )
      this.chart.resize()
    }
  }

  /**
   * 播放或暂停
   */
  btnPlay() {
    this.isPlay = this.timeLineList.length > 1 ? !this.isPlay : false
  }

  /**
   * 下一个
   */
  next() {
    if (this.currentIndex < this.timeLineList.length - 1) {
      this.currentIndex++
    }
  }

  /**
   * 上一个
   */
  prev() {
    if (this.currentIndex > 0) {
      this.currentIndex--
    }
  }

  /**
   * 重置
   */
  reset() {
    this.currentIndex = 0
    this.isPlay = false
  }

  /**
   * 监听时间轴变化
   */
  @Watch('currentIndex')
  watchCurrentIndex(nV) {
    ThematicMapInstance.setSelectedYear(this.timeLineList[nV])
    this.onUpdateChart()
  }

  /**
   * 监听弹框开关
   */
  @Watch('visible')
  watchVisible(nV) {
    this.tlVisible = nV
    this.$nextTick(() => nV && this.onUpdateChart())
  }

  mounted() {
    this.chart = echarts.init(
      document.getElementById('thematic-map-time-line-chart')
    )
    this.chart.on(
      'timelinechanged',
      ({ currentIndex }) => (this.currentIndex = currentIndex)
    )
  }

  beforeDestroyed() {
    if (this.chart) {
      this.chart.off('timelinechanged')
    }
  }
}
</script>
<style lang="less" scoped>
@import './index.less';
</style>
