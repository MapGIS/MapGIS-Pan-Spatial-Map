<template>
  <div class="classic-sidebar-wrapper">
    <a-layout-sider
      :theme="themeMode"
      :class="[sidebarTheme, 'sidebar-menu-wrapper']"
      v-model="collapsed"
      :collapsedWidth="sidebarWidth"
      :collapsible="true"
      :trigger="null"
    >
      <div class="sidebar-menu beauty-scroll">
        <a-menu
          class="menu"
          :theme="themeMode"
          @select="onSelect"
          mode="inline"
        >
          <a-menu-item v-for="widget in widgets" :key="widget.id">
            <mp-icon :icon="getWidgetIcon(widget)" class="icon" />
            <span>{{ getWidgetLabel(widget) }}</span>
          </a-menu-item>
        </a-menu>
      </div>
      <div class="sidebar-links">
        <a-menu
          class="menu"
          :theme="themeMode"
          :inlineIndent="16"
          :selectedKeys="[]"
          :openKeys="[]"
          mode="inline"
        >
          <a-menu-item
            class="sidebar-collapsed-button"
            title=""
            @click="collapsed = !collapsed"
          >
            <a-icon :type="collapsed ? 'menu-unfold' : 'menu-fold'" />
          </a-menu-item>
        </a-menu>
      </div>
    </a-layout-sider>
  </div>
</template>

<script>
import { ThemeContentMixin, WidgetManager } from '@mapgis/web-app-framework'
import { mapState } from 'vuex'
import MpIcon from '../Icon/Icon.vue'

export default {
  name: 'MpPanSpatialMapClassicLeftSidebar',
  components: { MpIcon },
  mixins: [ThemeContentMixin],
  data() {
    return {
      collapsed: false,
      initSidebarWidth: 48
    }
  },
  computed: {
    ...mapState('setting', ['theme']),
    sidebarTheme() {
      return this.theme.mode
    },
    themeMode() {
      return this.theme.mode == 'light' ? this.theme.mode : 'dark'
    },
    sidebarWidth() {
      return this.collapsed ? this.initSidebarWidth : 200
    }
  },
  methods: {
    onSelect({ item, key, selectedKeys }) {
      WidgetManager.getInstance().triggerWidgetOpen(
        this.widgets.find(val => {
          return val.id === key
        })
      )
    }
  }
}
</script>

<style lang="less">
@import '../../../index.less';
</style>

<style lang="less" scoped>
.classic-sidebar-wrapper {
  overflow: auto;
  height: calc(100vh - 48px);

  .sidebar-collapsed-button {
    border-top: 1px solid rgba(0, 0, 0, 0.25);
    .anticon {
      font-size: 16px;
    }
  }

  .sidebar-menu-wrapper {
    display: flex;
    flex-direction: column;
    height: 100%;

    &.light {
      .sidebar-collapsed-button {
        border-top: 1px solid @border-color;
      }
    }

    .sidebar-menu {
      flex: 1;
      overflow-y: auto;
      overflow-x: hidden;

      .menu {
        box-shadow: none;

        .icon {
          margin-right: 10px;
        }
      }
    }

    .sidebar-links {
      background: transparent;
    }
    .anticon anticon-menu-fold {
      background: transparent;
    }
  }
}
</style>
