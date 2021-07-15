import { ModuleType, ISubjectType } from './types'
import thematicMapStore, { mapGetters, mapMutations } from './module'

// 专题图类型集合
const subjectTypeList: ISubjectType[] = [
  { value: 'SubSectionMap', label: '分段专题图' },
  { value: 'BaseMapWithGraph', label: '统计专题图' },
  { value: 'StatisticLabel', label: '等级符号专题图' },
  { value: 'Label', label: '聚合标注专题图' },
  { value: 'HeatMap', label: '热力图' },
  { value: 'HexBin', label: '蜂窝图' }
]

export {
  ModuleType,
  subjectTypeList,
  thematicMapStore,
  mapGetters,
  mapMutations
}
