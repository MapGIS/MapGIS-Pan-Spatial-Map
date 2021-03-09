<template>
  <a-layout-sider
    :theme="sideTheme"
    :class="[themeMode, 'side-menu-wrapper']"
    v-model="collapsedVal"
    :collapsedWidth="collapsedWidth"
    :collapsible="collapsible"
    :trigger="null"
    :width="width"
  >
    <div class="side-menu beauty-scroll">
      <a-menu class="menu" :theme="sideTheme" @select="onSelect" mode="inline">
        <a-menu-item v-for="widget in widgets" :key="widget.id">
          <mp-icon :icon="getWidgetIcon(widget)" class="icon" />
          <span>{{ getWidgetLabel(widget) }}</span>
        </a-menu-item>
      </a-menu>
    </div>
    <div class="side-links" v-if="collapsible">
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
          @click="collapsedVal = !collapsedVal"
        >
          <a-icon :type="collapsedVal ? 'menu-unfold' : 'menu-fold'" />
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
    width: {
      type: Number,
      default: 208
    },
    collapsible: {
      type: Boolean,
      required: false,
      default: false
    },
    collapsed: {
      type: Boolean,
      required: false,
      default: false
    },
    collapsedWidth: {
      type: Number,
      default: 48
    },
    themeMode: {
      type: String,
      required: false,
      default: 'dark'
    }
  },
  data() {
    return {
      collapsedVal: this.collapsed
    }
  },
  computed: {
    sideTheme() {
      return this.themeMode == 'light' ? this.themeMode : 'dark'
    }
  },
  methods: {
    onSelect({ item, key, selectedKeys }) {}
  }
}
</script>

<style lang="less">
@import '../../index.less';
.side-menu-wrapper {
  .ant-layout-sider-children {
    display: flex;
    flex-direction: column;
    height: 100%;
  }
}
</style>

<style lang="less" scoped>
.side-menu-wrapper {
  display: flex;
  flex-direction: column;
  overflow: auto;
  z-index: 1000;
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
