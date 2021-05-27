import { FeatureIGS } from '../service'
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

// 专题服务基础配置
export interface IThematicMapBaseConfig {
  baseIp: string // 主题服务默认 ip
  basePort: string // 主题服务默认 port
  isLocation: boolean // 是否覆盖
  isOverlay: boolean // 是否定位
  startZindex: number // 初始 index 级别
}

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

export interface IThematicMapConfig {
  baseConfig: IThematicMapBaseConfig | object
  subjectConfig: IThematicMapSubjectConfig | object
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
  pageDataSet: FeatureIGS | null
  selectedTime: string
  selectedTimeList: string[]
  selected: string
  selectedList: IThematicMapSubjectConfig[]
  thematicMapConfig: IThematicMapConfig
}

export interface IGetters {
  isVisible: (s: IState) => (t: ModuleType) => boolean
  loading: (s: IState) => boolean
  selected: (s: IState) => string
  selectedList: (s: IState) => IThematicMapSubjectConfig[]
  selectedTime: (s: IState) => string
  pageDataSet: (s: IState) => FeatureIGS | null
  baseConfig: (s: IState) => IThematicMapSubjectBaseConfig | object
  subjectConfig: (s: IState) => IThematicMapSubjectNewConfig | undefined
  configSubData: (s: IState, g: IGetters) => any
  configTimeList: (s: IState, g: IGetters) => string[]
}

interface IGettersResult {
  isVisible: (t: ModuleType) => boolean
  loading: boolean
  selected: string
  selectedList: IThematicMapSubjectConfig[]
  selectedTime: string
  pageDataSet: FeatureIGS | null
  baseConfig: IThematicMapSubjectBaseConfig | object
  subjectConfig: IThematicMapSubjectNewConfig | undefined
  configSubData: any
  configTimeList: string[]
}
export interface IContext {
  state: IState
  getters: IGettersResult
}
