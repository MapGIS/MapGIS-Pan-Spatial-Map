export const splitColor = '#d9d9d9'

export const defaultColor = '#1890ff'
/**
 * 调整y轴宽度
 * @param y y轴数据
 */
export const getGridX = (y: number[]) => {
  let gridX = 80
  const strMax = `${Math.max(...y)}`
  const index = strMax.indexOf('.')
  const numLength =
    index !== -1 ? strMax.substring(0, index).length : strMax.length
  const twoDimensionArr: Array<Array<number>> = [[1, 2, 3], [4, 5], [6, 7], [8]]
  twoDimensionArr.forEach((arr: number[]) => {
    if (arr.includes(numLength)) {
      gridX = Math.max(...arr) * 10
    }
  })
  return gridX
}
