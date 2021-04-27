<template>
  <div class="mapbox-marker-add-wrapper">
    <mapbox-base-draw
      ref="markerDrawer"
      :controls="controls"
      @added="handleAdded"
      @drawCreate="handleCreate"
    />
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
import { utilInstance } from '@mapgis/pan-spatial-map-store'
import { MapMixin } from '@mapgis/web-app-framework'
import markerRed from '../../../../../../pan-spatial-map-plugin-workspace/src/assets/images/markerRed.png'
import markerBlue from '../../../../../../pan-spatial-map-plugin-workspace/src/assets/images/markerBlue.png'

@Component({
  components: {
    MapboxBaseDraw
  }
})
export default class MapboxMarkerAdd extends Mixins(MapMixin) {
  @Provide()
  actions = undefined

  @Prop({ type: Object, default: '' }) drawMode!: Record<string, any>

  @Emit('addMarker')
  emitAddMarker(marker: any) {}

  private controls = {
    point: false,
    line_string: false,
    polygon: false,
    trash: false,
    combine_features: false,
    uncombine_features: false
  }

  private drawer: any = null

  private drawModes = {
    point: 'point',
    line: 'line',
    polygon: 'polygon'
  }

  @Watch('drawMode', { deep: true })
  changeDrawMode() {
    this.enableDrawer()
    switch (this.drawMode.mode) {
      case this.drawModes.point:
        if (this.drawer) {
          this.drawer.changeMode('draw_point')
        }
        break
      case this.drawModes.line:
        if (this.drawer) {
          this.drawer.changeMode('draw_line_string')
        }
        break
      case this.drawModes.polygon:
        if (this.drawer) {
          this.drawer.changeMode('draw_polygon')
        }
        break
      default:
        break
    }
  }

  handleAdded(e: any) {
    const { drawer } = e
    this.drawer = drawer
  }

  handleCreate(e: any) {
    const center = utilInstance.getGeoJsonFeatureCenter(e.features[0])
    const marker = {
      id: UUID.uuid(),
      title: '',
      description: '',
      img: '',
      iconImg: markerRed,
      edit: true,
      features: [e.features[0]],
      center,
      coordinates: e.features[0]
    }
    this.drawer.delete(e.features[0].id)

    this.emitAddMarker(marker)
  }

  enableDrawer() {
    const component = this.$refs.markerDrawer

    if (component) {
      ;(component as any).enableDrawer()
    }
  }
}
</script>
