<template>
  <div class="add-marker-wrapper">
    <mapbox-base-draw
      ref="markerDrawer"
      :controls="controls"
      @added="handleAdded"
      @drawCreate="handleCreate"
    ></mapbox-base-draw>
  </div>
</template>

<script lang="ts">
import {
  Component,
  Provide,
  Emit,
  Prop,
  Watch,
  Mixins
} from 'vue-property-decorator'
import { MapboxBaseDraw } from '@mapgis/webclient-vue-mapboxgl'
import { UUID } from '@mapgis/webclient-store/src/utils'
import { MapDocumentMixin, utilInstance } from '@mapgis/pan-spatial-map-store'
import markerBlue from '../../../assets/images/markerBlue.png'

@Component({
  components: {
    MapboxBaseDraw
  }
})
export default class MapboxAddMarker extends Mixins(MapDocumentMixin) {
  @Provide() map

  @Provide()
  get mapbox() {
    return this.mapLib
  }

  @Provide()
  actions = undefined

  @Prop({ type: Object, default: '' }) drawMode!: Record<string, any>

  @Emit('addMarkers')
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  emitTodo(markers: any) {}

  private markerImgSrc = markerBlue

  private controls = {
    point: false,
    // eslint-disable-next-line @typescript-eslint/camelcase
    line_string: false,
    polygon: false,
    trash: false,
    // eslint-disable-next-line @typescript-eslint/camelcase
    combine_features: false,
    // eslint-disable-next-line @typescript-eslint/camelcase
    uncombine_features: false
  }

  private drawer: any = null

  private markers: any[] = []

  private drawModes = {
    point: 'point',
    line: 'line',
    polygon: 'polygon'
  }

  @Watch('drawMode', { deep: true })
  changeDrawMode() {
    this.enableDrawer()
    if (this.drawMode.mode === this.drawModes.point) {
      // eslint-disable-next-line no-unused-expressions
      this.drawer && this.drawer.changeMode('draw_point')
    } else if (this.drawMode.mode === this.drawModes.line) {
      // eslint-disable-next-line no-unused-expressions
      this.drawer && this.drawer.changeMode('draw_line_string')
    } else if (this.drawMode.mode === this.drawModes.polygon) {
      // eslint-disable-next-line no-unused-expressions
      this.drawer && this.drawer.changeMode('draw_polygon')
    }
  }

  handleAdded(e: any) {
    const { drawer } = e
    this.drawer = drawer
  }

  handleCreate(e: any) {
    console.log(e)
    const coordinates = utilInstance.getGeoJsonFeatureCenter(e.features[0])
    const marker = {
      id: UUID.uuid(),
      title: '',
      description: '',
      img: this.markerImgSrc,
      edit: true,
      features: [e.features[0]],
      coordinates
    }
    this.markers = []
    this.markers.push(marker)
    this.drawer.delete(e.features[0].id)
    this.emitTodo(this.markers)
  }

  enableDrawer() {
    const component = this.$refs.markerDrawer
    // eslint-disable-next-line no-unused-expressions
    component && component.enableDrawer()
  }
}
</script>

<style scoped>
.add-marker-wrapper {
  margin: 1em;
  max-height: 45em;
  overflow: auto;
}
</style>
