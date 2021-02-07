<template>
  <div>ClassicTheme</div>
</template>

<script>
import { ThemeMixin } from '@mapgis/web-app-framework'
import { baseConfigInstance } from '@mapgis/pan-spatial-map-store'

export default {
  name: 'MpPanSpatialMapClassicTheme',
  mixins: [ThemeMixin],
  props: {
    navbar: Object,
    toolbar: Object
  },
  data() {
    return {}
  },
  computed: {
    navbarContentComponent() {
      return this.parseContentComponent('navbar')
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
  methods: {}
}
</script>

<style lang="less" scoped></style>
