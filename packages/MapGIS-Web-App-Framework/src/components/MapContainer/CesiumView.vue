<template>
  <mapgis-web-scene
    :libPath="libPath"
    :plugin-path="pluginPath"
    @load="handleLoad"
    :key-event-enable="false"
    :base-layer-picker="false"
    :animation="false"
    :fullscreen-button="false"
    style="height: 100%; width: 100%"
  >
    <base-layers-cesium :document="document" />
    <div v-for="layerProps in layers" :key="layerProps.layerId">
      <mapgis-3d-igs-tile-layer
        v-if="isIgsTileLayer(layerProps.type)"
        :id="layerProps.layerId"
        :show="layerProps.show"
        :url="layerProps.url"
      />
      <mapgis-3d-igs-doc-layer
        v-if="isIgsDocLayer(layerProps.type)"
        :id="layerProps.layerId"
        :show="layerProps.show"
        :url="layerProps.url"
      />
      <mapgis-3d-ogc-wms-layer
        v-if="isWMSLayer(layerProps.type)"
        :layerStyle="layerProps.layerStyle"
        :id="layerProps.layerId"
        :url="layerProps.url"
        :layers="layerProps.layers"
      />
      <mapgis-3d-ogc-wmts-layer
        v-if="isWMTSLayer(layerProps.type)"
        :layerStyle="layerProps.layerStyle"
        :id="layerProps.layerId"
        :options="layerProps.options"
        :url="layerProps.url"
        :layer="layerProps.layer"
        :wmtsStyle="layerProps.wmtsStyle"
        :srs="layerProps.srs"
        :tileMatrixSetID="layerProps.tileMatrixSetID"
      />
      <cesium-arcgis-layer
        v-if="isArcgisMapLayer(layerProps.type)"
        :id="layerProps.layerId"
        :url="layerProps.url"
        :show="layerProps.show"
      />
      <cesium-raster-layer
        v-if="isRasterLayer(layerProps.type)"
        :id="layerProps.layerId"
        :show="layerProps.show"
        :url="layerProps.url"
        :alpha="layerProps.opacity"
      />
      <cesium-vectortile-layer
        v-if="isVectorTileLayer(layerProps.type)"
        :id="layerProps.layerId"
        :show="layerProps.show"
        :url="layerProps.url"
        :ip="layerProps.ip"
        :port="layerProps.port"
        :serverName="layerProps.serverName"
      />
      <cesium-doc3d-layer
        v-if="isDoc3dLayer(layerProps.type)"
        :id="layerProps.layerId"
        :show="layerProps.show"
        :url="layerProps.url"
        :ip="layerProps.ip"
        :port="layerProps.port"
        :serverName="layerProps.serverName"
      />
      <cesium-tile3d-layer
        v-if="isTile3dLayer(layerProps.type)"
        :id="layerProps.layerId"
        :show="layerProps.show"
        :url="layerProps.url"
        :ip="layerProps.ip"
        :port="layerProps.port"
        :serverName="layerProps.serverName"
      />
      <cesium-pointcloud-layer
        v-if="isPointcloudLayer(layerProps.type)"
        :id="layerProps.layerId"
        :show="layerProps.show"
        :url="layerProps.url"
        :ip="layerProps.ip"
        :port="layerProps.port"
        :serverName="layerProps.serverName"
      />
      <cesium-terrain-layer
        v-if="isTerrainLayer(layerProps.type)"
        :id="layerProps.layerId"
        :show="layerProps.show"
        :url="layerProps.url"
        :ip="layerProps.ip"
        :port="layerProps.port"
        :serverName="layerProps.serverName"
      />
    </div>
  </mapgis-web-scene>
</template>

<script>
import { Layer, LayerType, LoadStatus } from '@mapgis/web-app-framework'
import BaseLayersCesium from '../BaseLayers/BaseLayersCesium'

