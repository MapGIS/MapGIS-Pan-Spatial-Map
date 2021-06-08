<template>
  <div v-if="mapViewDocument">
    <mp-cesium-view
      :document="mapViewDocument"
      :vueKey="vueKey"
      @map-load="onMapLoad"
    ></mp-cesium-view>
    <mapgis-3d-draw @load="onLoad" @drawcreate="onCreate" :vueKey="vueKey" />
    <mapgis-3d-link :vueKey="vueKey" :enable="true" />
  </div>
</template>
<script lang="ts">
import { Vue, Component, Prop } from 'vue-property-decorator'
import {
  MpCesiumView,
  Document,
  MapMixin,
  UUID
} from '@mapgis/web-app-framework'
import { Rect } from '../../../mixins/map-view'

@Component({
  components: {
    MpCesiumView
  }
})
export default class CesiumView extends Vue {
  @Prop() mapViewDocument!: Document

  @Prop({ default: UUID.uuid() }) mapViewId!: string

  drawer = null

  isMapLoaded = false

  get vueKey() {
    console.log('this.mapViewId', this.mapViewId)
    return this.mapViewId
  }

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
      const [[left, top], [right, bottom]] = lnglat
      const rect = new Rect(left, bottom, right, top)
      this.$emit('on-create', rect)
    }
  }

  beforeDestroyed() {
    this.isMapLoaded = false
  }
}
</script>
<style lang="less" scoped></style>
