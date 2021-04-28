<template>
  <div>
    <mapgis-marker
      v-for="item in tempMarkers"
      :key="item.id"
      :coordinates="item.coordinates"
      @mouseenter="
        e => {
          mouseenterEvent(e)
        }
      "
    >
      <img slot="marker" :src="item.img" />
      <mapgis-popup :coordinates="item.coordinates" :showed="true">
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
      </mapgis-popup>
    </mapgis-marker>
  </div>
</template>

<script lang="ts">
import {
  Mixins,
  Provide,
  Component,
  Prop,
  Watch,
  Emit,
  Vue
} from 'vue-property-decorator'
import { utilInstance } from '@mapgis/pan-spatial-map-store'
import { MapMixin } from '@mapgis/web-app-framework'

@Component()
export default class PlaceNameMapbox extends Mixins(MapMixin) {
  @Prop({ type: Array, required: true, default: [] })
  readonly fieldNames!: []

  @Prop({ type: Array, required: true, default: [] })
  readonly markers!: Record<string, any>[]

  @Watch('markers', { deep: true })
  updateMarkers() {
    this.tempMarkers = [...this.markers]
  }

  setMapCenter(positionCoord) {
    this.map.flyTo({
      center: positionCoord,
      curve: 1,
      easing(t) {
        return t
      }
    })
  }

  public prePopup: any = undefined

  private tempMarkers: Record<string, any>[] = []

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
