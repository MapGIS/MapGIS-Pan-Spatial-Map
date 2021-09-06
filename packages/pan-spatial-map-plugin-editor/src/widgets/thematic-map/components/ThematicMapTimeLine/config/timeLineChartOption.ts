// 时间轴图表配置
interface IParams {
  data: Array<string | number>
  currentIndex: number
  autoPlay: boolean
}

export const chartOption = (params: IParams) => {
  return {
    baseOption: {
      timeline: {
        ...params,
        playInterval: 3000,
        axisType: 'category',
        symbol: 'diamond',
        padding: 0,
        left: 0,
        right: 0,
        controlStyle: {
          showPlayBtn: false
        },
        trigger: 'axis',
        axisPointer: {
          type: 'shadow'
        }
      },
      tooltip: {
        position: 'bottom'
      }
    }
  }
}
