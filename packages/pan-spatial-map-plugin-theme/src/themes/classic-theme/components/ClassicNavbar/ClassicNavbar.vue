<template>
  <a-layout-header :class="[headerTheme, 'classic-navbar-wrapper']">
    <div class="header-wide">
      <div :class="['logo', headerTheme]">
        <mp-icon :icon="application.logo" class="icon" />
        <h1>{{ application.title }}</h1>
        <h2>{{ application.subtitle }}</h2>
      </div>
      <div class="header-menu" :style="`width: ${menuWidth};`">
        <a-menu
          class="menu"
          :theme="themeMode"
          mode="horizontal"
          @select="onSelect"
        >
          <a-menu-item v-for="widget in widgets" :key="widget.id">
            <mp-icon :icon="getWidgetIcon(widget)" class="icon" />
            <span>{{ getWidgetLabel(widget) }}</span>
          </a-menu-item>
        </a-menu>
      </div>
      <div :class="['header-right', headerTheme]">
        <mp-header-avatar class="header-item" />
      </div>
    </div>
  </a-layout-header>
</template>

<script>
import { ThemeContentMixin, WidgetManager } from '@mapgis/web-app-framework'
import { mapState } from 'vuex'
import MpIcon from '../Icon/Icon.vue'
import MpHeaderAvatar from './HeaderAvatar'

export default {
  name: 'MpPanSpatialMapClassicNavbar',
  components: { MpIcon, MpHeaderAvatar },
  mixins: [ThemeContentMixin],
  computed: {
    ...mapState('setting', ['theme']),
    headerTheme() {
      return this.theme.mode
    },
    themeMode() {
      return this.theme.mode == 'light' ? this.theme.mode : 'dark'
    },
    menuWidth() {
      return 'calc(100% - 500px)'
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

<style lang="less" scoped>
.classic-navbar-wrapper {
  height: 48px;
  line-height: 48px;
  padding: 0;
  box-shadow: @shadow-down;
  position: relative;
  background: @base-bg-color;

  &.dark {
    background: @header-bg-color-dark;
    color: white;
  }

  &.night {
    .menu {
      background: @base-bg-color;
    }
  }

  .header-wide {
    padding-left: 8px;

    .logo {
      display: inline-block;
      padding: 0 12px 0 24px;
      cursor: pointer;
      padding: 0 12px 0 0;

      .icon {
        color: @primary-color;
        font-size: 32px;
        margin-right: 8px;
        vertical-align: -0.2em;
      }

      h1 {
        color: inherit;
        display: inline-block;
        font-size: 16px;
      }
      h2 {
        color: inherit;
        display: inline-block;
        font-size: 14px;
        padding-left: 6px;
      }
    }

    .header-menu {
      display: inline-block;

      .menu {
        box-shadow: none;
        .icon {
          margin-right: 10px;
        }
      }
    }

    .header-right{
      float: right;
      display: flex;
      color: inherit;
      .header-item{
        color: inherit;
        padding: 0 12px;
        cursor: pointer;
        align-self: center;
        a{
          color: inherit;
          i{
            font-size: 16px;
          }
        }
      }
      each(@theme-list, {
        &.@{value} .header-item{
          &:hover{
            @class: ~'hover-bg-color-@{value}';
            background-color: @@class;
          }
        }
      })
    }
  }
}
</style>
