const txtColor = '#000000a6'

const chartOptions = ({ x, y }) => {
  return {
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'line',
        lineStyle: {
          color: '#41aeff',
          type: 'solid'
        }
      },
      textStyle: {
        fontSize: 10
      }
    },
    title: {
      show: false
    },
    grid: {
      top: 20,
      left: 25,
      right: 0,
      bottom: 20,
      contentLabel: false
    },
    xAxis: {
      show: false,
      data: x,
      axisLabel: {
        rotate: 60,
        fontSize: 10,
        fontFamily: '微软雅黑',
        color: txtColor
      }
    },
    yAxis: {
      min: 0,
      max: 1,
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

export default chartOptions
