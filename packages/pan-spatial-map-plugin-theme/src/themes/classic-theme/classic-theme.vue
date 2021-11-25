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
      /**
       * 修改说明：由于每个矢量瓦片的符号库可能不一样，为确保矢量瓦片的正常显示，在展示矢量瓦片之前，
       * 都需要在需要在后台应用基本配置里配置矢量瓦片对应的符号库地址。
       * 主要原因是mapboxgl只支持在初始化的时候设置符号库，中途不支持修改。
       * 如果在后台没有配置spriteUrl，那么就取全局配置的IGS默认的符号库
       * （默认的符号库必须用/igs/rest/mrms/vtiles/sprite请求，矢量瓦片自己的则用/igs/rest/mrcs/vtiles/矢量瓦片服务名/sprite）
       * 修改人：龚跃健
       * 修改日期：2021/11/25
       */
      const spriteUrl =
        baseConfigInstance.config.spriteUrl ||
        `http://${baseConfigInstance.config.ip}:${baseConfigInstance.config.port}/igs/rest/mrms/vtiles/sprite`
      return {
        center: { lng: Number(lnglat[0]), lat: Number(lnglat[1]) },
        zoom: baseConfigInstance.config.initZoom,
        mapStyle: {
          sprite: spriteUrl,
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
