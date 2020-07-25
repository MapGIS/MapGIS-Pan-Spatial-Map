<template>
  <div class="mapbox-marker">
    <mapbox-marker
      v-for="(item, i) in markers"
      :key="'add-marker-' + i"
      :coordinates="item.coordinates"
      @mouseenter="
        e => {
          mouseenterEvent(e, item)
        }
      "
      @mouseleave="
        e => {
          mouseleaveEvent(e, item)
        }
      "
    >
      <div slot="marker">
        <img :src="item.img" />
      </div>
      <mapbox-popup :coordinates="item.coordinates" :showed="true">
        <marker-info
          :markerInfo="item"
          @delete="interactCancel(item)"
        ></marker-info>
      </mapbox-popup>
    </mapbox-marker>
  </div>
</template>

<script lang="ts">
import { Component, Mixins, Provide, Prop } from 'vue-property-decorator'
import { MapboxMarker, MapboxPopup } from '@mapgis/webclient-vue-mapboxgl'
import { MapDocumentMixin } from '@mapgis/pan-spatial-map-store'
import MarkerInfo from '../MarkerInfo.vue'

@Component({
  components: {
    MapboxMarker,
    MapboxPopup,
    MarkerInfo
  }
})
export default class MapboxShowMarkers extends Mixins(MapDocumentMixin) {
  @Provide() map

  @Provide()
  get mapbox() {
    return this.mapLib
  }

  @Provide()
  actions = undefined

  @Prop({ type: Array, required: true }) markers!: Record<string, any>[]

  private prePopup: any = undefined

  private markerFeatures: any[] = []

  private geojsonFeatures = {
    type: 'FeatureCollection',
    features: this.markerFeatures
  }

  // 仅初始化点类型
  initPoints(map: any) {
    map.addSource('addMarkerPoint', {
      type: 'geojson',
      data: this.geojsonFeatures
    })
    map.addLayer({
      id: 'addMarkerPointlayer',
      type: 'circle',
      source: 'addMarkerPoint',
      paint: {
        // make circles larger as the user zooms from z12 to z22
        'circle-radius': {
          base: 1,
          stops: [
            [0, 1],
            [22, 10]
          ]
        },
        // 'circle-radius':13,
        'circle-color': 'red'
      }
    })
  }

  // 仅初始化线类型
  initLines(map: any) {
    map.addSource('addMarkerLine', {
      type: 'geojson',
      data: this.geojsonFeatures
    })
    map.addLayer({
      id: 'addMarkerLinelayer',
      type: 'line',
      source: 'addMarkerLine',
      layout: {
        'line-join': 'round',
        'line-cap': 'round'
      },
      paint: {
        'line-color': 'red',
        'line-width': 2
      }
    })
  }

  // 仅初始化面类型
  initPolygon(map: any) {
    map.addSource('addMarkerPolygon', {
      type: 'geojson',
      data: this.geojsonFeatures
    })
    map.addLayer({
      id: 'addMarkerPolygonlayer',
      type: 'fill',
      source: 'addMarkerPolygon',
      paint: {
        'fill-color': 'red',
        'fill-opacity': 0.4
      }
    })
  }

  private onMapLoad(map: any) {
    if (map.crs && !map.getSource('addMarkerPoint')) {
      this.initPoints(map)
      this.initLines(map)
      this.initPolygon(map)
    }
  }

  /**
   * 更新点线面
   */
  updateSource(features: any[], map: any, type: string) {
    if (!features || features.length === 0) {
      this.geojsonFeatures.features = []
    } else {
      this.geojsonFeatures.features = [...features]
    }
    switch (type) {
      case 'Point':
        map.getSource('addMarkerPoint').setData(this.geojsonFeatures)
        break
      case 'LineString':
        map.getSource('addMarkerLine').setData(this.geojsonFeatures)
        break
      case 'Polygon':
        map.getSource('addMarkerPolygon').setData(this.geojsonFeatures)
        break
      default:
        break
    }
  }

  private onMapClear() {
    this.markers = []
  }

  interactCancel(item: any) {
    const index = this.markers.indexOf(item)
    this.markers.splice(index, 1)
  }

  mouseenterEvent(e: any, item: any) {
    if (this.prePopup && this.prePopup.isOpen()) {
      this.prePopup.remove()
    }
    e.marker.togglePopup()
    this.prePopup = e.marker.getPopup()
    const { type } = item.features[0].geometry
    this.updateSource(item.features, e.map, type)
  }

  mouseleaveEvent(e: any, item: any) {
    const { type } = item.features[0].geometry
    this.updateSource([], e.map, type)
  }
}
</script>

<style>
.mapboxgl-popup-content {
  position: relative;
  background: rgba(255, 255, 255, 0.8);
  /* border-radius: 0px; */
  box-shadow: 0 1px 2px rgba(255, 255, 255, 0.1);
  /* padding: 10px 10px; */
  pointer-events: auto;
}

.mapboxgl-popup-tip {
  width: 0;
  height: 0;
  border: 10px solid transparent;
  z-index: 1;
  background: rgba(255, 255, 255, 0);
  align-self: center;
  border-bottom: none;
  border-top-color: rgba(255, 255, 255, 0);
}
</style>
