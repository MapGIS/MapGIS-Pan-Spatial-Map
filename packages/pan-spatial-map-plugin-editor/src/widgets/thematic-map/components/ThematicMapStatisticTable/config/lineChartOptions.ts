// 折线图配置
import { txtColor, getGridX } from './barChartOptions'

export const lineChartOptions = ({ title, x, y }) => {
  const gridX = getGridX(y)
  const barGraphWidth = 400 - gridX // 柱状图能够显示数据的宽度
  const barNum = Math.floor(barGraphWidth / 24) // 柱状图中能显示柱状图的个数
  const dataZoomEnd = Math.floor((barNum / x.length) * 100) // 柱状图能显示的比例
  return {
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'line',
        lineStyle: {
          color: 'rgba(65,174,255,1)',
          type: 'dashed'
        }
      }
    },
    grid: {
      x: gridX,
      x2: 10,
      y: 20,
      y2: 50
    },
    dataZoom: {
      show: true,
      realtime: true,
      bottom: 50,
      height: 8,
      fillerColor: '#40a9ff',
      start: 0,
      end: dataZoomEnd,
      showDetail: false,
      zoomLock: true
    },
    title: {
      left: 'right',
      text: title,
      padding: 0,
      textStyle: {
        color: txtColor,
        fontSize: 14,
        fontFamily: '微软雅黑'
      }
    },
    xAxis: {
      data: x,
      axisLabel: {
        rotate: 60,
        interval: 1,
        fontSize: 10,
        fontFamily: '微软雅黑',
        color: txtColor
      },
      axisTick: {
        lineStyle: {
          color: txtColor
        }
      },
      axisLine: {
        lineStyle: {
          color: txtColor
        }
      }
    },
    yAxis: {
      axisLabel: {
        fontFamily: '微软雅黑',
        color: txtColor
      },
      axisTick: {
        lineStyle: {
          color: txtColor
        }
      },
      axisLine: {
        lineStyle: {
          color: txtColor
        }
      },
      splitLine: {
        lineStyle: {
          color: '#d9d9d9',
          type: 'dotted'
        }
      }
    },
    series: [
      {
        type: 'line',
        data: y,
        smooth: true,
        itemStyle: {
          color: '#40a9ff'
        }
      }
    ]
  }
}
