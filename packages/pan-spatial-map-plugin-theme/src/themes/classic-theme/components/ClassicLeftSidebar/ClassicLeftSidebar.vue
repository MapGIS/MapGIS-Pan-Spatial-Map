<template>
  <div>
    <div :style="{ width: sidebarWidth + 'px', overflow: 'hidden' }" />

    <a-layout-sider
      :theme="themeMode"
      :class="[sidebarTheme, 'classic-siderbar-wrapper']"
      v-model="collapsed"
      :collapsedWidth="sidebarWidth"
      :collapsible="true"
      :trigger="null"
    >
      <div class="side-menu">
        <div class="side-menu-content beauty-scroll">
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
        <div class="sider-links">
          <a-menu
            class="menu"
            :theme="themeMode"
            :inlineIndent="16"
            :selectedKeys="[]"
            :openKeys="[]"
            mode="inline"
          >
            <a-menu-item
              class="sider-collapsed-button"
              title=""
              @click="collapsed = !collapsed"
            >
              <a-icon :type="collapsed ? 'menu-unfold' : 'menu-fold'" />
            </a-menu-item>
          </a-menu>
        </div>
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
.classic-siderbar-wrapper {
  overflow: auto;
  height: calc(100% - 48px);
  position: fixed;
  left: 0;

  .sider-collapsed-button {
    border-top: 1px solid rgba(0, 0, 0, 0.25);
    .anticon {
      font-size: 16px;
    }
  }

  &.light {
    .sider-collapsed-button {
      border-top: 1px solid @border-color;
    }
  }

  .side-menu {
    display: flex;
    flex-direction: column;
    height: 100%;

    .side-menu-content {
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

    .sider-links {
      background: transparent;
    }
    .anticon anticon-menu-fold {
      background: transparent;
    }
  }
}
</style>
