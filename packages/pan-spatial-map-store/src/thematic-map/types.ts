export type IThematicMapKeys = 'baseConfig' | 'subjectConfig' | string

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
  baseConfig: IThematicMapBaseConfig
  subjectConfig: IThematicMapSubjectConfig
}

export interface IThematicMapClass {
  thematicMapConfig?: IThematicMap

  currentSujectConfig?: IThematicMapSubjectConfig

  currentYear: string | number

  getConfig<
    U = IThematicMapBaseConfig | IThematicMapSubjectConfig | IThematicMap
  >(
    name: IThematicMapKeys
  ): U

  getBaseConfig(): IThematicMapBaseConfig

  getSubjectConfig(): IThematicMapSubjectConfig

  getCurrentYear(): string | number

  setThematicMapConfig(config: IThematicMap): void

  setCurrentSujectConfig(config: IThematicMapSubjectConfig): void

  setCurrentYear(year?: string | number): void

  resetThematicMapConfig(): void
}
