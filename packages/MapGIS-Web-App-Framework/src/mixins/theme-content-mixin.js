import AppMixin from './app-mixin'
import { defaultWidgetProperties } from '../utils/app-config.js'
import WidgetState from '../utils/widget-state'
import WidgetManager from '../managers/widget-manager'

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
  computed: {
    widgets2d() {
      return this.widgets.filter(widget => {
        const properties = this.getWidgetProperties(widget)
        return properties['2D']
      })
    },
    widgets3d() {
      return this.widgets.filter(widget => {
        const properties = this.getWidgetProperties(widget)
        return properties['3D']
      })
    },
    widgetStructure2d() {
      if (!this.widgetStructure || this.widgetStructure.length == 0) {
        return this.widgets2d
      }

      const widgetTree = []

      this.filterWidgetStructure(
        this.widgetStructure,
        this.widgets2d,
        widgetTree
      )
      return widgetTree
    },
    widgetStructure3d() {
      if (!this.widgetStructure || this.widgetStructure.length == 0) {
        return this.widgets3d
      }

      const widgetTree = []

      this.filterWidgetStructure(
        this.widgetStructure,
        this.widgets3d,
        widgetTree
      )

      return widgetTree
    }
  },
  watch: {
    is2DMapMode(newIs2DMapMode, oldNewIs2DMapMode) {
      // 如果微件跟当前的地图模式不匹配，需要将相应的widget关闭
      this.widgets.forEach(widget => {
        if (widget.state !== WidgetState.CLOSED) {
          const properties = this.getWidgetProperties(widget)
          if (
            (newIs2DMapMode && !properties['2D']) ||
            (!newIs2DMapMode && !properties['3D'])
          ) {
            WidgetManager.getInstance().closeWidget(widget)
          }
        }
      })
    }
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
    },
    getWidgetProperties(widget) {
      // 解析微件属性
      if (widget.manifest) {
        const { properties = defaultWidgetProperties } = widget.manifest
        return properties
      }

      return {}
    },
    onUpdateWidgetVisible(e) {},
    filterWidgetStructure(widgetStructure, widgets, newStructure) {
      for (const widget of widgetStructure) {
        const { id, type = 'widget' } = widget
        if (type == 'widget') {
          const existedWidget = widgets.find(item => item.id == id)
          if (existedWidget) {
            newStructure.push(existedWidget)
          }
        } else if (type == 'folder') {
          if (widget.children && widget.children.length) {
            const newSubStructure = []
            this.filterWidgetStructure(
              widget.children,
              widgets,
              newSubStructure
            )

            if (newSubStructure.length) {
              const existedWidgetFolder = {
                ...widget,
                children: newSubStructure
              }
              newStructure.push(existedWidgetFolder)
            }
          }
        }
      }
    }
  }
}
