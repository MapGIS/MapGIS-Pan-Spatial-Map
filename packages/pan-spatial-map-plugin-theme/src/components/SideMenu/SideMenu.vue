<template>
  <a-layout-sider
    :theme="sideTheme"
    :class="[themeMode, 'side-menu-wrapper']"
    v-model="collapsed"
    :collapsedWidth="sidebarWidth"
    :collapsible="collapsible"
    :trigger="null"
    :width="208"
  >
    <div class="side-menu beauty-scroll">
      <a-menu class="menu" :theme="sideTheme" @select="onSelect" mode="inline">
        <a-menu-item v-for="widget in widgets" :key="widget.id">
          <mp-icon :icon="getWidgetIcon(widget)" class="icon" />
          <span>{{ getWidgetLabel(widget) }}</span>
        </a-menu-item>
      </a-menu>
    </div>
    <div class="side-links">
      <a-menu
        class="menu"
        :theme="sideTheme"
        :inlineIndent="16"
        :selectedKeys="[]"
        :openKeys="[]"
        mode="inline"
      >
        <a-menu-item
          class="side-collapsed-button"
          title=""
          @click="collapsed = !collapsed"
        >
          <a-icon :type="collapsed ? 'menu-unfold' : 'menu-fold'" />
        </a-menu-item>
      </a-menu>
    </div>
  </a-layout-sider>
</template>

<script>
import { ThemeContentMixin } from '@mapgis/web-app-framework'
import { mapState } from 'vuex'
import MpIcon from '../Icon/Icon.vue'

export default {
  name: 'MpPanSpatialMapSideMenu',
  components: { MpIcon },
  mixins: [ThemeContentMixin],
  props: {
    collapsible: {
      type: Boolean,
      required: false,
      default: false
    }
  },
  data() {
    return {
      collapsed: false,
      initSidebarWidth: 48
    }
  },
  computed: {
    ...mapState('setting', ['theme']),
    sideTheme() {
      return this.theme.mode == 'light' ? this.theme.mode : 'dark'
    },
    themeMode() {
      return this.theme.mode
    },
    sidebarWidth() {
      return this.collapsed ? this.initSidebarWidth : 200
    }
  },
  methods: {
    onSelect({ item, key, selectedKeys }) {}
  }
}
</script>

<style lang="less">
@import '../../index.less';
</style>

<style lang="less" scoped>
.side-menu-wrapper {
  display: flex;
  flex-direction: column;
  overflow: auto;
  z-index: 1;
  box-shadow: 2px 0 8px 0 rgba(29, 35, 41, 0.05);
  height: calc(100vh - 48px);
  .side-collapsed-button {
    border-top: 1px solid rgba(0, 0, 0, 0.25);
    .anticon {
      font-size: 16px;
    }
  }
  &.light {
    .side-collapsed-button {
      border-top: 1px solid @border-color;
    }
  }
  .side-menu {
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
  .side-links {
    background: transparent;
  }
  .anticon anticon-menu-fold {
    background: transparent;
  }
}
</style>
