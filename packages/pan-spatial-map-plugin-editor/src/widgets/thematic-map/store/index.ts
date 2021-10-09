import {
  tuple,
  ConfigType,
  ModuleType,
  FeatureFormatType,
  ISubjectType,
  ISubjectData,
  INewSubjectConfig,
  ISubjectConfigNode
} from './types'
import { featureQueryFn } from './module/mutations'
import thematicMapStore, { mapGetters, mapMutations } from './module'

// 功能模块列表
const moduleTypeList = Object.keys(ModuleType)

// 支持图属联动的专题图集合
const hasHighlightSubjectList = tuple<Array<ISubjectType>>(
  'SubSectionMap',
  'BaseMapWithGraph',
  'StatisticLabel'
)

// 专题图类型集合
const subjectTypeList: Array<{ label: string; value: ISubjectType }> = [
  { value: 'SubSectionMap', label: '分段专题图' },
  { value: 'BaseMapWithGraph', label: '统计专题图' },
  { value: 'StatisticLabel', label: '等级符号专题图' },
  { value: 'Label', label: '聚合标注专题图' },
  { value: 'HexBin', label: '蜂窝图' },
  { value: 'HeatMap', label: '热力图' }
]

export {
  ModuleType,
  ConfigType,
  FeatureFormatType,
  ISubjectType,
  ISubjectData,
  INewSubjectConfig,
  ISubjectConfigNode,
  moduleTypeList,
  subjectTypeList,
  hasHighlightSubjectList,
  thematicMapStore,
  featureQueryFn,
  mapGetters,
  mapMutations
}
