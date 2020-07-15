export class LayoutComponent {
  // 标识
  id: string

  // 图标
  icon: string

  // 显示标签
  label?: string

  // 类型
  type: 'Link' | 'Component'

  // 链接地址
  to?: string

  // 引用组件
  component?: string

  // 附加参数
  props?: Record<string, unknown>

  constructor(options: LayoutComponent) {
    this.id = options.id
    this.icon = options.icon
    this.type = options.type

    this.label = options.label || options.id

    if (this.type === 'Link') {
      this.to = options.to || '/'
    } else if (this.type === 'Component') {
      this.component = options.component || ''
      this.props = options.props || {}
    } else {
      throw new Error(`数据不合组件元数据规范规范:${JSON.stringify(options)}`)
    }
  }
}
