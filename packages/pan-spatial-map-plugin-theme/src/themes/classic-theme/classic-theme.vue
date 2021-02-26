<template>
  <a-layout class="pan-spatial-map-wrapper">
    <component
      :is="navbarContentComponent"
      ref="headerContainer"
      v-bind="parseContentProps('navbar')"
    />
    <a-layout>
      <component
        :is="leftSidebarContentComponent"
        v-bind="parseContentProps('leftsidebar')"
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

export default {
  name: 'MpPanSpatialMapClassicTheme',
  mixins: [ThemeMixin],
  props: {
    navbar: Object,
    toolbar: Object
  },
  data() {
    return {
      pageHeight: '',
      maxFooterHeight: 0
    }
  },
  computed: {
    navbarContentComponent() {
      return this.parseContentComponent('navbar')
    },
    leftSidebarContentComponent() {
      return this.parseContentComponent('leftsidebar')
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
    }
  }
}
</script>

<style lang="less" scoped></style>
