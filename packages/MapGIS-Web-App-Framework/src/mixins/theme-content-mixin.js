import AppMixin from './app-mixin'

export default {
  mixins: [AppMixin],
  props: {
    content: String,
    widgets: Array,
    widgetStructure: Array,
    panel: Object,
    mapInitialized: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {}
  },
  methods: {
    getWidgetIcon(widget) {
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
    getWidgetLabel(widget) {
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
