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
        v-if="getMaxWidthFunc && mapInitialized"
        v-bind="left.panel"
        :widgets="left.widgets"
        :max-width="getMaxWidthFunc"
        @update-widget-state="onUpdateWidgetState('left', $event)"
      />
      <a-layout class="main-wrapper">
        <a-layout-content class="content-wrapper">
          <mp-map-container
            v-if="configInitialized"
            class="map-wrapper"
            :cesium-lib-path="publicPath + 'cesium/Cesium.js'"
            :cesium-plugin-path="
              publicPath + 'cesium/webclient-cesium-plugin.js'
            "
            :map-options="mapOptions"
          />
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
    </a-layout>
  </a-layout>
</template>

<script>
import { ThemeMixin } from '@mapgis/web-app-framework'
import { baseConfigInstance, loadConfigs } from '@mapgis/pan-spatial-map-store'
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
      showSetting: false,
      getMaxWidthFunc: null,
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
          glyphs: `http://${baseConfigInstance.config.ip}:${baseConfigInstance.config.port}/igs/rest/mrms/vtiles/fonts/{fontstack}/{range}.pbf`
        }
      }
    }
  },
  mounted() {
    this.calcMaxFooterHeight()
    this.watchWindowSize()
    this.getMaxWidthFunc = this.getSidePanelMaxWidth
  },
  async created() {
    await loadConfigs()
    this.configInitialized = true
  },
  beforeDestroy() {
    window.onresize = null
  },
  methods: {
    getSidePanelMaxWidth() {
      return (
        this.$refs.bodyContent.$el.clientWidth -
        this.$refs.leftContent.$el.clientWidth
      )
    },
    calcMaxFooterHeight() {
      this.maxFooterHeight =
        window.innerHeight - this.$refs.headerContent.$el.offsetHeight
    },
    watchWindowSize() {
      window.onresize = () => {
        this.calcMaxFooterHeight()
      }
    }
  }
}
</script>

<style lang="less" scoped>
.pan-spatial-map-wrapper {
  .main-wrapper {
    overflow-y: hidden;
    .content-wrapper {
      position: relative;
      padding: 0;
      .map-wrapper {
        position: fixed;
        top: 48px;
        left: 48px;
        width: calc(100vw - 48px);
        height: calc(100vh - 48px);
      }
    }
  }
}
</style>
