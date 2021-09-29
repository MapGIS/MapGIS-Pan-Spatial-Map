import {
  tuple,
  ConfigType,
  ModuleType,
  SubjectType,
  FeatureFormatType,
  NewSubjectConfig,
  ThematicMapSubjectConfigNode
} from './types'
import { resolveFeatureQuery } from './module/mutations'
import thematicMapStore, { mapGetters, mapMutations } from './module'

// 模块列表
const moduleTypeList = Object.keys(ModuleType)

// 是否支持图属联动
const highlightSubjectTypes = tuple<Array<SubjectType>>(
  'SubSectionMap',
  'BaseMapWithGraph',
  'StatisticLabel'
)

// 专题图类型集合
const subjectTypeList: Array<{ label: string; value: SubjectType }> = [
  { value: 'SubSectionMap', label: '分段专题图' },
  { value: 'BaseMapWithGraph', label: '统计专题图' },
  { value: 'StatisticLabel', label: '等级符号专题图' },
  { value: 'Label', label: '聚合标注专题图' },
  { value: 'HexBin', label: '蜂窝图' },
  { value: 'HeatMap', label: '热力图' }
]

export {
  ModuleType,
  SubjectType,
  ConfigType,
  FeatureFormatType,
  NewSubjectConfig,
  ThematicMapSubjectConfigNode,
  moduleTypeList,
  subjectTypeList,
  highlightSubjectTypes,
  thematicMapStore,
  mapGetters,
  mapMutations,
  resolveFeatureQuery
}
