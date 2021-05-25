<template>
  <div class="mapbox-marker-add-wrapper">
    <mapgis-draw
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
import { utilInstance, baseConfigInstance } from '@mapgis/pan-spatial-map-store'
import { MapMixin, AppMixin, UUID } from '@mapgis/web-app-framework'
import MarkerCommonMixin from '../../mixins/marker-common'

@Component({
  components: {}
})
export default class MapboxMarkerAdd extends Mixins(
  MapMixin,
  AppMixin,
  MarkerCommonMixin
) {
  @Provide()
  actions = undefined

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

  // 标注工具
  private drawer: any = null

  // 打开标注
  openMarker(mode) {
    this.enableDrawer()
    this.setMarkerMode(mode)
  }

  // 设置标注模式到标注工具中
  setMarkerMode(mode) {
    switch (mode) {
      case 'point':
        if (this.drawer) {
          this.drawer.changeMode('draw_point')
        }
        break
      case 'line':
        if (this.drawer) {
          this.drawer.changeMode('draw_line_string')
        }
        break
      case 'polygon':
        if (this.drawer) {
          this.drawer.changeMode('draw_polygon')
        }
        break
      default:
        break
    }
  }

  // 使能标注
  enableDrawer() {
    const markerComponent = this.$refs.markerDrawer

    if (markerComponent) {
      markerComponent.enableDrawer()
    }
  }

  // 标注工具准备好
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
      iconImg: `${this.baseUrl}${baseConfigInstance.config.colorConfig.label.image.defaultImg}`,
      edit: true,
      features: [e.features[0]],
      center,
      coordinates: e.features[0]
    }
    this.drawer.delete(e.features[0].id)

    this.emitAddMarker(marker)
  }
}
</script>
