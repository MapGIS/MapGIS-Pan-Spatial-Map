<template>
  <div :id="id" class="time-line-chart" />
</template>

<script lang="ts">
import { Component, Vue, Prop, Watch } from 'vue-property-decorator'
import * as echarts from 'echarts'

@Component
export default class TimeLine extends Vue {
  @Prop() id!: string

  @Prop({ default: 0 }) value!: number

  @Prop({ default: () => [] }) timeLineList!: Array<string>

  @Prop({ default: 3 }) playInterval!: number

  @Prop({ default: false }) autoPlay!: boolean

  chart: any | null = null

  get timelineOptions() {
    return {
      currentIndex: this.value,
      autoPlay: this.autoPlay,
      playInterval: this.playInterval * 1000,
      data: this.timeLineList
    }
  }

  get option() {
    return {
      baseOption: {
        timeline: {
          ...this.timelineOptions,
          axisType: 'category',
          symbol: 'diamond',
          padding: 0,
          left: 0,
          right: 0,
          controlStyle: {
            itemSize: 15,
            itemGap: 5,
            normal: { color: '#333' },
            emphasis: { color: '#1e90ff' },
            showPlayBtn: false
          },
          lineStyle: { color: '#666', width: 1, type: 'dashed' },
          checkpointStyle: {
            symbol: 'diamond',
            symbolSize: 14,
            borderColor: 'auto',
            borderWidth: 'auto',
            label: { show: false, textStyle: { color: 'auto' } }
          },
          trigger: 'axis',
          axisPointer: {
            // 坐标轴指示器，坐标轴触发有效
            type: 'shadow' // 默认为直线，可选为：'line' | 'shadow'
          }
        },
        tooltip: {
          position: 'bottom'
        }
      }
    }
  }

  get chartEl() {
    return document.getElementById(this.id)
  }

  @Watch('timelineOptions', { deep: true })
  timelineOptionsChange() {
    this.chart.setOption(this.option, true)
  }

  resize(width) {
    if (this.chart) {
      this.chartEl.style.width = width
      this.chart.resize({ width })
    }
  }

  mounted() {
    this.chart = echarts.init(this.chartEl as HTMLDivElement)
    this.chart.on('timelinechanged', ({ currentIndex }) =>
      this.$emit('input', currentIndex)
    )
    this.chart.setOption(this.option, true)
  }

  beforeDestroy() {
    if (this.chart) {
      this.chart.off('timelinechanged')
    }
  }
}
</script>

<style lang="less" scoped>
.time-line-chart {
  width: 400px;
  height: 48px;
  margin: 10px 0 10px;
}
</style>
