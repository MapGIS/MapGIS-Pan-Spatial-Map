<template>
  <mapbox-map
    :center="center"
    :zoom="zoom"
    :access-token="accessToken"
    :map-style="mapStyle"
    :crs="crs"
    @load="handleLoad"
    style="height: 100%; width: 100%"
  >
    <div v-for="layerProps in layers" :key="layerProps.layerId">
      <mapbox-igs-tile-layer
        v-if="isIgsTileLayer(layerProps.type)"
        :layer="layerProps.layer"
        :layerId="layerProps.layerId"
        :sourceId="layerProps.sourceId"
        :url="layerProps.url"
        :serverName="layerProps.serverName"
      />
      <mapbox-igs-doc-layer
        v-if="isIgsDocLayer(layerProps.type)"
        :layer="layerProps.layer"
        :layerId="layerProps.layerId"
        :sourceId="layerProps.sourceId"
        :url="layerProps.url"
        :serverName="layerProps.serverName"
      />
      <mapbox-igs-vector-layer
        v-if="isIgsVectorLayer(layerProps.type)"
        :layer="layerProps.layer"
        :layerId="layerProps.layerId"
        :sourceId="layerProps.sourceId"
        :url="layerProps.url"
        :gdbps="layerProps.gdbps"
      />
      <mapbox-ogc-wmts-layer
        v-if="isWMTSLayer(layerProps.type)"
        :layer="layerProps.layer"
        :layerId="layerProps.layerId"
        :sourceId="layerProps.sourceId"
        :baseUrl="layerProps.baseUrl"
        :wmtsLayer="layerProps.wmtsLayer"
        :tileMatrixSet="layerProps.tileMatrixSet"
        :version="layerProps.version"
        :wmtsStyle="layerProps.wmtsStyle"
        :format="layerProps.format"
      />
      <mapbox-ogc-wms-layer
        v-if="isWMSLayer(layerProps.type)"
        :layer="layerProps.layer"
        :layerId="layerProps.layerId"
        :sourceId="layerProps.sourceId"
        :baseUrl="layerProps.baseUrl"
        :layers="layerProps.layers"
        :version="layerProps.version"
        :token="layerProps.token"
        :reversebbox="layerProps.reversebbox"
      />
      <mapbox-igs-tdt-layer
        v-if="isIgsTdtLayer(layerProps.type)"
        :layer="layerProps"
        :layerId="layerProps.id"
        :sourceId="layerProps.id"
        :baseURL="layerProps.baseURL"
        :token="layerProps.token"
        :crs="crs"
      />
      <mapbox-arcgis-layer
        v-if="isIgsArcgisLayer(layerProps.type)"
        :layer="layerProps"
        :layerId="layerProps.id"
        :sourceId="layerProps.id"
        :url="layerProps.serverUrl"
      />
    </div>
    <mapbox-scale-control :position="'left-bottom'" />
  </mapbox-map>
</template>

<script>
import '@mapgis/mapbox-gl/dist/mapbox-gl.css'
import {
  Layer,
  LayerType,
  LoadStatus,
  LOD,
  TileInfo,
  TileLayer,
  MapImageLayer,
  IGSTileLayer,
  IGSMapImageLayer,
  IGSVectorLayer,
  OGCWMTSLayer,
  OGCWMSLayer
} from '@mapgis/web-app-framework'

import {
  MapboxMap,
  MapboxRasterLayer,
  MapboxIgsTileLayer,
  MapboxIgsDocLayer,
  MapboxIgsVectorLayer,
  MapboxOgcWmtsLayer,
  MapboxOgcWmsLayer,
  MapboxIgsTdtLayer,
  MapboxArcgisLayer,
  MapboxScaleControl
} from '@mapgis/webclient-vue-mapboxgl'

export default {
  name: 'MpMapboxView',
  components: {
    MapboxMap,
    MapboxIgsTileLayer,
    MapboxIgsDocLayer,
    MapboxIgsVectorLayer,
    MapboxOgcWmtsLayer,
    MapboxOgcWmsLayer,
    MapboxIgsTdtLayer,
    MapboxArcgisLayer,
    MapboxScaleControl
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
      layers: []
    }
  },
  watch: {
    document: {
      deep: false,
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
    genMapboxLayerComponentPropsByLayer(layer) {
      let mapboxLayerComponentProps = {}
      let allLayerNames = []

      switch (layer.type) {
        case LayerType.IGSTile:
        case LayerType.IGSMapImage:
          // 构造mapbox图层组件所需要的属性
          mapboxLayerComponentProps = {
            type: layer.type,
            layerId: layer.id,
            url: layer.url,
            layer: {},
            sourceId: layer.id,
            serverName: '' // 组件接口设计不友好:该属性不是必需属性。传了url后就不再需要serverName.这里给空值。
          }

          break
        case LayerType.IGSVector:
          mapboxLayerComponentProps = {
            type: layer.type,
            layerId: layer.id,
            url: layer.url,
            layer: {},
            sourceId: layer.id,
            gdbps: layer.gdbps
          }
          break
        case LayerType.OGCWMTS:
          mapboxLayerComponentProps = {
            type: layer.type,
            layerId: layer.id,
            layer: {},
            sourceId: layer.id,
            baseUrl: layer.url,
            wmtsLayer: layer.activeLayer.id,
            tileMatrixSet: layer.activeLayer.tileMatrixSetId,
            version: layer.version,
            wmtsStyle: layer.activeLayer.styleId,
            format: layer.activeLayer.imageFormat
          }

          break
        case LayerType.OGCWMS:
          allLayerNames = []
          layer.allSublayers.forEach(element => {
            allLayerNames.push(element.name)
          })

          mapboxLayerComponentProps = {
            type: layer.type,
            layerId: layer.id,
            layer: {},
            sourceId: layer.id,
            baseUrl: layer.url,
            layers: allLayerNames,
            version: layer.version,
            token: layer.tokenValue,
            reversebbox: false
          }

          break
        default:
          break
      }

      return mapboxLayerComponentProps
    },
    parseDocument() {
      if (!this.document) return

      // 先将图层置空，避免图层重复添加
      this.layers = []

      this.document.defaultMap.getFlatLayers().forEach(async layer => {
        await layer.load()

        const mapboxLayerComponentProps = this.genMapboxLayerComponentPropsByLayer(
          layer
        )

        this.layers.push(mapboxLayerComponentProps)
      })
    },
    isIgsDocLayer(type) {
      return type === LayerType.IGSMapImage
    },
    isIgsTileLayer(type) {
      return type === LayerType.IGSTile
    },
    isIgsVectorLayer(type) {
      return type === LayerType.IGSVector
    },
    isWMSLayer(type) {
      return type === LayerType.OGCWMS
    },
    isWMTSLayer(type) {
      return type === LayerType.OGCWMTS
    },
    isIgsTdtLayer(type) {
      return false
    },
    isIgsArcgisLayer(type) {
      return false
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
