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
        <a-spin :spinning="loading">
          <!-- 时间轴 -->
          <mp-row-flex :span="[2, 22]" v-show="timeList.length">
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
          </mp-row-flex>
          <!-- 空数据友好提示 -->
          <a-empty v-show="!timeList.length" />
        </a-spin>
      </div>
    </mp-window>
  </mp-window-wrapper>
</template>
<script lang="ts">
import { Vue, Component, Watch } from 'vue-property-decorator'
import * as echarts from 'echarts'
import { mapGetters, mapMutations } from '../../store'
import { chartOption } from './config/timeLineChartOption'

@Component({
  computed: {
    ...mapGetters(['loading', 'isVisible', 'selectedTime', 'selectedTimeList'])
  },
  methods: {
    ...mapMutations(['resetVisible', 'setSelectedTime'])
  }
})
export default class ThematicMapTimeLine extends Vue {
  // 图表
  chart: any = null

  // 播放开关
  isPlay = false

  // 当前播放的数据索引
  currentIndex = 0

  // 时间轴的列表数据
  get timeList() {
    return this.selectedTimeList || []
  }

  // 显示开关
  get tlVisible() {
    const visible = this.isVisible('tl')
    const _visible = visible && this.timeList.length > 1
    if (_visible) {
      this.onUpdateChart()
    }
    return _visible
  }

  set tlVisible(nV) {
    if (!nV) {
      this.resetVisible('tl')
    }
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
   * currentIndex变化
   */
  onCurrentIndexChange(value) {
    this.setSelectedTime(this.timeList[value])
    this.onUpdateChart()
  }

  /**
   * selecteTime变化
   */
  onSelecteTimeChange(value) {
    this.currentIndex = value ? this.timeList.indexOf(value) : 0
    this.onUpdateChart()
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
   * 监听:时间轴切换, 存储当前时间数据
   */
  @Watch('currentIndex')
  watchCurrentIndex(nV) {
    this.onCurrentIndexChange(nV)
  }

  /**
   * 监听:属性表时间选项的变化,同步更新时间轴当前选中的项
   */
  @Watch('selectedTime')
  watchTimeList(nV) {
    this.onSelecteTimeChange(nV)
  }

  mounted() {
    this.chart = echarts.init(
      document.getElementById('thematic-map-time-line-chart')
    )
    this.chart.on(
      'timelinechanged',
      ({ currentIndex }) => (this.currentIndex = currentIndex)
    )
    this.onSelecteTimeChange(this.selectedTime)
  }

  beforeDestroy() {
    if (this.chart) {
      this.chart.off('timelinechanged')
    }
  }
}
</script>
<style lang="less" scoped>
@import './index.less';
</style>
