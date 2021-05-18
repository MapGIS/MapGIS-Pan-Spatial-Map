<template>
  <div>
    <template v-if="!cluster">
      <mapgis-marker
        v-for="(item, i) in markers"
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
              v-for="(child, n) in getJsonTag(item.properties || {})"
              v-show="child !== ''"
              :key="'placename-marker-' + i + 'properties-' + n"
              class="placename-popup-text"
            >
              {{ fieldNames[n] }} : {{ item.properties[child] }}
            </div>
          </div>
        </mapgis-popup>
      </mapgis-marker>
    </template>
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

  @Prop({ type: [Array, Object], required: true, default: [] })
  readonly markers!: Record<string, any>[]

  @Prop() cluster!: boolean

  @Prop() geojson!: Record<string, unknown>

  public prePopup: any = undefined

  // @Watch('geojson', { deep: true })
  // markersChange() {
  //   if (!this.cluster) {
  //     return
  //   }
  //   this.addCluster(this.geojson)
  // }

  // addCluster(geojson) {
  //   // map.add
  //   this.map.addSource('earthquakes', {
  //     type: 'geojson',
  //     data: 'https://docs.mapbox.com/mapbox-gl-js/assets/earthquakes.geojson',
  //     cluster: true,
  //     clusterMaxZoom: 14, // 聚合最大级别
  //     clusterRadius: 50 // 聚合半径
  //   })

  //   this.map.addLayer({
  //     id: 'clusters',
  //     type: 'circle',
  //     source: 'earthquakes',
  //     filter: ['has', 'point_count'],
  //     paint: {
  //       'circle-color': [
  //         'step',
  //         ['get', 'point_count'],
  //         '#51bbd6',
  //         100,
  //         '#f1f075',
  //         750,
  //         '#f28cb1'
  //       ],
  //       'circle-radius': ['step', ['get', 'point_count'], 20, 100, 30, 750, 40],
  //       'circle-stroke-color': '#FFFFFF',
  //       'circle-stroke-width': 5
  //     }
  //   })

  //   this.map.addLayer({
  //     id: 'cluster-count',
  //     type: 'symbol',
  //     source: 'earthquakes',
  //     filter: ['has', 'point_count'],
  //     layout: {
  //       'text-field': '{point_count_abbreviated}',
  //       'text-font': ['宋体', '宋体'],
  //       'text-size': 12
  //     }
  //   })

  //   this.map.addLayer({
  //     id: 'unclustered-point',
  //     type: 'circle',
  //     source: 'earthquakes',
  //     filter: ['!', ['has', 'point_count']],
  //     paint: {
  //       'circle-color': '#11b4da',
  //       'circle-radius': 4,
  //       'circle-stroke-width': 1,
  //       'circle-stroke-color': '#fff'
  //     }
  //   })
  // }

  setMapCenter(positionCoord) {
    this.map.flyTo({
      center: positionCoord,
      curve: 1,
      easing(t) {
        return t
      }
    })
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
}
</script>

<style scoped></style>
