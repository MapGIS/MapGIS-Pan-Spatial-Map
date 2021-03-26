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
    <template #header-right>
      <mp-pan-spatial-map-header-avatar
        v-if="isHeaderAvatarComponentExist"
        class="header-item"
      />
      <a-tooltip placement="bottom" v-if="isAboutComponentExist">
        <template slot="title">
          <span>关于</span>
        </template>
        <a-icon
          type="info-circle"
          class="header-item"
          @click="onShowAboutInfo"
        />
        <mp-window-wrapper :visible="aboutWindowVisible">
          <template v-slot:default="slotProps">
            <mp-window
              title="关于"
              :visible.sync="aboutWindowVisible"
              :anchor="'top-center'"
              :verticalOffset="150"
              :shrink-action="false"
              :full-screen-action="false"
              v-bind="slotProps"
            >
              <template>
                <mp-pan-spatial-map-about />
              </template>
            </mp-window>
          </template>
        </mp-window-wrapper>
      </a-tooltip>
    </template>
  </mp-pan-spatial-map-header>
</template>

<script>
import { ThemeContentMixin, WidgetManager } from '@mapgis/web-app-framework'
import { mapState } from 'vuex'
import {
  MpPanSpatialMapHeader,
  isExternalLayoutElementComponentExist
} from '../../../../components'

export default {
  name: 'MpPanSpatialMapClassicHeader',
  components: {
    MpPanSpatialMapHeader
  },
  mixins: [ThemeContentMixin],
  data() {
    return {
      aboutWindowVisible: false
    }
  },
  computed: {
    ...mapState('setting', { themeMode: state => state.theme.mode }),
    menuTheme() {
      return this.themeMode == 'light' ? this.themeMode : 'dark'
    },
    isHeaderAvatarComponentExist() {
      return isExternalLayoutElementComponentExist(
        'MpPanSpatialMapHeaderAvatar'
      )
    },
    isAboutComponentExist() {
      return isExternalLayoutElementComponentExist('MpPanSpatialMapAbout')
    }
  },
  methods: {
    onSelect({ item, key, selectedKeys }) {
      WidgetManager.getInstance().triggerWidgetOpen(
        this.widgets.find(val => {
          return val.id === key
        })
      )
    },
    onShowAboutInfo() {
      this.aboutWindowVisible = true
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
      height: 100%;
      .menu {
        height: 100%;
        border: none;
        box-shadow: none;
        .icon {
          margin-right: 10px;
        }
      }
    }
  }
}
</style>
