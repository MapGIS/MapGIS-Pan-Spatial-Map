export interface IThematicMapBaseConfig {
  baseIp: string // 主题服务默认 ip
  basePort: string // 主题服务默认 port
  isLocation: boolean // 是否覆盖
  isOverlay: boolean // 是否定位
  startZindex: number // 初始 index 级别
}

export interface IThematicMapSubjectConfig {
  id: string // 节点 id
  title: string // 节点名
  visible: boolean // 是否可见
  nodeType: string // 节点类型panel->list->subject
  type?: string
  config?: {
    type?: string
    data: any[]
  }
  children?: IThematicMapSubjectConfig[]
}

export interface IThematicMap {
  baseConfig: IThematicMapBaseConfig | null
  subjectConfig: IThematicMapSubjectConfig | null
}

export type TModuleType =
  | 'at' // 属性表
  | 'st' // 统计表
  | 'tl' // 时间轴
  | 'sa' // 新建专题图
  | 'mt' // 管理工具栏
export interface IState {
  visible: TModuleType[]
  selectedYear: string | number
  selectedSujectConfig: any
  thematicMapConfig: IThematicMap
}
