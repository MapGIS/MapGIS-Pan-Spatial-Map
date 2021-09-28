import { defaultColor, splitColor, getGridX } from './chartCommon'
/**
 * 柱状图配置
 * @param param0
 * @returns
 */
export const barChartOptions = ({ color, title, x, y }) => {
  const gridX = getGridX(y)
  const _color = color || defaultColor
  return {
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow',
        shadowStyle: {
          opacity: 0.2,
          color: _color
        }
      },
      textStyle: {
        fontSize: 10
      }
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
    grid: {
      top: 20,
      left: gridX,
      bottom: 40,
      right: 0
    },
    title: {
      text: title,
      left: 'right',
      padding: 0,
      textStyle: {
        fontSize: 14,
        fontFamily: '微软雅黑'
      }
    },
    xAxis: {
      data: x,
      type: 'category',
      axisLabel: {
        rotate: 60,
        interval: 0,
        fontSize: 10,
        fontFamily: '微软雅黑'
      }
    },
    yAxis: {
      type: 'value',
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
        type: 'bar',
        data: y,
        barWidth: 10,
        itemStyle: {
          color: _color
        }
      }
    ]
  }
}
