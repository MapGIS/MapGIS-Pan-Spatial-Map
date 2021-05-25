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

  enableDrawer() {
    if (this.drawer) {
      this.drawer.enableDrawPolygon()
    }
  }

  onMapLoad(e) {
    this.$emit('on-load', e)
  }

  onLoad(drawer) {
    if (!this.drawer) {
      this.drawer = drawer
    }
  }

  onCreate(cartesian3, lnglat) {
    console.log('lnglat', lnglat)
    this.$emit('on-create', cartesian3, lnglat)
  }
}
</script>
<style lang="less" scoped></style>
