<template>
  <component :is="themeComponent" v-bind="contents" ref="themeContainer">
    <template v-slot:map="{}">
      <!--地图微件 -->
      <template v-if="mapWidgets">
        <mp-map-widget-container
          v-for="(widget, i) in mapWidgets.widgets"
          :key="i"
          :widget="widget"
        />
      </template>
      <!--地图微件的弹出面板集 -->
      <component
        :is="mapWidgetPanelComponent"
        v-bind="mapWidgets.panel"
        :widgets="mapWidgets.widgets"
      />

      <!--内容微件的弹出面板集 -->
      <template v-if="contentWidgets.groups">
        <component
          v-for="(group, i) in contentWidgets.groups"
          :key="group.content"
          :is="contentWidgetPanelComponents[i]"
          v-bind="group.panel"
          :widgets="group.widgets"
          @update-widget-state="onUpdateWidgetState(group.content, $event)"
        />
      </template>

      <!--普通的地图面板集 -->
      <mp-map-panel v-for="panel in panels" :key="panel.id" :panel="panel" />
    </template>
  </component>
</template>

<script>
import MpMapWidgetContainer from '../WidgetsContainer/MapWidgetContainer.vue'
import MpMapPanel from '../Panels/MapPanel.vue'
import PanelManager from '../../managers/panel-manager'

export default {
  // 组件名称，统一以"Mp"开头
  name: 'MpAppLoader',
  // 依赖的组件
  components: { MpMapWidgetContainer, MpMapPanel },
  props: { application: Object, designTime: { type: Boolean, default: false } },
  provide() {
    return {
      getApplication: () => {
        return this.application
      },
      getDesignTime: () => {
        return this.designTime
      }
    }
  },
  data() {
    return {
      panels: PanelManager.getInstance().getPanels()
    }
  },
  computed: {
    theme() {
      return this.application.theme
    },
    mapWidgets() {
      return this.application.mapWidgets
    },
    contentWidgets() {
      return this.application.contentWidgets
    },
    themeComponent() {
      if (this.theme && this.theme.manifest)
        return this.theme.manifest.component

      return ''
    },
    contents() {
      // 数组转对象,形成以content为key的对象
      const groupContents = {}

      if (!this.contentWidgets || !this.contentWidgets.groups)
        return groupContents

      this.contentWidgets.groups.forEach(item => {
        groupContents[item.content] = item
      })

      return groupContents
    },
    mapWidgetPanelComponent() {
      if (this.mapWidgets.panel && this.mapWidgets.panel.component)
        return this.mapWidgets.panel.component

      return 'MpMapWidgetPanel'
    },
    contentWidgetPanelComponents() {
      const components = []

      if (this.contentWidgets && this.contentWidgets.groups) {
        this.contentWidgets.groups.forEach(item => {
          if (item.panel && item.component) {
            components.push(item.component)
          } else {
            components.push('MpContentWidgetPanel')
          }
        })
      }

      return components
    }
  },
  methods: {
    onUpdateWidgetState(contentName, e) {
      this.$refs.themeContainer.onUpdateWidgetState(contentName, e)
    }
  }
}
</script>
