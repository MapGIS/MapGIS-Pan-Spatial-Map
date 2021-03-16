import AppMixin from './app-mixin'

import {
  defaultWidgetPosition,
  defaultWidgetStyle,
  defaultWidgetProperties
} from '../utils/app-config.js'

export default {
  mixins: [AppMixin],
  props: {
    widget: Object
  },
  computed: {
    widgetInfo() {
      const {
        id,
        uri,
        configDetial: config,
        openAtStart = false,
        visible = true,
        dragable = true
      } = this.widget

      return {
        id,
        uri,
        label: this.parseLabel(this.widget),
        icon: this.parseIcon(this.widget),
        config,
        assetsUrl: `${this.appAssetsUrl}${this.widget.uri}`,
        position: this.parsePostion(this.widget),
        openAtStart,
        visible,
        dragable,
        cssStyle: this.parseCssStyle(this.widget),
        properties: this.parseProperties(this.widget)
      }
    }
  },
  methods: {
    parsePostion(widget) {
      // 解析微件位置
      const { position = defaultWidgetPosition } = widget
      return position
    },
    parseCssStyle(widget) {
      // 解析微件样式,对于占位的使用默认样式
      if (widget.manifest) {
        if (widget.manifest.properties.inPanel) {
          const { cssStyle = defaultWidgetStyle } = widget
          return cssStyle
        }
        return widget.cssStyle
      }

      return defaultWidgetStyle
    },
    parseProperties(widget) {
      // 解析微件属性
      if (widget.manifest) {
        const { properties = defaultWidgetProperties } = widget.manifest
        return properties
      }

      return {}
    },
    parseIcon(widget) {
      // 解析微件图标
      if (!widget.manifest) {
        return ''
      }

      if (widget.icon) {
        return `${this.appAssetsUrl}${widget.icon}`
      }
      if (widget.manifest.icon) {
        return widget.manifest.icon
      }

      return `${this.appAssetsUrl}${widget.uri}/images/icon.svg`
    },
    parseLabel(widget) {
      // 解析微件名称
      if (!widget.manifest) {
        return ''
      }

      if (widget.label) {
        return widget.label
      }

      return widget.manifest.name
    }
  }
}
