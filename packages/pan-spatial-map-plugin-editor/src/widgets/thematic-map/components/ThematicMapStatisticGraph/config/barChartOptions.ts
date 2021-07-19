export const txtColor = 'rgba(0, 0, 0, 0.5)'
/**
 * 调整y轴宽度
 * @param y<array> y轴数据
 * @returns
 */
export const getGridX = (y: number[]) => {
  let gridX = 80
  const strMax = `${Math.max(...y)}`
  const index = strMax.indexOf('.')
  const numLength =
    index !== -1 ? strMax.substring(0, index).length : strMax.length
  const arrs = [[1, 2, 3], [4, 5], [6, 7], [8]]
  arrs.forEach((arr: number[]) => {
    if (arr.includes(numLength)) {
      gridX = Math.max(...arr) * 10
    }
  })
  return gridX
}

// 柱状图配置
export const barChartOptions = ({ title, x, y }) => {
  const gridX = getGridX(y)

  return {
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow',
        shadowStyle: {
          color: 'rgba(65,174,255,0.2)'
        }
      },
      textStyle: {
        fontSize: 10
      }
    },
    dataZoom: {
      show: true,
      realtime: true,
      bottom: 50,
      height: 8,
      fillerColor: '#40a9ff',
      startValue: 0,
      endValue: 14,
      showDetail: false,
      zoomLock: true
    },
    grid: {
      x: gridX,
      x2: 10,
      y: 20,
      y2: 50
    },
    title: {
      text: title,
      left: 'right',
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
        interval: 0,
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
        name: '',
        type: 'bar',
        data: y,
        barWidth: 20,
        // label: {
        //   show: true,
        //   position: 'top',
        //   formatter: '{c}'
        // },
        itemStyle: {
          color: '#40a9ff'
        }
      }
    ]
  }
}
