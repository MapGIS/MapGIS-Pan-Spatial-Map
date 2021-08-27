<template>
  <div class="map-widget-list-container">
    <a-row :gutter="14" type="flex">
      <a-col v-for="(widget, index) in constantWidgets" :key="index">
        <widget-item
          v-if="getWidgetTemplate(widget)"
          :widget="widget"
          :widgetTemplate="getWidgetTemplate(widget)"
          :actions="getConstantWidgetActions(widget)"
        />
      </a-col>
    </a-row>
    <a-divider />
    <a-row :gutter="14" type="flex">
      <a-col v-for="(widget, index) in dynamicWidgets" :key="index">
        <widget-item
          v-if="widget.uri && getWidgetTemplate(widget)"
          :widget="widget"
          :widgetTemplate="getWidgetTemplate(widget)"
          :actions="getDynamicWidgetActions()"
        />
        <widget-placeholder-item
          v-else
          :widget="widget"
          @select="startSelectWidget(widget)"
        />
      </a-col>
    </a-row>
    <a-modal
      title="选择微件"
      :visible.sync="selectWidgetDialogVisible"
      width="75%"
      @ok="finishSelectWidget"
      @cancel="selectWidgetDialogVisible = false"
    >
      <widget-select
        :widget-pool="widgetPool"
        :selected-widgets="selectedWidgets"
      />
    </a-modal>
    <widget-config-setting
      :visible.sync="configWidgetDialogVisible"
      v-if="currentConfigintWidget"
      :widget="currentConfigintWidget"
      :widget-template="getWidgetTemplate(currentConfigintWidget)"
    />
  </div>
</template>

<script>
import WidgetItem from './WidgetItem'
import WidgetSelect from './WidgetSelect'
import WidgetPlaceholderItem from './WidgetPlaceholderItem'
import WidgetConfigSetting from './WidgetConfigSetting'
import { UUID } from '../../../model/utils'

export default {
  name: 'ContentWidgetList',
  components: {
    WidgetItem,
    WidgetPlaceholderItem,
    WidgetSelect,
    WidgetConfigSetting
  },
  props: {
    widgets: {
      type: Array
    },
    widgetTemplates: {
      type: Array
    },
    widgetPool: {
      type: Array
    }
  },
  data() {
    return {
      selectWidgetDialogVisible: false,
      selectedWidgets: [],
      currentSelectingWidget: {},
      configWidgetDialogVisible: false,
      currentConfigintWidget: null
    }
  },
  computed: {
    getWidgetTemplate() {
      return function(widget) {
        if (!widget.uri) {
          return {}
        }

        const strs = widget.uri.split('/')
        const widgetName = strs[strs.length - 1]

        return this.widgetTemplates.find(item => {
          return item.name === widgetName
        })
      }
    },
    constantWidgets() {
      return this.widgets.filter(widget => {
        return widget.placeholder !== true
      })
    },
    dynamicWidgets() {
      return this.widgets.filter(widget => {
        return widget.placeholder === true
      })
    },
    getConstantWidgetActions() {
      return function(widget) {
        const actions = []
        const widgetTemplate = this.getWidgetTemplate(widget)
        let visible = true

        if ('visible' in widget && !widget.visible) {
          visible = false
        }

        actions.push({
          text: visible ? '隐藏此微件' : '显示此微件',
          icon: visible ? 'check-circle' : 'close-circle',
          placement: 'top-right',
          callback: this.switchWidget
        })

        // 如果该微件可配置，则添加配置按钮
        if (
          widgetTemplate &&
          ('hasConfig' in widgetTemplate.manifest.properties === false ||
            widgetTemplate.manifest.properties.hasConfig === true)
        ) {
          actions.push({
            text: '配置此微件',
            icon: 'setting',
            placement: 'bottom-right',
            callback: this.configWidget
          })
        }
        return actions
      }
    }
  },
  methods: {
    getDynamicWidgetActions() {
      return [
        {
          text: '移除此微件',
          icon: 'delete',
          placement: 'top-right',
          callback: this.removeWidget
        },
        {
          text: '配置此微件',
          icon: 'setting',
          placement: 'bottom-right',
          callback: this.configWidget
        }
      ]
    },
    switchWidget(widget) {
      if ('visible' in widget && !widget.visible) {
        this.$delete(widget, 'visible')
      } else {
        this.$set(widget, 'visible', false)
      }
    },
    removeWidget(widget) {
      const index = this.widgets.findIndex(item => {
        return item.id === widget.id
      })

      if (index >= 0) {
        this.$delete(widget, 'uri')
      }
    },
    configWidget(widget) {
      this.configWidgetDialogVisible = true
      this.currentConfigintWidget = widget
    },
    startSelectWidget(widget) {
      this.selectWidgetDialogVisible = true
      this.selectedWidgets = []
      this.currentSelectingWidget = widget
    },
    finishSelectWidget() {
      this.selectWidgetDialogVisible = false

      if (this.selectedWidgets.length > 0) {
        this.$set(this.currentSelectingWidget, 'id', `widget_${UUID.uuid()}`)
        this.$set(
          this.currentSelectingWidget,
          'uri',
          `widgets/${this.selectedWidgets[0]}`
        )
      }
    }
  }
}
</script>

<style lang="less" scoped>
.map-widget-list-container {
  .btn-add {
    float: left;
    margin-bottom: 10px;
  }
}
</style>
