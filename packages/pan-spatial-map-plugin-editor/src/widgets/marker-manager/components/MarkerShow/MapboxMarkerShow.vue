<template>
  <div class="mapbox-marker-show-wrapper">
    <mapbox-marker
      v-for="item in markers"
      :key="item.id"
      :coordinates="item.center"
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
        <img :src="item.iconImg" />
      </div>
      <mapbox-popup :coordinates="item.center" :showed="true">
        <marker-info :markerInfo="item" @delete="interactCancel(item)" />
      </mapbox-popup>
    </mapbox-marker>
  </div>
</template>

<script lang="ts">
import { Component, Mixins, Provide, Prop } from 'vue-property-decorator'
import { MapboxMarker, MapboxPopup } from '@mapgis/webclient-vue-mapboxgl'
import { MapMixin } from '@mapgis/web-app-framework'
import MarkerInfo from '../MarkerInfo/MarkerInfo.vue'

@Component({
  components: {
    MapboxMarker,
    MapboxPopup,
    MarkerInfo
  }
})
export default class MapboxMarkerShow extends Mixins(MapMixin) {
  markerLayerIDs = {
    POINT: 'addMarkerPointlayer',
    LINE: 'addMarkerLinelayer',
    POLYGON: 'addMarkerPolygonlayer'
  }

  markerSourceIDs = {
    POINT: 'addMarkerPoint',
    LINE: 'addMarkerLine',
    POLYGON: 'addMarkerPolygon'
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

  mounted() {
    if (this.map.crs && !this.map.getSource(this.markerSourceIDs.POINT)) {
      this.initPoints()
      this.initLines()
      this.initPolygon()
    }
  }

  private onMapClear() {
    this.markers = []
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

  // 仅初始化点类型
  initPoints() {
    this.map.addSource(this.markerSourceIDs.POINT, {
      type: 'geojson',
      data: this.geojsonFeatures
    })
    this.map.addLayer({
      id: this.markerLayerIDs.POINT,
      type: 'circle',
      source: this.markerSourceIDs.POINT,
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
  initLines() {
    this.map.addSource(this.markerSourceIDs.LINE, {
      type: 'geojson',
      data: this.geojsonFeatures
    })
    this.map.addLayer({
      id: this.markerLayerIDs.LINE,
      type: 'line',
      source: this.markerSourceIDs.LINE,
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
  initPolygon() {
    this.map.addSource(this.markerSourceIDs.POLYGON, {
      type: 'geojson',
      data: this.geojsonFeatures
    })
    this.map.addLayer({
      id: this.markerLayerIDs.POLYGON,
      type: 'fill',
      source: this.markerSourceIDs.POLYGON,
      paint: {
        'fill-color': 'red',
        'fill-opacity': 0.4
      }
    })
  }

  moveMarkerLayersToTop() {
    const layerIDs = [
      this.markerLayerIDs.POINT,
      this.markerLayerIDs.LINE,
      this.markerLayerIDs.POLYGON
    ]
    for (let i = 0; i < layerIDs.length; i += 1) {
      this.map.moveLayer(layerIDs[i])
    }
  }

  // 更新点线面
  updateSource(features: any[], map: any, type: string) {
    if (!features || features.length === 0) {
      this.geojsonFeatures.features = []
    } else {
      this.geojsonFeatures.features = [...features]
      this.moveMarkerLayersToTop()
    }
    switch (type) {
      case 'Point':
        this.map.getSource('addMarkerPoint').setData(this.geojsonFeatures)
        break
      case 'LineString':
        this.map
          .getSource(this.markerSourceIDs.LINE)
          .setData(this.geojsonFeatures)
        break
      case 'Polygon':
        this.map
          .getSource(this.markerSourceIDs.POLYGON)
          .setData(this.geojsonFeatures)
        break
      default:
        break
    }
  }

  interactCancel(item: any) {
    const index = this.markers.indexOf(item)
    this.markers.splice(index, 1)
  }
}
</script>
