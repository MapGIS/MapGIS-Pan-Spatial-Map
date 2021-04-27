// 饼图配置
export const pieChartOptions = ({ title, data }) => {
  return {
    title: {
      text: title,
      left: 'center',
      textStyle: {
        fontSize: 14,
        fontFamily: '微软雅黑'
      }
    },
    tooltip: {
      trigger: 'item',
      textStyle: {
        fontSize: 10,
        fontFamily: '微软雅黑'
      },
      formatter: '{b} : {c} ({d}%)'
    },
    series: [
      {
        type: 'pie',
        radius: '65%',
        center: ['50%', '50%'],
        label: {
          show: true,
          position: 'outside'
        },
        data
      }
    ]
  }
}
