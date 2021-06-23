import { Feature } from '@mapgis/web-app-framework'

// 基础配置
export interface IThematicMapBaseConfig {
  baseIp: string // 主题服务默认 ip
  basePort: string // 主题服务默认 port
  isLocation: boolean // 是否覆盖
  isOverlay: boolean // 是否定位
  startZindex: number // 初始 index 级别
}

/**
 * 专题类型:
 * 分段专题图 : SubSectionMap
 * 普通专题图 : DataShowSubject
 * 热力图 : HeatMap
 * 统计专题图 : BaseMapWithGraph
 * 普通静态标注 : StatisticLabel
 * 标注专题图 : Label
 * 蜂窝图 : HexBin
 */
type SubjectType =
  | 'SubSectionMap'
  | 'DataShowSubject'
  | 'HeatMap'
  | 'BaseMapWithGraph'
  | 'StatisticLabel'
  | 'Label'
  | 'HexBin'
  | string

// 专题服务配置
type ConfigType = 'gdbp' | 'doc' | 'geojson' | 'excel'
export interface IThematicMapSubjectConfig {
  id: string // 节点名
  title: string // 节点名
  visible: boolean // 是否可见
  nodeType: string // 节点类型panel->list->subject
  children?: IThematicMapSubjectConfig[] // 子节点数据,panel和list有,subject没有
  type?: SubjectType // 专题类型(nodeType == subject)
  config?: {
    type?: ConfigType // 数据请求方式
    data?: {
      time: string // 年度
      subData: any[] // 年度对应的配置数据
    }[] // 专题配置集合(nodeType == subject)
  }
}

// 点击单个专题的数据展示弹框类型
export type ModuleType =
  | 'at' // 属性表
  | 'st' // 统计表
  | 'tl' // 时间轴
  | 'sa' // 新建专题图
  | 'mt' // 管理工具栏

export interface ISubjectType {
  label: string
  value: SubjectType
}

interface IPageParam {
  page: number
  pageCount: number
}

export interface IState {
  moduleTypes: ModuleType[]
  loading: boolean
  pageParam: IPageParam
  pageDataSet: Feature.FeatureIGS | null
  selected: string
  selectedTime: string
  selectedSubConfig: {
    configType: ConfigType
    subjectType: SubjectType
    [k: string]: any
  } | null
  selectedTimeList: string[]
  selectedList: IThematicMapSubjectConfig[]
  subjectConfig: IThematicMapSubjectConfig | null
  baseConfig: IThematicMapBaseConfig | null
}
