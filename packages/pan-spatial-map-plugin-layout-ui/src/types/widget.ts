import { LayoutComponent } from './component'

export interface ILayoutWidgetPosition {
  position?: string
  offset?: number[]
  expand?: boolean
}

export class LayoutWidget {
  // 标识
  id: string

  // 组件标识
  componentId: string

  // 初始打开
  initOpen?: boolean

  // 微件位置
  position?: ILayoutWidgetPosition

  widgets?: Record<string, unknown>

  // 附加参数
  props?: Record<string, unknown>

  // 是否打开
  show: boolean

  // 组件信息
  info: LayoutComponent

  constructor(options: LayoutWidget, info: LayoutComponent) {
    this.id = options.id
    this.componentId = options.componentId

    this.initOpen = options.initOpen === true
    this.position = options.position || {
      position: 'top-right',
      offset: [10, 10],
      expand: false
    }
    this.props = options.props || {}
    this.widgets = options.widgets || {}

    this.show = this.initOpen

    this.info = info
  }
}
