import { Feature } from '@mapgis/web-app-framework'

// 节点类型
type NodeType = 'panel' | 'list' | 'subjet'
// 专题服务配置
type ServerType = 'gdbp' | 'doc' | 'geojson' | 'excel'
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
export interface IConfigBase {
  id: string // 节点名
  title: string // 节点名
  visible: boolean // 是否可见
  nodeType: NodeType // 节点类型panel->list->subject
}

// 旧专题配置
export interface OldSubjectConfig extends IConfigBase {
  children?: OldSubjectConfig[] // 子节点数据,panel和list有,subject没有
  type?: SubjectType // 专题类型
  config?: {
    type?: ServerType // 数据请求方式
    data:
      | Array<{
          time: string
          [k: string]: any
        }>
      | Array<{
          time: string
          subData: Array<Record<string, any>>
        }>
  }
}

// 新专题配置
export interface NewSubjectConfig extends IConfigBase {
  parentId: string // 父节点名
  type: SubjectType
  config: Array<{
    time: string
    [k: string]: any
  }>
}

// 基础配置
export interface SubjectBaseConfig {
  baseIp: string // 主题服务默认 ip
  basePort: string // 主题服务默认 port
  isLocation: boolean // 是否覆盖
  isOverlay: boolean // 是否定位
  startZindex: number // 初始 index 级别
}

// 点击单个专题的数据展示弹框类型
export type ModuleType =
  | 'at' // 属性表
  | 'st' // 统计表
  | 'tl' // 时间轴
  | 'sa' // 新建专题图
  | 'mt' // 管理工具栏

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

// 旧版本的请求方式提取到了外层, 新版本直接根据配置项里的gdbp|docName判断
export interface SelectedSubConfig {
  configType?: ServerType
  subjectType: SubjectType
  [k: string]: any
}

export interface IState {
  loading: boolean
  moduleTypes: Array<ModuleType>
  pageParam: PageParam
  pageDataSet: Feature.FeatureIGS | null
  selected: string
  selectedTime: string
  selectedSubConfig: SelectedSubConfig | null
  selectedTimeList: Array<string>
  selectedList: Array<OldSubjectConfig | NewSubjectConfig>
  newSubjectConfig: NewSubjectConfig | null
  subjectConfig: OldSubjectConfig | NewSubjectConfig | null
  baseConfig: SubjectBaseConfig | null
  linkageItem: LinkageItem | null
}
