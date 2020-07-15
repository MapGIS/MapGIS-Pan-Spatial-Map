// 区块
export interface ILayoutBlock {
  // 区块名称（对应布局元数据配置的block属性）
  name: string
  // 组件的插槽名称
  slotName: string
  // 插槽所要渲染的组件名称
  component: string
  // 附加给组件的参数
  props: Record<string, unknown>
}

// 布局
export interface ILayout {
  // 布局标识
  id: string
  // 布局采用的组件名称
  component: string
  // 主入口文件路径
  mainJson?: string
  // 主题文件路径
  themeJson?: string
  // 区块列表
  blocks: ILayoutBlock[]
}

// 项目
export interface IScaffold {
  // 当前激活的布局标识
  active: string
  // 缺省的主入口文件路径
  defaultMainJson: string
  // 缺省的主题文件路径
  defaultThemeJson: string
  // 布局列表
  layouts: ILayout[]
}

export interface ILayoutElementConfig {
  type: 'Component' | 'Widget' | 'Layout'
  dependencies: string[]
  data: unknown[]
}
