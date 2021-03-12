<template>
  <div class="toolbar-wrapper">
    <div class="toolbar-button-list">
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
  .toolbar-button-list {
    box-sizing: content-box;
    padding: 8px;
    height: 16px;
    line-height: 16px;
    color: @text-color;
    border-radius: 2px;
    background: @base-bg-color;
    box-shadow: 0 1px 4px rgba(0, 21, 41, 0.08);
    display: flex;
    align-items: center;
    .toolbar-collapse-button {
      font-size: 16px;
      cursor: pointer;
      &:hover {
        color: @primary-color;
      }
    }
    .toolbar-content {
      display: flex;
      align-items: center;
    }
  }
}
</style>
