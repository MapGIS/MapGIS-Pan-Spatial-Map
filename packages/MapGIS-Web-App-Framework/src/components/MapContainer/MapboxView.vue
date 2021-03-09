<template>
  <mapbox-map
    :center="center"
    :zoom="zoom"
    :accessToken="accessToken"
    :mapStyle="mapStyle"
    :crs="crs"
    @load="handleLoad"
    style="height: 100%; width: 100%"
  >
    <div v-for="l in rasters" :key="l.id">
      <mapbox-raster-layer
        v-if="isRasterLayer(l.subtype)"
        :layerId="l.id"
        :layer="l"
        :sourceId="l.id"
        :source="l.source"
      />
      <mapbox-igs-tdt-layer
        v-if="isIgsTdtLayer(l.subtype)"
        :layer="l"
        :layerId="l.id"
        :sourceId="l.id"
        :baseURL="l.baseURL"
        :token="l.token"
        :crs="crs"
      />
      <mapbox-igs-tile-layer
        v-if="isIgsTileLayer(l.subtype)"
        :layer="l"
        :layerId="l.id"
        :sourceId="l.id"
        :url="l.serverUrl"
        :ip="l.ip"
        :port="l.port"
        :serverName="l.serverName"
      />
      <mapbox-igs-vector-layer
        v-if="isIgsVectorLayer(l.subtype)"
        :layer="l"
        :layerId="l.id"
        :sourceId="l.id"
        :ip="l.ip"
        :port="l.port"
        :gdbps="l.gdbps"
      />
      <mapbox-igs-doc-layer
        v-if="isIgsDocLayer(l.subtype)"
        :layer="l"
        :layerId="l.id"
        :sourceId="l.id"
        :url="l.serverUrl"
        :ip="l.ip"
        :port="l.port"
        :serverName="l.serverName"
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
        v-if="isIgsArcgisLayer(l.subtype)"
        :layer="l"
        :layerId="l.id"
        :sourceId="l.id"
        :url="l.serverUrl"
      />
    </div>
    <!-- <div v-for="l in vectors" :key="l.id">
      <mapbox-vector-layer
        v-if="isVecterLayer(l.subtype)"
        :layerId="l.id"
        :layer="l"
        :sourceId="l.sourceId"
        :source="sources[l.sourceId]"
      />
    </div> -->
    <div v-for="l in vectors" :key="l.id">
      <mapbox-vectortile-layer
        v-if="isVecterLayer(l.subtype)"
        :layers="l"
        :url="l.serverUrl"
      />
    </div>
    <mapbox-scale-control :position="'left-bottom'" />
  </mapbox-map>
</template>

<script>
import '@mapgis/mapbox-gl/dist/mapbox-gl.css'
import { IDocument, VectorTile, Layer } from '@mapgis/webclient-store'
import {
  MapboxMap,
  MapboxRasterLayer,
  MapboxIgsTileLayer,
  MapboxIgsDocLayer,
  MapboxIgsVectorLayer,
  MapboxIgsTdtLayer,
  MapboxArcgisLayer,
  MapboxScaleControl
} from '@mapgis/webclient-vue-mapboxgl'

import MapboxWmtsLayer from '../MapboxLayers/MapboxWmtsLayer.vue'
import MapboxWmsLayer from '../MapboxLayers/MapboxWmsLayer.vue'
import MapboxVectortileLayer from '../MapboxLayers/MapboxVectortileLayer.vue'

const { Convert } = VectorTile
const { LayerType, SubLayerType, IgsDocLayer, IgsWmsLayer } = Layer

