<template>
  <a-layout class="pan-spatial-map-wrapper">
    <mp-drawer v-if="!hideSetting" v-model="showSetting" placement="right">
      <div class="setting" slot="handler">
        <a-icon :type="showSetting ? 'close' : 'setting'" />
      </div>
      <mp-setting />
    </mp-drawer>
    <component
      :is="headerContentComponent"
      ref="headerContainer"
      v-bind="parseContentProps('header')"
    />
    <a-layout>
      <component
        :is="leftContentComponent"
        v-bind="parseContentProps('left')"
      />
      <mp-pan-spatial-map-side-panel :width="panelWidth" />
      <mp-pan-spatial-map-adjust-line
        direction="right"
        @line-move="onPanelLineMove"
      />
      <a-layout>
        <a-layout-content>
          <mp-map-container
            :page-height="pageHeight"
            cesium-lib-path="cesium/Cesium.js"
            cesium-plugin-path="cesium/webclient-cesium-plugins.js"
            :map-options="mapOptions"
          />
          <!-- <component
            :is="toolbarContentComponent"
            v-bind="parseContentProps('toolbar')"
          /> -->
          <!-- <slot v-if="mapInitialized" name="map" /> -->
        </a-layout-content>
        <component
          :is="footerContentComponent"
          ref="footerContainer"
          v-bind="parseContentProps('footer')"
          :max-footer-height="maxFooterHeight"
        />
      </a-layout>
    </a-layout>
  </a-layout>
</template>

<script>
import { ThemeMixin } from '@mapgis/web-app-framework'
import { baseConfigInstance } from '@mapgis/pan-spatial-map-store'
import elementResizeDetectorMaker from 'element-resize-detector'
import { mapState } from 'vuex'
import MpPanSpatialMapSidePanel from '../../components/SidePanel/SidePanel.vue'
import MpPanSpatialMapAdjustLine from '../../components/AdjustLine/AdjustLine.vue'

export default {
  name: 'MpPanSpatialMapClassicTheme',
  components: { MpPanSpatialMapSidePanel, MpPanSpatialMapAdjustLine },
  mixins: [ThemeMixin],
  props: {
    header: Object,
    toolbar: Object,
    left: Object
  },
  data() {
    return {
      pageHeight: '',
      maxFooterHeight: 0,
      showSetting: false,
      panelWidth: 320
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
    this.calcPageHeight()
    this.watchFooterSize()

    this.calcMaxFooterHeight()
    this.watchWindowSize()
  },
  methods: {
    calcPageHeight() {
      this.pageHeight = `calc(100vh - ${this.$refs.headerContainer.$el.offsetHeight}px - ${this.$refs.footerContainer.$el.offsetHeight}px)`
    },
    watchFooterSize() {
      const erd = elementResizeDetectorMaker()
      erd.listenTo(this.$refs.footerContainer.$el, element => {
        this.calcPageHeight()
      })
    },
    calcMaxFooterHeight() {
      this.maxFooterHeight =
        window.innerHeight - this.$refs.headerContainer.$el.offsetHeight
    },
    watchWindowSize() {
      window.onresize = () => {
        this.calcMaxFooterHeight()
      }
    },
    onPanelLineMove(offset) {
      this.panelWidth += offset
    }
  }
}
</script>

<style lang="less" scoped>
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
