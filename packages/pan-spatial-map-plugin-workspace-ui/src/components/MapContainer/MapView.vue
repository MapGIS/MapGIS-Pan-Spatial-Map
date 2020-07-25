<template>
  <mapbox-map
    :accessToken="accessToken"
    :mapStyle="mapStyle"
    :center="initCenter"
    :zoom="initZoom"
    :crs="mapCrs"
    @load="getMap"
    :style="{ height: pageHeight }"
  >
    <base-layers-mapbox />
    <div v-for="l in rasters" :key="l.id">
      <mapbox-raster-layer
        v-if="isRasterLayer(l.subtype)"
        :layerId="l.id"
        :layer="l"
        :sourceId="l.id"
        :source="l.source"
      />
      <mapbox-igs-tile-layer
        v-if="isIgsTileLayer(l.subtype)"
        :layer="l"
        :layerId="l.id"
        :sourceId="l.id"
        :url="l.url"
        :ip="l.ip"
        :port="l.port"
        :serverName="l.serverName"
      />
      <mapbox-igs-doc-layer
        v-if="isIgsDocLayer(l.subtype)"
        :layer="l"
        :layerId="l.id"
        :sourceId="l.id"
        :url="l.url"
        :ip="l.ip"
        :port="l.port"
        :serverName="l.serverName"
      />
      <mapbox-igs-vector-layer
        v-if="isIgsVectorLayer(l.subtype)"
        :layer="l"
        :layerId="l.id"
        :sourceId="l.id"
        :url="l.url"
        :ip="l.ip"
        :port="l.port"
        :gdbps="l.gdbps"
      />
      <mapbox-wms-layer
        v-if="isIgsWmsLayer(l.subtype)"
        :layer="l"
        :url="l.serverUrl"
      />
      <mapbox-wmts-layer
        v-if="isIgsWmtsLayer(l.subtype)"
        :layer="l"
        :url="l.serverUrl"
      />
      <mapbox-arcgis-layer
        v-if="isArcgisLayer(l.subtype)"
        :layer="l"
        :layerId="l.id"
        :sourceId="l.id"
        :url="l.serverUrl"
      />
    </div>
    <map-state-mapbox />
    <MapboxScaleControl :position="'left-bottom'" />
  </mapbox-map>
</template>

<script lang="ts">
import { Component, Prop, Watch, Emit, Mixins } from 'vue-property-decorator'
import Mapbox from '@mapgis/mapbox-gl'
import '@mapgis/mapbox-gl/dist/mapbox-gl.css'
import {
  MapDocumentMixin,
  queryOGCInfoInstance
} from '@mapgis/pan-spatial-map-store'
import defaultStyle from '../../style/default-style.js'
import BaseLayersMapbox from '../BaseLayers/BaseLayersMapbox.vue'
import MapStateMapbox from '../MapState/MapStateMapbox.vue'
import MapboxWmtsLayer from '../MapboxLayers/MapboxWmtsLayer.vue'
import MapboxWmsLayer from '../MapboxLayers/MapboxWmsLayer.vue'

const { IDocument, VectorTile, Layer } = require('@mapgis/webclient-store')
const {
  MapboxMap,
  MapboxMarker,
  MapboxRasterLayer,
  MapboxIgsTileLayer,
  MapboxIgsDocLayer,
  MapboxIgsVectorLayer,
  MapboxScaleControl,
  MapboxArcgisLayer
} = require('@mapgis/webclient-vue-mapboxgl')

const { Convert } = VectorTile
const { IgsLayerType } = Layer

@Component({
  name: 'MpMapView',
  components: {
    MapboxMap,
    MapboxMarker,
    MapboxRasterLayer,
    MapboxIgsTileLayer,
    MapboxIgsDocLayer,
    MapboxIgsVectorLayer,
    MapboxWmsLayer,
    MapboxWmtsLayer,
    MapboxScaleControl,
    BaseLayersMapbox,
    MapStateMapbox,
    MapboxArcgisLayer
  }
})
export default class MpMapView extends Mixins(MapDocumentMixin) {
  @Prop(String) readonly pageHeight?: string

  private localMapbox: any = null

  private mapId = ''

  accessToken =
    'pk.eyJ1IjoicGFybmRlZWRsaXQiLCJhIjoiY2o1MjBtYTRuMDhpaTMzbXhpdjd3YzhjdCJ9.sCoubaHF9-nhGTA-sgz0sA'

  mapStyle = defaultStyle

  mapCrs = 'EPSG:4326'

  docStyle = {}

  rasters = []

  created() {
    // 在组件中使用mapbox-gl.js的脚本库功能
    this.localMapbox = Mapbox
    this.parseRasterTile()
  }

  @Watch('document', { deep: true, immediate: true })
  parseRasterTile() {
    if (!this.document) return

    const doc = IDocument.deepclone(this.document)
    const layers = new Convert().docTomvtLayers(doc, false)
    const rasters = layers.filter((l: Record<string, unknown>) => {
      l.source = { type: 'raster', tiles: [l.url] }
      return l.type === 'raster'
    })

    this.rasters = rasters
  }

  @Emit('load')
  emitTodo(mapInfo: Record<string, any>) {}

  getMap(e: any) {
    const obj = {
      map: e.map,
      mapLib: this.localMapbox
    }
    this.emitTodo(obj)
    this.mapId = this.registerMap(obj)
  }

  beforeDestroy() {
    this.removeMap(this.mapId)
  }

  isRasterLayer(subtype: string) {
    return subtype === 'Raster'
  }

  isIgsDocLayer(subtype: string) {
    return subtype === IgsLayerType.IgsDocLayer
  }

  isIgsTileLayer(subtype: string) {
    return subtype === IgsLayerType.IgsTileLayer
  }

  isIgsVectorLayer(subtype: string) {
    return subtype === IgsLayerType.IgsVectorLayer
  }

  isIgsWmsLayer(subtype: string) {
    return subtype === IgsLayerType.IgsWmsLayer
  }

  isIgsWmtsLayer(subtype: string) {
    return subtype === IgsLayerType.IgsWmtsLayer
  }

  isArcgisLayer(subtype: string) {
    return subtype === 'vectortile'
  }

  async getWmtsInfo(layer: any) {
    let tilematrixSet = ''
    if (layer.tilematrixSet) {
      tilematrixSet = layer.tilematrixSet
    } else {
      const wmtsInfo = await queryOGCInfoInstance.getWMTSInfo(layer.url)
      if (wmtsInfo) {
        tilematrixSet = wmtsInfo.tilematrixSet
      }
    }
    return tilematrixSet
  }
}
</script>

<style>
.mapboxgl-ctrl.mapboxgl-ctrl-scale {
  position: absolute;
  left: 1em;
  bottom: 2em;
  height: 10px;
  background-color: transparent;
  line-height: 10%;
  text-align: center;
}
</style>
