<template>
  <div :id="id" class="time-line-chart" />
</template>

<script lang="ts">
import { Component, Vue, Prop, Watch } from 'vue-property-decorator'
import echarts from 'echarts'

export interface ITimeLineList {
  name: string // 节点名称
  guid: string // 图层唯一标识
}

@Component
export default class TimeLine extends Vue {
  @Prop() id!: string

  @Prop({ default: 0 }) value!: number

  @Prop({ default: () => [] }) timeLineList!: Array<ITimeLineList>

  @Prop({ default: 3 }) playInterval!: number

  @Prop({ default: false }) autoPlay!: boolean

  Chart: any | null = null

  get timelineOptions() {
    console.log('timelineOptions', this.timeLineList)

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
          label: {
            formatter(s) {
              return new Date(s).getFullYear()
            }
          },
          left: 0,
          right: 0,
          padding: 0,
          symbol: 'diamond',
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
          }
        },
        tooltip: {},
        series: []
      }
    }
  }

  @Watch('timelineOptions', { deep: true })
  timelineOptionsChange() {
    this.init()
  }

  resize() {
    if (this.Chart) {
      this.Chart.resize(0)
    }
  }

  init() {
    if (!this.Chart) {
      this.Chart = echarts.init(document.getElementById(this.id) as HTMLElement)
      this.Chart.on('timelinechanged', ({ currentIndex }) => {
        this.$emit('input', currentIndex)
      })
    }
    this.Chart.setOption(this.option, true)
  }

  mounted() {
    this.init()
  }

  beforeDestroyed() {
    if (this.Chart) {
      this.Chart.off('timelinechanged')
    }
  }
}
</script>

<style lang="less" scoped>
.time-line-chart {
  width: 300px;
  height: 48px;
  margin: 10px 0 20px;
}
</style>
