import { LayerType, Feature } from '@mapgis/web-app-framework'

export const tuple = <T extends string[]>(...args: T) => args

// 要素查询的数据格式
export enum FeatureFormatType {
  json = 'json',
  geojson = 'geojson'
}

// 节点类型
type NodeType = 'panel' | 'list' | 'subject'

// 专题图配置
export enum ConfigType {
  doc = 'doc',
  gdbp = 'gdbp',
  geojson = 'geojson',
  excel = 'excel'
}

// 专题图专题功能模块
export enum ModuleType {
  TABLE = 'TABLE', // 属性表
  GRAPH = 'GRAPH', // 统计表
  TIMELINE = 'TIMELINE', // 时间轴
  CREATE = 'CREATE', // 新建专题图
  TOOLS = 'TOOLS' // 管理工具栏
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
export type ISubjectType =
  | 'SubSectionMap'
  | 'DataShowSubject'
  | 'HeatMap'
  | 'BaseMapWithGraph'
  | 'StatisticLabel'
  | 'Label'
  | 'HexBin'
  | string

// 专题图配置
export interface ISubjectData {
  subjectType: ISubjectType
  configType: keyof ConfigType
  time?: string
  ip?: string
  port?: string
  gdbp?: string
  docName?: string
  layerName?: string
  layerIndex?: string
  serverType?: LayerType
  field?: string
  table?: {
    showFields: string[]
    showFieldsTitle?: Record<string, string>
  }
  graph?: {
    showFields: string[]
    showFieldsTitle?: Record<string, string>
    field: string
  }
  popup?: {
    showFields: string[]
    showFieldsTitle?: Record<string, string>
    title: string
  }
}

export interface ISubjectConfigBase {
  id: string // 节点名
  title: string // 节点名
  visible: boolean // 是否可见
  nodeType: NodeType // 节点类型panel->list->subject
}

// 旧专题配置
interface IOldSubjectConfig extends ISubjectConfigBase {
  children?: IOldSubjectConfig[] // 子节点数据,panel和list有,subject没有
  type?: ISubjectType // 专题类型
  config?: {
    type?: keyof ConfigType // 数据请求方式
    data:
      | Array<ISubjectData>
      | Array<{
          time: string
          subData: Array<ISubjectData>
        }>
  }
}

// 新专题配置
export interface INewSubjectConfig extends ISubjectConfigBase {
  parentId: string // 父节点ID
  parentTitle: string // 父节点Title
  type: ISubjectType
  config: Array<ISubjectData>
}

// 专题图基础配置
export interface IBaseConfig {
  baseIp: string // 主题服务默认 ip
  basePort: string // 主题服务默认 port
  isLocation: boolean // 是否覆盖
  isOverlay: boolean // 是否定位
  startZindex: number // 初始 index 级别
}

// 专题图专题配置树的节点
export type ISubjectConfigNode =
  | IOldSubjectConfig
  | INewSubjectConfig
  | null
  | undefined

export interface IFeatureQueryParams {
  ip: string
  port: string
  gdbp: string
  docName: string
  layerIndex: string
  layerName?: string
  fields?: string
  page?: number
  pageCount?: number
  IncludeAttribute?: boolean
  IncludeGeometry?: boolean
  IncludeWebGraphic?: boolean
  configType?: ConfigType
}

export interface State {
  modules: Array<ModuleType>
  loading: boolean
  pageGeojson: Feature.FeatureIGSGeoJSON | null
  subjectData: ISubjectData | null
  selectedSubjectTime: string
  selectedSubjectTimeList: Array<string>
  selectedSubject?: ISubjectConfigNode
  selectedSubjectList: Array<ISubjectConfigNode>
  baseConfig?: IBaseConfig | null
  subjectConfig: Array<ISubjectConfigNode>
  linkageFid: string
}
