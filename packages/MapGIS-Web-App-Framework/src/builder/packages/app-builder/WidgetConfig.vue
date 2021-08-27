<template>
  <div class="mp-builder-widget-config">
    <a-tabs type="line" default-active-key="地图" :animated="false">
      <a-tab-pane tab="地图" key="地图">
        <map-widget-list
          :widgets="appConfig.mapWidgets.widgets"
          :widget-templates="widgets"
          :widget-pool="getWidgetPool"
        />
      </a-tab-pane>
      <a-tab-pane
        v-for="content in contentWidgets"
        :key="content.name"
        :tab="content.name"
      >
        <content-widget-list
          :widgets="content.group.widgets"
          :widget-structure="content.group.widgetStructure"
          :widget-templates="widgets"
          :widget-pool="getWidgetPool"
        />
      </a-tab-pane>
    </a-tabs>
  </div>
</template>

<script>
import ContentWidgetList from './ContentWidgetList'
import MapWidgetList from './MapWidgetList'

export default {
  name: 'WidgetConfig',
  components: { ContentWidgetList, MapWidgetList },
  props: {
    appConfig: {
      type: Object
    },
    widgets: {
      type: Array
    },
    themes: {
      type: Array
    }
  },
  data() {
    return {}
  },
  computed: {
    activedThemeName() {
      return this.appConfig.theme.name
    },
    activedTheme() {
      return this.themes.find(val => {
        return this.activedThemeName === val.name
      })
    },
    contentWidgets() {
      const contents = this.appConfig.contentWidgets.groups.map(group => {
        const content = this.getContent(group.content)

        return { name: (content && content.description) || '', group: group }
      })

      contents.filter(value => {
        return value.name
      })
      return contents
    },
    getWidgetPool() {
      let allConfigedWidgets = []
      allConfigedWidgets = allConfigedWidgets.concat(
        this.appConfig.mapWidgets.widgets
      )
      this.appConfig.contentWidgets.groups.forEach(group => {
        allConfigedWidgets = allConfigedWidgets.concat(group.widgets)
      })

      return this.widgets.filter(widget => {
        return this.isWidgetUnConfiged(widget, allConfigedWidgets)
      })
    }
  },
  methods: {
    getContent(contentName) {
      if (
        this.activedTheme &&
        this.activedTheme.manifest &&
        this.activedTheme.manifest.contents
      ) {
        const content = this.activedTheme.manifest.contents.find(
          c => c.name === contentName
        )

        if (content) return content
      }

      return undefined
    },
    isWidgetUnConfiged(widget, widgets) {
      const index = widgets.findIndex(item => {
        if (!item.uri) {
          return false
        }

        const strs = item.uri.split('/')
        const widgetName = strs[strs.length - 1]
        return widget.name === widgetName
      })

      return index === -1
    }
  }
}
</script>

<style lang="less" scoped>
.mp-builder-widget-config {
  padding: 12px;
  /deep/ .ant-tabs-nav .ant-tabs-tab {
    margin: 0 5px 0 0;
    padding: 5px 5px;
  }
}
</style>
