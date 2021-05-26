<template>
  <div v-if="mapViewDocument">
    <mp-mapbox-view
      :document="mapViewDocument"
      :mapStyle="mapStyle"
      @map-load="onLoad"
    />
    <mapgis-draw
      v-if="isMapLoaded"
      ref="mapgisDraw"
      :controls="controls"
      @added="onAdded"
      @drawCreate="onDrawCreated"
    />
  </div>
</template>
<script lang="ts">
import { Vue, Component, Prop } from 'vue-property-decorator'
import { MpMapboxView, Document } from '@mapgis/web-app-framework'
import { Rect } from '../../../mixins/map-view'
import defaultStyle from '../../../../../assets/style/default-style.json'

@Component({
  components: {
    MpMapboxView
  }
})
export default class MapboxView extends Vue {
  @Prop() mapViewDocument!: Document

  isMapLoaded = false

  mapStyle = defaultStyle

  drawer = null

  controls = {
    point: false,
    line_string: false,
    polygon: false,
    trash: false,
    combine_features: false,
    uncombine_features: false
  }

  enableDrawer() {
    const drawEl = this.$refs.mapgisDraw
    if (drawEl) {
      drawEl.enableDrawer()
    }
    if (this.drawer) {
      this.drawer.changeMode('draw_rectangle')
    }
  }

  onLoad(payload) {
    this.isMapLoaded = true
    this.$emit('on-load', payload)
  }

  onAdded({ drawer }) {
    if (this.isMapLoaded) {
      this.drawer = drawer
      this.$emit('on-add', drawer)
    }
  }

  onDrawCreated({ features }) {
    if (this.isMapLoaded) {
      const {
        id,
        geometry: { coordinates }
      } = features[0]
      if (this.drawer) {
        this.drawer.delete(id)
      }
      let xmin: number
      let xmax: number
      let ymin: number
      let ymax: number
      coordinates[0].forEach(([lng, lat]) => {
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
      })
      const rect = new Rect(xmin, ymin, xmax, ymax)
      this.$emit('on-created', rect)
    }
  }

  beforeDestroyed() {
    this.isMapLoaded = false
  }
}
</script>
<style lang="less" scoped></style>
