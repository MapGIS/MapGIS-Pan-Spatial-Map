import { ModuleType, ISubjectType, IGettersResult } from './types'
import state from './state'
import getters from './getters'
import mutations from './mutations'

// 功能模块缩写
export const moduleTypes: ModuleType[] = ['at', 'st', 'tl', 'mt']

// 专题图类型集合
export const subjectTypes: ISubjectType[] = [
  { value: 'SubSectionMap', label: '分段专题图' },
  { value: 'BaseMapWithGraph', label: '统计专题图' },
  { value: 'StatisticLabel', label: '等级符号专题图' },
  { value: 'Label', label: '聚合标注专题图' },
  { value: 'HeatMap', label: '热力图' },
  { value: 'HexBin', label: '蜂窝图' }
]

export const mapGetters = (arr: Array<keyof IGettersResult>) => {
  return Object.entries(getters).reduce((obj, [fnName, fn]) => {
    if (arr.includes(fnName as keyof IGettersResult)) {
      obj[fnName] = () => fn(state, getters)
    }
    return obj
  }, {})
}

export const mapMutations = (arr: string[]) => {
  return Object.entries(mutations).reduce((obj, [fnName, fn]) => {
    if (arr.includes(fnName)) {
      obj[fnName] = (payload: never) => {
        const _getters = Object.entries(getters).reduce((obj, [fnName, fn]) => {
          obj[fnName] = fn(state, getters)
          return obj
        }, {} as Record<keyof IGettersResult, any>)
        return fn(
          {
            state,
            getters: _getters
          },
          payload
        )
      }
    }
    return obj
  }, {})
}
