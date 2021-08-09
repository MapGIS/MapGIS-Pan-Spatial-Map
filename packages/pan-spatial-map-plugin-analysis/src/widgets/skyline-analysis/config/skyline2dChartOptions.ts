const txtColor = '#000000a6'

const chartOptions = ({ x, y }) => {
  return {
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'line',
        lineStyle: {
          color: '#41aeff',
          type: 'dashed'
        }
      }
    },
    dataZoom: {
      show: true,
      realtime: true,
      bottom: 50,
      height: 8,
      fillerColor: '#40a9ff',
      start: 0,
      end: 80,
      showDetail: false,
      zoomLock: true
    },
    title: {
      show: false
    },
    xAxis: {
      show: false,
      data: x,
      axisLabel: {
        rotate: 60,
        // interval: 1,
        fontSize: 10,
        fontFamily: '微软雅黑',
        color: txtColor
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

export default chartOptions
