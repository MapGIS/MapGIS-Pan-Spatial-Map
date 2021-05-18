// 专题服务总配置数据
import { FeatureQueryParam, FeatureIGS } from '../service'

export interface IThematicMapConfig {
  baseConfig: IThematicMapBaseConfig | object
  subjectConfig: IThematicMapSubjectConfig | object
}

// 专题服务基础配置
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

interface IThematicMapSubjectBaseConfig {
  id: string // 节点 id
  title: string // 节点名
  visible: boolean // 是否可见
  nodeType: string // 节点类型panel->list->subject
  children?: IThematicMapSubjectConfig[] // 子节点数据,panel和list有,subject没有
  type?: SubjectType // 专题类型
}

// 单个专题服务专题配置
export interface IThematicMapSubjectConfig
  extends IThematicMapSubjectBaseConfig {
  config?: {
    type?: 'gdbp' | 'doc' | 'geojson' | 'excel' // 数据请求方式
    data?: {
      time: string // 年度
      subData: any[] // 年度对应的配置数据
    }[] // 数据集合
  }
}

// 整合单个专题的config中的type和data为以下的结构,放置在和id同层
export interface IThematicMapSubjectNewConfig
  extends IThematicMapSubjectBaseConfig {
  configType?: string // 请求方式
  configTimeList?: string[] // 配置的年度专题数据集合
  configSubData?: any // 对应年度下的第一个配置数据
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

// 专题服务Store对应的状态数据
export interface IState {
  loading: boolean
  page: number
  pageCount: number
  pageDataSet: FeatureIGS | null
  moduleTypes: ModuleType[]
  thematicMapConfig: IThematicMapConfig
  selectedTime: string
  selectedTimeList: string[]
  selected: string
  selectedList: IThematicMapSubjectConfig[]
}

export interface IMethods {
  parseFeatureQueryParams(): FeatureQueryParam
  setVisible(v: ModuleType): void
  setLoading(b: boolean): void
  setPage(p: number, pc: number): void
  setPageDataSet(a: FeatureIGS): void
  setFeaturesQuery(s?: (a?: any) => void, e?: (e: Event) => void): void
  setThematicMapConfig(v: IThematicMapConfig): void
  setSelected(id: string): void
  setSelectedList(c: IThematicMapSubjectConfig[]): void
  setSelectedTime(y: string): void
  resetVisible(v?: ModuleType): void
}

export interface IComputed {
  isLoading: boolean
  isVisible: (s: ModuleType) => boolean
  pageParam: {
    page: number
    pageCount: number
  }
  getPageDataSet: FeatureIGS | null
  getBaseConfig: IThematicMapBaseConfig | object
  getSubjectConfig: IThematicMapSubjectConfig | object
  getSelected: string
  getSelectedList: IThematicMapSubjectConfig[]
  getSelectedTime: string
  getSelectedTimeList?: string[]
  getSelectedConfig?: IThematicMapSubjectNewConfig
}
