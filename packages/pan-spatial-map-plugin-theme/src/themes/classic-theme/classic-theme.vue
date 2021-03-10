<template>
  <a-layout class="pan-spatial-map-wrapper">
    <drawer v-if="!hideSetting" v-model="showSetting" placement="right">
      <div class="setting" slot="handler">
        <a-icon :type="showSetting ? 'close' : 'setting'" />
      </div>
      <setting />
    </drawer>
    <component
      :is="headerContentComponent"
      ref="headerContainer"
      v-bind="parseContentProps('header')"
    />
    <a-layout>
      <component
        :is="leftContentComponent"
        ref="leftContainer"
        v-bind="parseContentProps('left')"
      />
      <mp-pan-spatial-map-side-panel
        v-bind="left.panel"
        :widgets="left.widgets"
        @update-widget-visible="onUpdateWidgetVisible('left', $event)"
      />
      <a-layout>
        <a-layout-content class="content-wrapper">
          <mp-map-container
            class="map-wrapper"
            cesium-lib-path="cesium/Cesium.js"
            cesium-plugin-path="cesium/webclient-cesium-plugins.js"
            :map-options="mapOptions"
          />
          <component
            :is="toolbarContentComponent"
            v-bind="parseContentProps('toolbar')"
          />
          <!-- <slot v-if="mapInitialized" name="map" /> -->
        </a-layout-content>
        <a-layout-footer class="footer-wrapper" style="padding: 0">
          <component
            :is="footerContentComponent"
            v-bind="parseContentProps('footer')"
            :max-view-height="maxFooterHeight"
          />
        </a-layout-footer>
      </a-layout>
    </a-layout>
  </a-layout>
</template>

<script>
import { ThemeMixin } from '@mapgis/web-app-framework'
import { baseConfigInstance } from '@mapgis/pan-spatial-map-store'
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
      maxFooterHeight: 0,
      showSetting: false
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
        zoom: baseConfigInstance.config.initZoom
      }
    }
  },
  mounted() {
    this.calcMaxFooterHeight()
    this.watchWindowSize()
  },
  methods: {
    calcMaxFooterHeight() {
      this.maxFooterHeight =
        window.innerHeight - this.$refs.headerContainer.$el.offsetHeight
    },
    watchWindowSize() {
      window.onresize = () => {
        this.calcMaxFooterHeight()
      }
    },
    onUpdateWidgetVisible(contentName, e) {
      const contentComponent = this.$refs[`${contentName}Container`]
      if (contentComponent) contentComponent.onUpdateWidgetVisible(e)
    }
  }
}
</script>

<style lang="less" scoped>
.pan-spatial-map-wrapper {
  .content-wrapper {
    position: relative;
    padding: 0;
    .map-wrapper {
      position: fixed;
      top: 0;
      left: 0;
      width: 100vw;
      height: 100vh;
    }
  }
  .footer-wrapper {
    z-index: 500;
  }
}
.setting {
  background-color: @primary-color;
  color: @base-bg-color;
  border-radius: 5px 0 0 5px;
  line-height: 40px;
  font-size: 22px;
  width: 40px;
  height: 40px;
  box-shadow: -2px 0 8px @shadow-color;
}
</style>
