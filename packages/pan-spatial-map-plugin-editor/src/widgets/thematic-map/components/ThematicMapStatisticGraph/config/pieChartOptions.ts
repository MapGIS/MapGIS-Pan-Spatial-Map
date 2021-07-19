interface IPieData {
  name: string
  value: string | number
}
// 饼图配置
export const pieChartOptions = ({ title, x, y }) => {
  const data = x.reduce((result: IPieData[], item: string, i: number) => {
    const pie = {
      name: '',
      value: 0
    }
    pie.name = item
    pie.value = y[i]
    result.push(pie)
    return result
  }, [])

  return {
    title: {
      text: title,
      left: 'right',
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
