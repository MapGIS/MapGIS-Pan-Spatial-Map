import AppMixin from './app-mixin'

import {
  defaultWidgetPosition,
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
