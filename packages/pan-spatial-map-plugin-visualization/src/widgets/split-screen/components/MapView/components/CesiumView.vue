<template>
  <mp-cesium-view
    v-if="mapViewDocument"
    :document="mapViewDocument"
    @map-load="onMapLoad"
  >
    <mapgis-3d-draw @load="onLoad" @drawcreate="onCreate" />
    <mapgis-3d-link :enable="true" />
  </mp-cesium-view>
</template>
<script lang="ts">
import { Vue, Component, Prop } from 'vue-property-decorator'
import { MpCesiumView, Document } from '@mapgis/web-app-framework'
import { Rect } from '../../../mixins/map-view'

@Component({
  components: {
    MpCesiumView
  }
})
export default class CesiumView extends Vue {
  @Prop() mapViewDocument!: Document

  drawer = null

  isMapLoaded = false

  enableDrawer() {
    if (this.drawer) {
      this.drawer.enableDrawRectangle()
    }
  }

  onMapLoad(e) {
    this.$emit('on-load', e)
    this.isMapLoaded = true
  }

  onLoad(drawer) {
    if (this.isMapLoaded && !this.drawer) {
      this.drawer = drawer
    }
  }

  onCreate(cartesian3, lnglat) {
    if (this.isMapLoaded) {
      const [lng, lat] = lnglat
      console.log('lnglat', cartesian3, lnglat)
      let xmin: number
      let xmax: number
      let ymin: number
      let ymax: number
      if (!xmin || lng < xmin) {
        xmin = lng
      }
      if (!xmax || lng > xmax) {
        xmax = lng
      }
      if (!ymin || lat < ymin) {
        ymin = lat
      }
      if (!ymax || lat > ymax) {
        ymax = lat
      }
      const rect = new Rect(xmin, ymin, xmax, ymax)
      this.$emit('on-create', rect)
    }
  }

  beforeDestroyed() {
    this.isMapLoaded = false
  }
}
</script>
<style lang="less" scoped></style>
