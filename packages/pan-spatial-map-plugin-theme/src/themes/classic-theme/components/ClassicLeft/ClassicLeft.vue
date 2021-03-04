<template>
  <mp-pan-spatial-map-header :theme-mode="headerTheme">
    <div
      slot="header-content"
      class="header-menu"
      :style="`width: ${menuWidth};`"
    >
      <a-menu
        class="menu"
        :theme="headerTheme"
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
    headerTheme() {
      if (this.themeMode == 'dark') {
        return 'light'
      }
      return this.themeMode
    },
    menuWidth() {
      return 'calc(100% - 500px)'
    }
  },
  mounted() {
    console.log(this.themeMode)
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
      display: inline-block;
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
