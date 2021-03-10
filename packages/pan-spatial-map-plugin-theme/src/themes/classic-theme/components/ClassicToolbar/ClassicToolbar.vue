<template>
  <div class="toolbar-wrapper">
    <a-icon
      :type="collapsed ? 'double-left' : 'double-right'"
      class="toolbar-collapse-button"
      @click="collapsed = !collapsed"
    />
    <div class="toolbar-content" v-show="!collapsed">
      <a-divider type="vertical" />
      <template v-for="(widget, index) in widgets">
        <toolbar-button
          :widget="widget"
          :key="widget.id"
          @click="onWidgetClick(widget)"
        />
        <a-divider type="vertical" :key="index" />
      </template>
      <div class="toolbar-more"></div>
    </div>
  </div>
</template>

<script>
import { ThemeContentMixin, WidgetManager } from '@mapgis/web-app-framework'
import ToolbarButton from '../../../../components/ToolbarButton/ToolbarButton.vue'

export default {
  name: 'MpPanSpatialMapClassicToolbar',
  components: { ToolbarButton },
  mixins: [ThemeContentMixin],
  data() {
    return {
      collapsed: false
    }
  },
  methods: {
    onWidgetClick(widget) {
      WidgetManager.getInstance().triggerWidgetOpen(widget)
    }
  }
}
</script>

<style lang="less" scoped>
.toolbar-wrapper {
  position: absolute;
  right: 10px;
  top: 10px;
  color: @text-color;
  padding: 4px 8px;
  border-radius: 2px;
  border-bottom: 1px solid @border-color;
  background: @base-bg-color;
  box-shadow: 0 1px 4px rgba(0, 21, 41, 0.08);
  font-size: 14px;
  display: flex;
  align-items: center;
  .toolbar-collapse-button {
    font-size: 16px;
    padding: 4px 0;
    cursor: pointer;
    &:hover {
      color: @primary-color;
    }
  }
  .toolbar-content {
    display: flex;
    align-items: center;
    line-height: 16px;
  }
}
</style>
