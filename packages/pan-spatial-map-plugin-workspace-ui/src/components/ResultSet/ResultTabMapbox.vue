<template>
  <div>
    <mapbox-marker
      v-for="item in markers"
      :key="item.id"
      :coordinates="item.coordinates"
      @mouseenter="
        e => {
          mouseEnterEvent(e)
        }
      "
    >
      <mapbox-popup :coordinates="item.coordinates" :showed="true">
        <div class="popup">
          <div style="max-height:10em;overflow:auto">
            <div
              v-for="(value, key) in item.properties"
              :key="'result-marker-' + 'properties-' + key"
            >
              {{ key }} : {{ value }}
            </div>
          </div>
        </div>
      </mapbox-popup>
      <img slot="marker" :src="item.img" />
    </mapbox-marker>
  </div>
</template>

<script lang="ts">
import { MapboxMarker, MapboxPopup } from '@mapgis/webclient-vue-mapboxgl'
import {
  Component,
  Prop,
  Watch,
  Mixins,
  Provide,
  Emit
} from 'vue-property-decorator'
import { MapDocumentMixin, utilInstance } from '@mapgis/pan-spatial-map-store'

@Component({
  components: { MapboxMarker, MapboxPopup }
})
export default class ResultTabMapbox extends Mixins(MapDocumentMixin) {
  @Provide()
  get mapbox() {
    return this.mapLib
  }

  @Provide() map

  @Prop({
    type: Boolean,
    default: false
  })
  readonly filterWithMap!: boolean

  @Prop({
    type: Array,
    required: true
  })
  readonly markers!: Record<string, any>[]

  @Prop({
    type: Object,
    default: () => {
      return {}
    }
  })
  readonly bounds!: Record<string, any>

  @Prop({
    type: Object,
    default: () => {
      return {}
    }
  })
  readonly geojson!: Record<string, any>

  public prePopup: any = undefined

  @Watch('bounds')
  changeMapBounds() {
    if (this.bounds) {
      const { xmin, ymin, xmax, ymax } = this.bounds as Record<string, number>
      this.map.fitBounds([
        [xmin, ymin],
        [xmax, ymax]
      ])
    }
  }

  @Watch('filterWithMap')
  changeFilterWithMap(val: boolean) {
    if (val) {
      this.map.on('move', this.getGeometry)
    } else {
      this.map.off('move', this.getGeometry)
    }
  }

  @Emit('mapBounds')
  emitMapBounds(bounds: Record<string, any>) {}

  @Emit('clear')
  emitClear(clear: string) {}

  private get getGeometry() {
    let timeout: NodeJS.Timeout
    return (event: any) => {
      if (timeout) clearTimeout(timeout)
      timeout = setTimeout(() => {
        // 根据范围过滤回调
        const { target } = event
        const { _ne, _sw } = target.getBounds()
        const { lng: xmax, lat: ymax } = _ne
        const { lng: xmin, lat: ymin } = _sw
        const bounds = {
          xmin,
          ymin,
          xmax,
          ymax
        }
        this.emitMapBounds(bounds)
      }, 1000)
    }
  }

  @Watch('geojson', { immediate: true, deep: true })
  dataChange() {
    this.clearHighlight()
    if (this.geojson) {
      this.initHighlight()
    }
  }

  private clearHighlight() {
    if (this.map.getLayer('Highlight')) {
      this.map.removeLayer('Highlight')
    }
    if (this.map.getSource('Highlight')) {
      this.map.removeSource('Highlight')
    }
  }

  private initHighlight() {
    this.map.addSource('Highlight', {
      type: 'geojson',
      data: this.geojson
    })
    this.map.addLayer({
      id: 'Highlight',
      type: 'fill',
      source: 'Highlight',
      paint: {
        'fill-outline-color': '#484896',
        'fill-color': '#6e599f',
        'fill-opacity': 0.75
      }
    })
  }

  mouseEnterEvent(e: any) {
    if (this.prePopup && this.prePopup.isOpen()) {
      this.prePopup.remove()
    }
    e.marker.togglePopup()
    this.prePopup = e.marker.getPopup()
  }

  getFildNames(properties: Record<string, any>) {
    const tags = utilInstance.getJsonTag(properties)
    return tags
  }

  onMapClear() {
    this.emitClear('clear')
  }
}
</script>
<style lang="scss" scoped>
.width100 {
  width: 100%;
}
</style>
