<template>
  <div class="content-widget-list-container">
    <a-row>
      <a-button class="btn-add" type="primary" @click="startAddWidget">
        添加
      </a-button>
    </a-row>
    <a-modal
      title="选择微件"
      :visible.sync="addWidgetDialogVisible"
      width="75%"
      @ok="finishAddWidget"
      @cancel="addWidgetDialogVisible = false"
    >
      <widget-select
        :widget-pool="widgetPool"
        :selected-widgets="selectedWidgets"
        multiple
      />
    </a-modal>
    <a-row :gutter="14" type="flex">
      <draggable :list="widgets" :set-data="setData" class="draggle-wrapper">
        <a-col v-for="(widget, index) in widgets" :key="index">
          <widget-item
            v-if="getWidgetTemplate(widget)"
            :widget="widget"
            :widget-template="getWidgetTemplate(widget)"
            :actions="getWidgetActions(widget)"
          />
        </a-col>
      </draggable>
    </a-row>
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
import WidgetConfigSetting from './WidgetConfigSetting'
import draggable from 'vuedraggable'
import { UUID } from '../../../model/utils'

export default {
  name: 'ContentWidgetList',
  components: {
    draggable,
    WidgetItem,
    WidgetSelect,
    WidgetConfigSetting
  },
  props: {
    widgets: {
      type: Array
    },
    widgetStructure: {
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
      addWidgetDialogVisible: false,
      selectedWidgets: [],
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
    }
  },
  methods: {
    getWidgetActions(widget) {
      const actions = []
      const widgetTemplate = this.getWidgetTemplate(widget)

      actions.push({
        text: '移除此微件',
        icon: 'delete',
        placement: 'top-right',
        callback: this.removeWidget
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
    },
    removeWidget(widget) {
      const index = this.widgets.findIndex(item => {
        return item.id === widget.id
      })

      if (index >= 0) {
        this.widgets.splice(index, 1)
      }
    },
    configWidget(widget) {
      this.configWidgetDialogVisible = true
      this.currentConfigintWidget = widget
    },
    startAddWidget() {
      this.addWidgetDialogVisible = true
      this.selectedWidgets = []
    },
    finishAddWidget() {
      this.addWidgetDialogVisible = false

      this.selectedWidgets.forEach(widgetName => {
        this.widgets.push({
          id: `widget_${UUID.uuid()}`,
          uri: `widgets/${widgetName}`
        })
      })
    },
    setData(dataTransfer) {
      // to avoid Firefox bug
      // Detail see : https://github.com/RubaXa/Sortable/issues/1012
      dataTransfer.setData('Text', '')
    }
  }
}
</script>

<style lang="less" scoped>
.content-widget-list-container {
  .btn-add {
    float: left;
    margin-bottom: 10px;
  }
  .draggle-wrapper {
    display: flex;
    flex-wrap: wrap;
  }
}
</style>
