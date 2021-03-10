<template>
  <mp-pan-spatial-map-side-menu
    :theme-mode="sideTheme"
    :collapsible="false"
    :collapsed="true"
    :content="content"
    :widgets="widgets"
    :widgetStructure="widgetStructure"
    :panel="panel"
    ref="sideMenu"
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
  },
  methods: {
    onUpdateWidgetVisible(e) {
      this.$refs.sideMenu.onUpdateWidgetVisible(e)
    }
  }
}
</script>

<style lang="less" scoped></style>
