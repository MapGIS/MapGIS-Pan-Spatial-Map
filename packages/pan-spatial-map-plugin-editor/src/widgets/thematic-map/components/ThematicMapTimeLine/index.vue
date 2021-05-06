<template>
  <!-- 时间轴 -->
  <mp-window-wrapper :visible="tlVisible">
    <mp-window
      title="时间轴"
      :visible.sync="tlVisible"
      anchor="bottom-center"
      :verticalOffset="30"
    >
      <div class="thematic-map-time-line">
        <!-- 时间轴 -->
        <row-flex :span="[2, 22]" v-show="timeList.length">
          <template #label>
            <a-tooltip placement="bottom" :title="autoPlay.tooltip">
              <a-icon
                class="thematic-map-time-line-btn"
                :type="autoPlay.type"
                @click="btnPlay"
              />
            </a-tooltip>
          </template>
          <div id="thematic-map-time-line-chart" />
        </row-flex>
        <!-- 空数据友好提示 -->
        <a-empty :image="simpleImage" v-show="!timeList.length" />
      </div>
    </mp-window>
  </mp-window-wrapper>
</template>
<script lang="ts">
import { Mixins, Component, Watch } from 'vue-property-decorator'
import { WidgetMixin } from '@mapgis/web-app-framework'
import { ThematicMapInstance } from '@mapgis/pan-spatial-map-store'
import { Empty } from 'ant-design-vue'
import echarts from 'echarts'
import RowFlex from '../RowFlex'
import { chartOption } from './config/timeLineChartOption'

@Component({
  components: {
    RowFlex
  }
})
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

  // 显示开关
  get visible() {
    return ThematicMapInstance.isVisible('tl')
  }

  // 属性表或者时间轴选中的时间数据
  get selectedTime() {
    return ThematicMapInstance.getSelectedTime
  }

  // 时间轴的列表数据
  get timeList() {
    return ThematicMapInstance.getSelectedTimeList
  }

  // 播放文案和提示设置
  get autoPlay() {
    let type = 'play-circle'
    let tooltip = '播放'
    if (this.isPlay) {
      type = 'pause-circle'
      tooltip = '暂停'
    }
    return { type, tooltip }
  }

  /**
   * 更新图表
   */
  onUpdateChart() {
    this.$nextTick(() => {
      if (this.chart) {
        this.chart.setOption(
          chartOption({
            currentIndex: this.currentIndex,
            autoPlay: this.isPlay,
            data: this.timeList
          })
        )
        this.chart.resize()
      }
    })
  }

  /**
   * 播放或暂停
   */
  btnPlay() {
    this.isPlay = this.timeList.length > 1 ? !this.isPlay : false
    this.onUpdateChart()
  }

  /**
   * 重置
   */
  reset() {
    this.currentIndex = 0
    this.isPlay = false
  }

  /**
   * 监听弹框开关
   */
  @Watch('visible')
  watchVisible(nV) {
    this.tlVisible = nV
    nV && this.onUpdateChart()
  }

  /**
   * 监听:时间轴切换, 存储当前时间数据
   */
  @Watch('currentIndex')
  watchCurrentIndex(nV) {
    ThematicMapInstance.setSelectedTime(this.timeList[nV])
    this.onUpdateChart()
  }

  /**
   * 监听:属性表时间选项的变化,同步更新时间轴当前选中的项
   */
  @Watch('selectedTime')
  watchTimeList(nV) {
    const _index = this.timeList.indexOf(nV)
    if (!_index || this.currentIndex !== _index) {
      this.currentIndex = _index
      this.onUpdateChart()
    }
  }

  beforeCreate() {
    this.simpleImage = Empty.PRESENTED_IMAGE_SIMPLE
  }

  mounted() {
    this.tlVisible = this.visible
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
