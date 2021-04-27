// 柱状图配置
const txtColor = 'rgba(0, 0, 0, 0.5)'
export const barChartOptions = ({ title, x, y }) => {
  return {
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow'
      },
      textStyle: {
        fontSize: 10
      },
      formatter(params: any) {
        let res = params[0].name
        for (let i = 0; i < params.length; i += 1) {
          res += `<br/>${params[i].seriesName} : ${params[i].value}`
        }
        return res
      }
    },
    dataZoom: {
      show: true,
      realtime: true,
      bottom: 44,
      height: 8,
      fillerColor: '#40a9ff',
      startValue: 1,
      endValue: 14,
      showDetail: false,
      zoomLock: true
    },
    grid: {
      y: 20,
      x2: 10,
      y2: 50
    },
    title: {
      text: title,
      left: 'right',
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
        name: '',
        type: 'bar',
        data: y,
        barWidth: 20,
        label: {
          show: true,
          position: 'top',
          formatter: '{c}'
        },
        itemStyle: {
          color: '#40a9ff'
        }
      }
    ]
  }
}
