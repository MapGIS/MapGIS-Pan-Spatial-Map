import { LayerType, Feature } from '@mapgis/web-app-framework'

export const tuple = <T extends string[]>(...args: T) => args

// 节点类型
type NodeType = 'panel' | 'list' | 'subject'

// 专题图配置
export enum ConfigType {
  doc = 'doc',
  gdbp = 'gdbp',
  geojson = 'geojson',
  excel = 'excel'
}

// 要素查询的数据格式
export enum FeatureFormatType {
  json = 'json',
  geojson = 'geojson'
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
export type SubjectType =
  | 'SubSectionMap'
  | 'DataShowSubject'
  | 'HeatMap'
  | 'BaseMapWithGraph'
  | 'StatisticLabel'
  | 'Label'
  | 'HexBin'
  | string

// 专题图配置
export interface ISubjectConfigItem {
  subjectType?: SubjectType
  configType?: keyof ConfigType
  time?: string
  ip?: string
  port?: string
  gdbp?: string
  docName?: string
  layerName?: string
  layerIndex?: string
  serverType?: LayerType
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

export interface IConfigBase {
  id: string // 节点名
  title: string // 节点名
  visible: boolean // 是否可见
  nodeType: NodeType // 节点类型panel->list->subject
}

// 旧专题配置
interface OldSubjectConfig extends IConfigBase {
  children?: OldSubjectConfig[] // 子节点数据,panel和list有,subject没有
  type?: SubjectType // 专题类型
  config?: {
    type?: keyof ConfigType // 数据请求方式
    data:
      | Array<ISubjectConfigItem>
      | Array<{
          time: string
          subData: Array<ISubjectConfigItem>
        }>
  }
}

// 新专题配置
export interface NewSubjectConfig extends IConfigBase {
  parentId: string // 父节点ID
  parentTitle: string // 父节点Title
  type: SubjectType
  config: Array<ISubjectConfigItem>
}

// 专题图基础配置
export interface ThematicMapBaseConfig {
  baseIp: string // 主题服务默认 ip
  basePort: string // 主题服务默认 port
  isLocation: boolean // 是否覆盖
  isOverlay: boolean // 是否定位
  startZindex: number // 初始 index 级别
}

// 专题图专题配置树的节点
export type ThematicMapSubjectConfigNode =
  | OldSubjectConfig
  | NewSubjectConfig
  | null
  | undefined

// 图属联动项
export interface LinkageItem {
  from: string
  itemIndex: number
  marker?: {
    fid: string
    markerId: string
    img: string
    coordinates: number[]
    feature: Feature.GFeature
    properties: Feature.GFeature['properties']
  }
}

// 分页配置
export interface PageParam {
  page: number
  pageCount: number
}

// 专题数据: 旧版本的请求方式提取到了外层, 新版本直接根据配置项里的gdbp|docName判断
export interface SubjectData {
  configType?: keyof ConfigType
  subjectType: SubjectType
  [k: string]: any
}

export interface IState {
  modules: Array<ModuleType>
  loading: boolean
  pageParam: PageParam
  pageDataSet: Feature.FeatureIGS | null
  subjectData: SubjectData | null
  selectedSubjectTime: string
  selectedSubjectTimeList: Array<string>
  selectedSubject?: ThematicMapSubjectConfigNode
  selectedSubjectList: Array<ThematicMapSubjectConfigNode>
  baseConfig?: ThematicMapBaseConfig | null
  subjectConfig: Array<ThematicMapSubjectConfigNode>
  linkageItem: LinkageItem | null
}

export interface IResolveQueryParams {
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
