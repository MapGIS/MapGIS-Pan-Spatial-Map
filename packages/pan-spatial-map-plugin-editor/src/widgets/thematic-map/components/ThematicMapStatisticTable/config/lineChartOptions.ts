// 折线图配置
const txtColor = 'rgba(0, 0, 0, 0.5)'
export const lineChartOptions = ({ title, x, y }) => {
  return {
    tooltip: {
      trigger: 'axis'
    },
    grid: {
      y: 20,
      x2: 10,
      y2: 50
    },
    dataZoom: {
      show: true,
      realtime: true,
      bottom: 44,
      height: 8,
      fillerColor: '#40a9ff',
      start: 0,
      end: 30,
      showDetail: false,
      zoomLock: true
    },
    title: {
      left: 'right',
      text: title,
      textStyle: {
        color: txtColor,
        fontSize: 14,
        fontFamily: '微软雅黑'
      }
    },
    xAxis: {
      data: x,
      axisLabel: {
        rotate: -60,
        interval: 0,
        textStyle: {
          fontSize: 10,
          fontFamily: '微软雅黑',
          color: txtColor
        }
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
        textStyle: {
          fontFamily: '微软雅黑',
          color: txtColor
        }
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
        itemStyle: {
          color: '#40a9ff'
        }
      }
    ]
  }
}
