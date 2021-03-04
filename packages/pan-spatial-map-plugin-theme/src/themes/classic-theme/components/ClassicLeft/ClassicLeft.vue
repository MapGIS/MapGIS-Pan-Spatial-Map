<template>
  <mp-pan-spatial-map-side-menu
    :theme-mode="sideTheme"
    :collapsible="true"
    :collapsed="true"
    :content="content"
    :widgets="widgets"
    :widgetStructure="widgetStructure"
    :panel="panel"
  />
</template>

<script>
import { ThemeContentMixin } from '@mapgis/web-app-framework'
import { mapState } from 'vuex'
import MpPanSpatialMapSideMenu from '../../../../components/SideMenu/SideMenu.vue'

export default {
  name: 'MpPanSpatialMapClassicLeft',
  components: { MpPanSpatialMapSideMenu },
  mixins: [ThemeContentMixin],
  computed: {
    ...mapState('setting', { themeMode: state => state.theme.mode }),
    sideTheme() {
      if (this.themeMode == 'dark') {
        return 'light'
      }
      return this.themeMode
    }
  }
}
</script>

<style lang="less" scoped></style>