export default {
  name: 'MpCesiumView',
  components: { BaseLayersCesium },
  props: {
    document: {
      type: Object,
      required: true
    },
    libPath: {
      type: String
    },
    pluginPath: {
      type: String
    }
  },
  data() {
    return {
      layers: []
    }
  },
  watch: {
    pageHeight() {
      this.changePageHeight()
    },
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
    parseDocument() {
      if (!this.document) return

      // 先将图层置空，避免图层重复添加
      const layers = []

      this.document.defaultMap
        .clone()
        .getFlatLayers()
        .forEach(layer => {
          if (layer.loadStatus === LoadStatus.loaded) {
            const layerComponentProps = this.genLayerComponentPropsByLayer(
              layer
            )
            layers.push(layerComponentProps)
          }
        })

      this.layers = layers
    },
    genLayerComponentPropsByLayer(layer) {
      // mapbox图层组件所需要的属性
      let layerComponentProps = {}

      let allLayerNames = []
      let showLayers = ''
      let visibleSubLayers = []
      // 图层显示样式
      const layerStyle = {
        visible: layer.isVisible,
        opacity: layer.opacity,
        zIndex: 100
      }

      let tempStr = ''
      let parms = {}

      switch (layer.type) {
        case LayerType.IGSTile:
          parms = layer._parseUrl(layer.url)
          layerComponentProps = {
            type: layer.type,
            layerId: layer.id,
            url: layer.url,
            sourceId: layer.id,
            ip: parms.ip,
            port: parms.port,
            serverName: parms.tileName
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

          layerComponentProps = {
            type: layer.type,
            layerId: layer.id,
            url: layer.url,
            sourceId: layer.id,
            layers: showLayers,
            serverName: '' // 组件接口设计不友好:该属性不是必需属性。传了url后就不再需要serverName.这里给空值。
          }

          break
        case LayerType.IGSVector:
          layerComponentProps = {
            type: layer.type,
            layerId: layer.id,
            url: layer.url,
            sourceId: layer.id,
            gdbps: layer.gdbps
          }
          break
        case LayerType.OGCWMTS:
          layerComponentProps = {
            type: layer.type,
            layerId: layer.id,
            url: layer.url,
            srs: `EPSG:${layer.spatialReference.wkid}`,
            tileMatrixSetID: layer.activeLayer.tileMatrixSetId,
            layer: layer.activeLayer.id,
            wmtsStyle: layer.activeLayer.styleId
          }

          break
        case LayerType.OGCWMS:
          allLayerNames = []
          layer.allSublayers.forEach(element => {
            if (element.visible && element.name)
              allLayerNames.push(element.name)
          })

          layerComponentProps = {
            type: layer.type,
            layerId: layer.id,
            url: layer.url,
            layers: allLayerNames.join(',')
          }

          break
        case LayerType.arcGISTile:
          layerComponentProps = {
            type: layer.type,
            layerId: layer.id,
            baseUrl: layer.url,
            sourceId: layer.id
          }

          break
        case LayerType.arcGISMapImage:
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

          layerComponentProps = {
            type: layer.type,
            layerId: layer.id,
            baseUrl: layer.url,
            layers: showLayers,
            sourceId: layer.id
          }
          break
        case LayerType.aMapMercatorEMap:
        case LayerType.aMapMercatorSatelliteMap:
        case LayerType.aMapMercatorSatelliteAnnMap:
          tempStr = this.generateWebTileLayerUrl(layer)
          layerComponentProps = {
            type: layer.type,
            layerId: layer.id,
            url: tempStr,
            sourceId: layer.id
          }
          break
        case LayerType.vectorTile:
          layerComponentProps = {
            type: layer.type,
            mvtStyle: layer.currentStyle
          }

          break
        default:
          break
      }

      if (layer.type !== LayerType.vectorTile)
        layerComponentProps = { ...layerComponentProps, layerStyle }

      return layerComponentProps
    },
    handleLoad(payload) {
      const { Cesium, CesiumZondy } = payload
      // 底层传递到window上,通过window取当分屏时是否存在问题???
      const { webGlobe } = window

      this.$root.$emit('cesium-load', { webGlobe, Cesium, CesiumZondy })

      this.changePageHeight()
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
    isArcgisMapLayer(type) {
      return type === LayerType.arcGISMapImage
    },
    isArcgisTileLayer(type) {
      return type === LayerType.arcGISTile
    },
    isRasterLayer(type) {
      return (
        type === LayerType.aMapMercatorEMap ||
        type === LayerType.aMapMercatorSatelliteMap ||
        type === LayerType.aMapMercatorSatelliteAnnMap
      )
    },
    isVectorTileLayer(type) {
      return type === LayerType.vectorTile
    },
    isDoc3dLayer(type) {
      return false
    },
    isTile3dLayer(type) {
      return false
    },
    isPointcloudLayer(type) {
      return false
    },
    isTerrainLayer(type) {
      return false
    },
    changePageHeight() {
      const div = document.getElementsByClassName('cesium-viewer')
      if (div.length > 0) {
        div[0].style.height = this.pageHeight
      }
    }
  }
}
</script>
