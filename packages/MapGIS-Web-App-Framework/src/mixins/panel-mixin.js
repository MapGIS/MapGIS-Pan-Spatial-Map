import AppMixin from './app-mixin'
import { defaultWidgetPanelPosition } from '../utils/app-config.js'
import WidgetManager from '../managers/widget-manager'
import WidgetState from '../utils/widget-state'

export default {
  mixins: [AppMixin],
  props: {
    widgets: {
      type: Array,
      required: false,
      default() {
        return []
      }
    },
    relativeTo: { type: String, default: 'map' },
    mode: { type: String, default: 'single' },
    position: {
      type: Object,
      default() {
        return {
          position: defaultWidgetPanelPosition
        }
      }
    }
  },
  computed: {
    isPanelRelativeToMap() {
      return !this.relativeTo || this.relativeTo === 'map'
    },
    widgetsInPanel() {
      if (!this.isPanelRelativeToMap) return []

      return this.widgets.filter(widget => {
        // 没有清单文件就不能弹面板
        if (!widget.manifest) return false

        const { properties = { inPanel: true } } = widget.manifest

        return properties.inPanel
      })
    },
    isWidgetActive() {
      return function(widget) {
        return WidgetManager.getInstance().isWidgetActive(widget)
      }
    },
    isWidgetVisible() {
      return function(widget) {
        // 单面板模式,只能一次显示一个微件
        if (widget.state === WidgetState.ACTIVE && this.mode === 'single') {
          // 将所有可在面板中显示的其他微件的状态全部设置为关闭
          this.widgetsInPanel.forEach(item => {
            if (item !== widget) {
              WidgetManager.getInstance().closeWidget(item)
            }
          })
        }
        return widget.state !== WidgetState.CLOSED
      }
    }
  },
  methods: {
    activateWidget(widget) {
      return WidgetManager.getInstance().activateWidget(widget)
    },
    updateWidgetVisible(visible, widget) {
      if (!visible) {
        WidgetManager.getInstance().closeWidget(widget)
      }
    }
  }
}
