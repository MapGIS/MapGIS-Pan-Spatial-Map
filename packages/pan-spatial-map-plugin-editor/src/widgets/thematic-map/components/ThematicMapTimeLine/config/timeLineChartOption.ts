// 时间轴图表配置
interface IParams {
  data: Array<string | number>
  currentIndex: number
  autoPlay: boolean
}
const txtColor = 'rgba(0, 0, 0, 0.7)'
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
          itemSize: 15,
          itemGap: 5,
          normal: {
            color: txtColor
          },
          emphasis: {
            color: '#1e90ff'
          },
          showPlayBtn: false
        },
        lineStyle: {
          color: txtColor,
          width: 1,
          type: 'dotted'
        },
        checkpointStyle: {
          symbol: 'diamond',
          symbolSize: 14,
          borderColor: txtColor,
          borderWidth: 'auto',
          label: {
            show: false,
            textStyle: {
              color: 'auto'
            }
          }
        },
        trigger: 'axis',
        axisPointer: {
          type: 'shadow'
        }
      },
      tooltip: {
        position: 'top'
      }
    }
  }
}