export default {
  name: 'MpMapboxView',
  components: {
    MapboxMap,
    MapboxRasterLayer,
    MapboxIgsTileLayer,
    MapboxIgsDocLayer,
    MapboxIgsVectorLayer,
    MapboxWmsLayer,
    MapboxWmtsLayer,
    MapboxIgsTdtLayer,
    MapboxArcgisLayer,
    MapboxScaleControl,
    MapboxVectortileLayer
  },
  props: {
    mapStyle: {
      type: Object,
      required: true
    },
    document: {
      type: Object,
      required: true
    },
    center: {
      type: [Object, Array],
      default() {
        return { lng: 114, lat: 30 }
      }
    },
    zoom: {
      type: Number,
      default: 4
    }
  },
  data() {
    return {
      // 使用mapbox样式需要的秘钥
      accessToken:
        'pk.eyJ1IjoicGFybmRlZWRsaXQiLCJhIjoiY2o1MjBtYTRuMDhpaTMzbXhpdjd3YzhjdCJ9.sCoubaHF9-nhGTA-sgz0sA',
      crs: 'EPSG:4326',
      sources: {},
      backgrounds: [],
      rasters: [],
      vectors: []
    }
  },
  watch: {
    document: {
      deep: true,
      handler() {
        this.parseDocument()
      }
    }
  },
  created() {
    this.parseDocument()
  },
  methods: {
    handleLoad(payload) {
      const { map, mapbox } = payload
      const listeners = this.$listeners
      if (listeners && 'onMapLoaded' in listeners) {
        this.$emit('onMapLoaded', payload)
      } else {
        this.$root.$emit('mapbox-load', payload)
      }
    },
    parseDocument() {
      if (!this.document) return
      if (!this.document.layers) return
      this.parseBackgroud()
      this.parseRasterTile()
      this.parseVecterTile()
    },
    isRasterLayer(subtype) {
      return subtype === LayerType.RasterTile
    },
    isVecterLayer(subtype) {
      return subtype === 'VectorTileLayer'
      // return subtype === LayerType.VectorTile
    },
    isIgsDocLayer(subtype) {
      return subtype === SubLayerType.IgsDocLayer
    },
    isIgsTileLayer(subtype) {
      return subtype === SubLayerType.IgsTileLayer
    },
    isIgsVectorLayer(subtype) {
      return subtype === SubLayerType.IgsVectorLayer
    },
    isIgsWmsLayer(subtype) {
      return subtype === SubLayerType.OgcWmsLayer
    },
    isIgsWmtsLayer(subtype) {
      return subtype === SubLayerType.OgcWmtsLayer
    },
    isIgsTdtLayer(subtype) {
      return subtype === SubLayerType.RasterTiandituLayer
    },
    isIgsArcgisLayer(subtype) {
      return subtype === SubLayerType.RasterArcgisLayer
    },
    parseBackgroud() {
      if (!this.document) return
      const idoc = IDocument.deepclone(this.document)
      this.backgrounds = idoc.backgrounds
    },
    parseRasterTile() {
      if (!this.document) return
      const idoc = IDocument.deepclone(this.document)
      const layers = idoc.getConvertLayers(true, false)
      const rasters = layers
        .filter(l => {
          l.source = { type: 'raster', tiles: [l.url] }
          return l.type === 'raster'
        })
        .map(l => {
          if (l.subtype === SubLayerType.IgsDocLayer) {
            const doclayer = new IgsDocLayer(l)
            l = { ...l, ...doclayer }
          } else if (l.subtype === SubLayerType.OgcWmsLayer) {
            const wmslayer = new IgsWmsLayer(l)
            l = { ...l, ...wmslayer }
          } else if (l.subtype === SubLayerType.RasterTiandituLayer) {
            delete l.source
          }
          return l
        })
      this.rasters = rasters
    },
    parseVecterTile() {
      if (!this.document || this.document === {}) return
      const idoc = IDocument.deepclone(this.document)
      const convert = new Convert()
      const layers = convert.docTomvtLayers(idoc, false)
      this.sources = convert.docTomvtSources(idoc)
      const vectors = layers.filter(l => {
        if (l.subtype === 'VectorTileLayer') {
          // if (l.subtype === LayerType.VectorTile) {
          l.sourceId = l.source
          return true
        }
        return false
      })
      this.vectors = vectors
    }
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
