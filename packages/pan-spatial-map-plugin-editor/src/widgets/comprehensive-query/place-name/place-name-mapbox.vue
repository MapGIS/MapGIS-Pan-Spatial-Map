<template>
  <div>
    <mapbox-marker
      v-for="(item, i) in tempMarkers"
      :key="'placename-marker-' + i"
      :coordinates="item.coordinates"
      @mouseenter="
        e => {
          mouseenterEvent(e)
        }
      "
    >
      <div slot="marker"><img :src="item.img" /></div>
      <mapbox-popup :coordinates="item.coordinates" :showed="true">
        <div>
          <div
            v-for="(child, n) in getJsonTag(item.properties)"
            v-show="child !== ''"
            :key="'placename-marker-' + i + 'properties-' + n"
            class="placename-popup-text"
          >
            {{ fieldNames[n] }} : {{ item.properties[child] }}
          </div>
        </div>
      </mapbox-popup>
    </mapbox-marker>
  </div>
</template>

<script lang="ts">
import {
  Mixins,
  Provide,
  Component,
  Prop,
  Watch,
  Emit
} from 'vue-property-decorator'
import { MapboxMarker, MapboxPopup } from '@mapgis/webclient-vue-mapboxgl'
import { MapDocumentMixin, utilInstance } from '@mapgis/pan-spatial-map-store'

@Component({
  components: {
    MapboxMarker,
    MapboxPopup
  }
})
export default class PlaceNameMapbox extends Mixins(MapDocumentMixin) {
  @Provide() map

  @Provide()
  get mapbox() {
    return this.mapLib
  }

  @Provide()
  actions = undefined

  @Prop({ type: Array, required: true, default: [] })
  readonly fieldNames!: []

  @Prop({ type: Array, required: true, default: [] })
  readonly markers!: Record<string, any>[]

  @Prop({ type: Array, default: [] })
  readonly positionCoord!: number[]

  @Watch('positionCoord', { deep: true })
  updatePositionCoord() {
    this.map.flyTo({
      center: this.positionCoord,
      speed: 0.2,
      curve: 1,
      easing(t: any) {
        return t
      }
    })
  }

  get mapCenter() {
    return this.map.getCenter()
  }

  @Emit('mapCenter')
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  emitMapCenter(center: Record<string, any>) {}

  @Watch('mapCenter', { deep: true })
  updateMapCenter() {
    const lon = this.mapCenter.lng
    const { lat } = this.mapCenter
    this.emitMapCenter({ lon, lat })
  }

  public prePopup: any = undefined

  private tempMarkers: Record<string, any>[] = []

  @Watch('markers', { deep: true })
  updateMarkers() {
    this.tempMarkers = [...this.markers]
  }

  mounted() {
    this.updateMarkers()
  }

  getJsonTag(json: Record<string, any>) {
    const tags = utilInstance.getJsonTag(json)
    if (!this.fieldNames.includes('FID')) {
      const index = tags.indexOf('FID')
      if (index > -1) {
        tags.splice(index, 1)
      }
    }
    return tags
  }

  mouseenterEvent(e: any) {
    if (this.prePopup && this.prePopup.isOpen()) {
      this.prePopup.remove()
    }
    e.marker.togglePopup()
    this.prePopup = e.marker.getPopup()
  }

  onMapClear() {
    this.tempMarkers = []
  }
}
</script>

<style scoped></style>
