import { LayoutWidget } from './widget'

export class LayoutWidgetToBlock {
  // 标识
  id: string

  // 区块
  block: string

  // 引用的微件Id
  widgetId: string

  // 附加参数
  props?: Record<string, unknown>

  // 微件信息
  info: LayoutWidget

  constructor(options: LayoutWidgetToBlock, widget: LayoutWidget) {
    this.id = options.id
    this.block = options.block
    this.widgetId = options.widgetId
    this.props = options.props || {}

    this.info = widget
  }

  get applicationIcon(): string {
    if (this.props && this.props.icon) {
      return this.props.icon as string
    }

    if (this.info && this.info.info) {
      return this.info.info.icon
    }

    return ''
  }

  get applicationLabel(): string {
    if (this.props && this.props.label) {
      return this.props.label as string
    }

    if (this.info && this.info.info) {
      return this.info.info.label as string
    }

    return ''
  }
}
