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
    <base-layers-mapbox :document="document" />
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
        :layers="layerProps.layers"
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
      <mapbox-arcgis-layer
        v-if="isIgsArcgisLayer(layerProps.type)"
        :layer="layerProps.layer"
        :layerId="layerProps.layerId"
        :sourceId="layerProps.sourceId"
        :url="layerProps.url"
      />
      <mapbox-igs-tdt-layer
        v-if="isIgsTdtLayer(layerProps.type)"
        :layer="layerProps"
        :layerId="layerProps.layerId"
        :sourceId="layerProps.sourceId"
        :baseURL="layerProps.baseURL"
        :token="layerProps.token"
        :crs="crs"
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
import BaseLayersMapbox from '../BaseLayers/BaseLayersMapbox'

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
    MapboxScaleControl,
    BaseLayersMapbox
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
      // mapbox图层组件所需要的属性
      let mapboxLayerComponentProps = {}

      let allLayerNames = []
      let showLayers = ''
      let visibleSubLayers = []
      // 图层显示样式
      const layerStyle = {
        layout: { visibility: layer.isVisible ? 'visible' : 'none' },
        paint: { 'raster-opacity': layer.opacity }
      }

      let tempStr = ''

      switch (layer.type) {
        case LayerType.IGSTile:
          mapboxLayerComponentProps = {
            type: layer.type,
            layerId: layer.id,
            url: layer.url,
            sourceId: layer.id,
            serverName: '' // 组件接口设计不友好:该属性不是必需属性。传了url后就不再需要serverName.这里给空值。
          }

          break
        case LayerType.IGSMapImage:
          showLayers = 'show:'

          visibleSubLayers = layer.allSublayers.filter(sublayer => {
            if (sublayer.visible) return true
            return false
          })

          visibleSubLayers.forEach((sublayer, index) => {
            showLayers += `${sublayer.id}`

            if (index !== visibleSubLayers.length - 1) {
              showLayers += ','
            }
          })

          mapboxLayerComponentProps = {
            type: layer.type,
            layerId: layer.id,
            url: layer.url,
            sourceId: layer.id,
            layers: showLayers,
            serverName: '' // 组件接口设计不友好:该属性不是必需属性。传了url后就不再需要serverName.这里给空值。
          }

          break
        case LayerType.IGSVector:
          mapboxLayerComponentProps = {
            type: layer.type,
            layerId: layer.id,
            url: layer.url,
            sourceId: layer.id,
            gdbps: layer.gdbps
          }
          break
        case LayerType.OGCWMTS:
          mapboxLayerComponentProps = {
            type: layer.type,
            layerId: layer.id,
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
            if (element.visible) allLayerNames.push(element.name)
          })

          mapboxLayerComponentProps = {
            type: layer.type,
            layerId: layer.id,
            sourceId: layer.id,
            baseUrl: layer.url,
            layers: allLayerNames,
            version: layer.version,
            token: layer.tokenValue,
            reversebbox: false
          }

          break
        case LayerType.arcGISTile:
          // 修改说明：mapbox-arcgis-layer通过url属性中是否含有"MapServer/tile/{z}/{y}/{x}"字符串，来判断该服务是瓦片服务还是地图服务。
          // 故这里要根据瓦片服务的基地址，拼接出完整的取图路径。
          // 修改人：马原野 2021年03月30日

          // mapbox-arcgis-layer所需的url格式："http://services.arcgisonline.com/ArcGIS/rest/services/{layerType}/MapServer/tile/{z}/{y}/{x}.jpg"
          // ArcGISTIleLayer中url的格式：http://[ip]/arcgis/rest/services/{tileName}/MapServer

          tempStr = `${layer.url}/tile/{z}/{y}/{x}.${layer.tileInfo.format}`

          mapboxLayerComponentProps = {
            type: layer.type,
            layerId: layer.id,
            url: tempStr,
            sourceId: layer.id
          }

          break
        case LayerType.arcGISMapImage:
          mapboxLayerComponentProps = {
            type: layer.type,
            layerId: layer.id,
            url: layer.url,
            sourceId: layer.id
          }
          break
        default:
          break
      }

      mapboxLayerComponentProps.layer = layerStyle

      return mapboxLayerComponentProps
    },
    parseDocument() {
      if (!this.document) return

      // 先将图层置空，避免图层重复添加
      const layers = []

      this.document.defaultMap.getFlatLayers().forEach(async layer => {
        if (layer.loadStatus === LoadStatus.notLoaded) await layer.load()

        if (layer.loadStatus === LoadStatus.loaded) {
          const mapboxLayerComponentProps = this.genMapboxLayerComponentPropsByLayer(
            layer
          )

          layers.push(mapboxLayerComponentProps)
        }
      })

      this.layers = layers
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
      return type === LayerType.arcGISMapImage || type === LayerType.arcGISTile
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
