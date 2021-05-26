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
    console.log('CesiumView.drawer', this.drawer)
    if (this.drawer) {
      // todo 三维拉框待开发
      // this.drawer.enableDrawPolygon()
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
      console.log('lnglat', cartesian3, lnglat)
      this.$emit('on-create', cartesian3, lnglat)
    }
  }

  beforeDestroyed() {
    this.isMapLoaded = false
  }
}
</script>
<style lang="less" scoped></style>
