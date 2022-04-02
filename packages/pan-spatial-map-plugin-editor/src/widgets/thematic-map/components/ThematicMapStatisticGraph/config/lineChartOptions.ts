import { defaultColor, splitColor, getGridX } from './chartCommon'

/**
 * 折线图配置
 * @param param0
 * @returns
 */
export const lineChartOptions = ({ color, title, x, y }) => {
  const gridX = getGridX(y)
  const _color = color || defaultColor
  return {
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'line',
        lineStyle: {
          color: _color,
          type: 'dashed'
        }
      }
    },
    grid: {
      top: 20,
      left: gridX,
      bottom: 40,
      right: 0
    },
    dataZoom: {
      show: true,
      realtime: true,
      bottom: 40,
      height: 8,
      fillerColor: color,
      start: 0,
      end: 70,
      showDetail: false,
      zoomLock: true
    },
    title: {
      left: 'right',
      text: title,
      padding: 0,
      textStyle: {
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
        fontFamily: '微软雅黑'
      }
    },
    yAxis: {
      axisLabel: {
        fontFamily: '微软雅黑'
      },
      axisTick: {
        show: true
      },
      axisLine: {
        show: true
      },
      splitLine: {
        lineStyle: {
          color: splitColor,
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
          color: _color
        }
      }
    ]
  }
}
