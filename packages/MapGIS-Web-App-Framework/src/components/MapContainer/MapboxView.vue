<template>
  <mapgis-web-map
    ref="mapgisWebMap"
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
      <mapgis-igs-tile-layer
        v-if="isIgsTileLayer(layerProps.type)"
        :layer="layerProps.layer"
        :layerId="layerProps.layerId"
        :sourceId="layerProps.sourceId"
        :url="layerProps.url"
        :serverName="layerProps.serverName"
      />
      <mapgis-igs-doc-layer
        v-if="isIgsDocLayer(layerProps.type)"
        :layer="layerProps.layer"
        :layerId="layerProps.layerId"
        :sourceId="layerProps.sourceId"
        :url="layerProps.url"
        :layers="layerProps.layers"
        :serverName="layerProps.serverName"
      />
      <mapgis-igs-vector-layer
        v-if="isIgsVectorLayer(layerProps.type)"
        :layer="layerProps.layer"
        :layerId="layerProps.layerId"
        :sourceId="layerProps.sourceId"
        :url="layerProps.url"
        :gdbps="layerProps.gdbps"
      />
      <mapgis-ogc-wmts-layer
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
      <mapgis-ogc-wms-layer
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
      <mapgis-arcgis-layer
        v-if="isIgsArcgisLayer(layerProps.type)"
        :layer="layerProps.layer"
        :layerId="layerProps.layerId"
        :sourceId="layerProps.sourceId"
        :url="layerProps.url"
      />
      <mapgis-rastertile-layer
        v-if="isRasterLayer(layerProps.type)"
        :layer="layerProps.layer"
        :layerId="layerProps.layerId"
        :sourceId="layerProps.sourceId"
        :url="layerProps.url"
      />
      <mapgis-igs-tdt-layer
        v-if="isIgsTdtLayer(layerProps.type)"
        :layer="layerProps"
        :layerId="layerProps.layerId"
        :sourceId="layerProps.sourceId"
        :baseURL="layerProps.baseURL"
        :token="layerProps.token"
        :crs="crs"
      />
    </div>
    <mapgis-scale :position="'left-bottom'" />
  </mapgis-web-map>
</template>

<script>
import '@mapgis/mapbox-gl/dist/mapbox-gl.css'
import { Layer, LayerType, LoadStatus } from '@mapgis/web-app-framework'
import BaseLayersMapbox from '../BaseLayers/BaseLayersMapbox'

export default {
  name: 'MpMapboxView',
  components: {
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
      crs: 'EPSG:3857',
      sources: {},
      layers: []
    }
  },
  watch: {
    document: {
      deep: true,
      handler() {
        try {
          this.parseDocument()
        } catch (e) {}
      }
    }
  },
  created() {
    this.parseDocument()
  },
  methods: {
    handleLoad(payload) {
      // const { map, mapbox } = payload
      const listeners = this.$listeners
      const webMapgisListeners = this.$refs.mapgisWebMap.$listeners
      // 将mapgis-web-map的事件抛出
      Object.entries(webMapgisListeners).forEach(
        ([k, v]) => k && this.$emit(k, payload)
      )
      if (listeners && 'map-load' in listeners) {
        this.$emit('map-load', payload)
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
        case LayerType.aMapMercatorEMap:
        case LayerType.aMapMercatorSatelliteMap:
        case LayerType.aMapMercatorSatelliteAnnMap:
          tempStr = this.generateWebTileLayerUrl(layer)
          mapboxLayerComponentProps = {
            type: layer.type,
            layerId: layer.id,
            url: tempStr,
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

      this.document.defaultMap
        .clone()
        .getFlatLayers()
        .forEach(layer => {
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
    },
    isRasterLayer(type) {
      return (
        type === LayerType.aMapMercatorEMap ||
        LayerType.aMapMercatorSatelliteMap ||
        LayerType.aMapMercatorSatelliteAnnMap
      )
    },
    generateWebTileLayerUrl(layer) {
      let url = ''
      let beforeSubDomain = ''
      let afterSubDomain = ''

      const subDomainTemplate = '{subDomain}'
      const indexSubDomain = layer.urlTemplate.search(subDomainTemplate)
      beforeSubDomain = layer.urlTemplate.substring(0, indexSubDomain)
      afterSubDomain = layer.urlTemplate.substring(
        indexSubDomain + subDomainTemplate.length
      )

      // 修改说明：该种方式无法真正实现子域名的随机轮询。该需求需要webClient层支持,在获取url时动态生成url。
      // 修改人：马原野 2021年04月28日
      url =
        beforeSubDomain +
        this.generateRandomSubDomain(layer.subDomains) +
        afterSubDomain

      return url
    },
    generateRandomSubDomain(subDomains) {
      return subDomains[Math.floor(Math.random() * subDomains.length)]
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
