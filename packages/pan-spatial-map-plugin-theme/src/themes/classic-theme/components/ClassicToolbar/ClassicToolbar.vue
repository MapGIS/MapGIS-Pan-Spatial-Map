<template>
  <div class="toolbar-wrapper">
    <div class="toolbar-button-list">
      <div class="toolbar-collapse-button" @click="collapsed = !collapsed">
        <a-icon :type="collapsed ? 'double-left' : 'double-right'" />
      </div>
      <div class="toolbar-content" v-show="!collapsed">
        <template v-for="(widget, index) in currentExpandPopularWidgets">
          <a-divider type="vertical" :key="index" />
          <toolbar-button
            :widget="widget"
            :key="widget.id"
            :active="selectWidgetId == widget.id"
            @click="onWidgetClick(widget)"
          />
        </template>
        <div class="toolbar-more">
          <a-divider type="vertical" />
          <div
            :class="{ 'toolbar-more-button': true, active: morePanel }"
            @click="onMoreButtonClick"
          >
            <a-icon type="more" />
          </div>
        </div>
      </div>
      <a-collapse v-show="morePanel" class="toolbar-more-panel beauty-scroll">
        <a-collapse-panel
          v-for="widgetGroup in currentMoreWidgets"
          :key="widgetGroup.id"
          :header="widgetGroup.label"
        >
          <a-list
            :grid="{ gutter: 16, column: 2 }"
            :data-source="widgetGroup.children"
          >
            <a-list-item slot="renderItem" slot-scope="widget">
              <toolbar-card
                v-if="!widget.type || widget.type == 'widget'"
                :widget="widget"
                :key="widget.id"
                @click="onMoreWidgetClick(widget)"
              />
            </a-list-item>
          </a-list>
        </a-collapse-panel>
      </a-collapse>
    </div>
  </div>
</template>

<script>
import {
  ThemeContentMixin,
  WidgetManager,
  widgetState
} from '@mapgis/web-app-framework'
import { UUID } from '@mapgis/webclient-store/src/utils'
import ToolbarButton from '../../../../components/ToolbarButton/ToolbarButton.vue'
import ToolbarCard from '../../../../components/ToolbarCard/ToolbarCard.vue'

export default {
  name: 'MpPanSpatialMapClassicToolbar',
  components: { ToolbarButton, ToolbarCard },
  mixins: [ThemeContentMixin],
  props: {
    maxWidgets: { type: Number, default: 8 }
  },
  data() {
    return {
      collapsed: false,
      morePanel: false,
      selectWidgetId: ''
    }
  },
  computed: {
    currentWidgetStructure() {
      return this.is2DMapMode ? this.widgetStructure2d : this.widgetStructure3d
    },
    currentPopularWidgets() {
      return this.currentWidgetStructure.filter(widget => {
        const { type = 'widget' } = widget
        return type == 'widget'
      })
    },
    currentNoPopularWidgets() {
      return this.currentWidgetStructure.filter(widget => {
        const { type = 'widget' } = widget
        return type == 'folder'
      })
    },
    currentExpandPopularWidgets() {
      return this.currentPopularWidgets.slice(0, this.maxWidgets)
    },
    currentUnExpandPopularWidgets() {
      return this.currentPopularWidgets.slice(this.maxWidgets)
    },
    currentMoreWidgets() {
      const widgets = []

      if (this.currentUnExpandPopularWidgets.length > 0) {
        widgets.push({
          id: `folder_${UUID.uuid()}`,
          type: 'folder',
          label: '未分组',
          children: this.currentUnExpandPopularWidgets
        })
      }

      return widgets.concat(this.currentNoPopularWidgets)
    }
  },
  methods: {
    onWidgetClick(widget) {
      this.selectWidgetId = widget.id
      this.morePanel = false
      WidgetManager.getInstance().triggerWidgetOpen(widget)
    },
    onMoreWidgetClick(widget) {
      this.morePanel = false
      WidgetManager.getInstance().triggerWidgetOpen(widget)
    },
    onMoreButtonClick() {
      this.selectWidgetId = ''
      this.morePanel = !this.morePanel
      this.widgets.forEach(widget => {
        if (WidgetManager.getInstance().isWidgetVisible(widget)) {
          WidgetManager.getInstance().closeWidget(widget)
        }
      })
    },
    onUpdateWidgetVisible({ widget, visible }) {
      if (visible) {
        this.selectWidgetId = widget.id
      } else {
        if (this.selectWidgetId == widget.id) {
          this.selectWidgetId = ''
        }
      }
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
    position: relative;
    box-sizing: content-box;
    padding: 0 8px;
    height: 32px;
    line-height: 16px;
    color: @text-color;
    border-radius: 2px;
    background: @base-bg-color;
    box-shadow: 0px 1px 2px 0px @shadow-color;
    display: flex;
    align-items: center;
    white-space: nowrap;
    .toolbar-collapse-button,
    .toolbar-more-button {
      height: 32px;
      line-height: 32px;
      font-size: 16px;
      cursor: pointer;
      &:hover,
      &.active {
        color: @primary-color;
      }
    }
    .toolbar-content,
    .toolbar-more {
      display: flex;
      align-items: center;
      .ant-divider-vertical {
        top: 0;
      }
    }
    .toolbar-more-panel {
      position: absolute;
      right: 0;
      top: 42px;
      width: 180px;
      max-height: 400px;
      overflow-y: auto;
    }
  }
}
</style>

<style lang="less">
.toolbar-more-panel {
  &.ant-collapse {
    border: none;
    background: @base-bg-color;
    box-shadow: 0px 1px 2px 0px @shadow-color;
    border-radius: 2px;
  }
  &.ant-collapse > .ant-collapse-item > .ant-collapse-header {
    padding: 0 0 0 32px;
    line-height: 32px;
    .ant-collapse-arrow {
      left: 10px;
    }
  }
  &.ant-collapse > .ant-collapse-item:last-child > .ant-collapse-header {
    border-radius: 0;
  }
  &.ant-collapse > .ant-collapse-item {
    border-bottom: none;
  }
  .ant-collapse-content {
    border-top: none;
  }
  .ant-collapse-content > .ant-collapse-content-box {
    padding: 0;
  }
  .ant-list-grid .ant-col > .ant-list-item {
    margin-bottom: 0;
  }
}
</style>
