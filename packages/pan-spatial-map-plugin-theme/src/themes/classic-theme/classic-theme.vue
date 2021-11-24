<template>
  <a-layout class="pan-spatial-map-wrapper">
    <component
      :is="headerContentComponent"
      ref="headerContent"
      v-bind="parseContentProps('header')"
    />
    <a-layout ref="bodyContent">
      <component
        :is="leftContentComponent"
        ref="leftContent"
        v-bind="parseContentProps('left')"
      />
      <mp-pan-spatial-map-side-panel
        v-if="maxSidePanelWidth && mapInitialized"
        v-bind="left.panel"
        :widgets="left.widgets"
        :max-width="maxSidePanelWidth"
        @update-widget-state="onUpdateWidgetState('left', $event)"
      />
      <a-layout class="main-wrapper">
        <a-layout-content class="content-wrapper">
          <component
            :is="toolbarContentComponent"
            ref="toolbarContent"
            v-bind="parseContentProps('toolbar')"
          />
          <slot v-if="mapInitialized" name="map" />
        </a-layout-content>
        <component
          :is="footerContentComponent"
          v-bind="parseContentProps('footer')"
          :max-view-height="maxFooterHeight"
        />
      </a-layout>
      <mp-map-container
        v-if="configInitialized"
        class="map-wrapper"
        :cesium-lib-path="publicPath + 'cesium/Cesium.js'"
        :cesium-plugin-path="publicPath + 'cesium/webclient-cesium-plugin.js'"
        :map-options="mapOptions"
      />
    </a-layout>
  </a-layout>
</template>

<script>
import { ThemeMixin } from '@mapgis/web-app-framework'
import { baseConfigInstance, loadConfigs } from '@mapgis/pan-spatial-map-common'
import { mapState } from 'vuex'
import MpPanSpatialMapSidePanel from '../../components/SidePanel/SidePanel.vue'

export default {
  name: 'MpPanSpatialMapClassicTheme',
  components: {
    MpPanSpatialMapSidePanel
  },
  mixins: [ThemeMixin],
  props: {
    header: Object,
    toolbar: Object,
    left: Object
  },
  data() {
    return {
      publicPath: process.env.BASE_URL,
      maxFooterHeight: 0,
      maxSidePanelWidth: 0,
      showSetting: false,
      configInitialized: false
    }
  },
  computed: {
    ...mapState('setting', ['hideSetting']),
    headerContentComponent() {
      return this.parseContentComponent('header')
    },
    leftContentComponent() {
      return this.parseContentComponent('left')
    },
    toolbarContentComponent() {
      return this.parseContentComponent('toolbar')
    },
    footerContentComponent() {
      return this.parseContentComponent('footer')
    },
    mapOptions() {
      const lnglat = baseConfigInstance.config.center.split(',')
      return {
        center: { lng: Number(lnglat[0]), lat: Number(lnglat[1]) },
        zoom: baseConfigInstance.config.initZoom,
        mapStyle: {
          sprite: `http://${baseConfigInstance.config.ip}:${baseConfigInstance.config.port}/igs/rest/mrcs/vtiles/sprite`,
          glyphs: `http://${baseConfigInstance.config.ip}:${baseConfigInstance.config.port}/igs/rest/mrcs/vtiles/fonts/{fontstack}/{range}.pbf`
        }
      }
    }
  },
  mounted() {
    this.calcMaxFooterHeight()
    this.calcMaxSidePanelWidth()
    this.watchWindowSize()
  },
  async created() {
    await loadConfigs()
    this.configInitialized = true
  },
  beforeDestroy() {
    window.onresize = null
  },
  methods: {
    calcMaxFooterHeight() {
      this.maxFooterHeight =
        window.innerHeight - this.$refs.headerContent.$el.offsetHeight
    },
    calcMaxSidePanelWidth() {
      this.maxSidePanelWidth =
        this.$refs.bodyContent.$el.clientWidth -
        this.$refs.leftContent.$el.clientWidth
    },
    watchWindowSize() {
      window.onresize = () => {
        this.calcMaxFooterHeight()
        this.calcMaxSidePanelWidth()
      }
    }
  }
}
</script>

<style lang="less" scoped>
.pan-spatial-map-wrapper {
  height: 100vh;
  position: relative;
  .main-wrapper {
    overflow-y: hidden;
    .content-wrapper {
      position: relative;
      padding: 0;
    }
  }
  .map-wrapper {
    position: absolute;
    top: 48px;
    left: 48px;
    width: calc(100% - 48px);
    height: calc(100% - 48px);
    z-index: 0;
  }
}
</style>
