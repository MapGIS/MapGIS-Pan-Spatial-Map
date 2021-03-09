<template>
  <mp-pan-spatial-map-header :theme-mode="themeMode">
    <div slot="header-content" class="header-menu">
      <a-menu
        class="menu"
        :theme="menuTheme"
        mode="horizontal"
        @select="onSelect"
      >
        <a-menu-item v-for="widget in widgets" :key="widget.id">
          <mp-icon :icon="getWidgetIcon(widget)" class="icon" />
          <span>{{ getWidgetLabel(widget) }}</span>
        </a-menu-item>
      </a-menu>
    </div>
  </mp-pan-spatial-map-header>
</template>

<script>
import { ThemeContentMixin, WidgetManager } from '@mapgis/web-app-framework'
import { mapState } from 'vuex'
import MpPanSpatialMapHeader from '../../../../components/Header/Header.vue'
import MpIcon from '../../../../components/Icon/Icon.vue'

export default {
  name: 'MpPanSpatialMapClassicHeader',
  components: { MpPanSpatialMapHeader, MpIcon },
  mixins: [ThemeContentMixin],
  computed: {
    ...mapState('setting', { themeMode: state => state.theme.mode }),
    menuTheme() {
      return this.themeMode == 'light' ? this.themeMode : 'dark'
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
.header-wrapper {
  &.night {
    .menu {
      background: @base-bg-color;
    }
  }
  .header-wide {
    .header-menu {
      .menu {
        box-shadow: none;
        .icon {
          margin-right: 10px;
        }
      }
    }
  }
}
</style>
