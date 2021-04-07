<template>
  <cesium-web-globe
    :libPath="libPath"
    :plugin-path="pluginPath"
    @load="handleLoad"
    :key-event-enable="false"
    :base-layer-picker="false"
    :animation="false"
    :fullscreen-button="false"
    style="height: 100%; width: 100%"
  >
    <div v-for="l in rasters" :key="l.id">
      <cesium-igs-tile-layer
        v-if="isIgsTileLayer(l.subtype)"
        :id="l.id"
        :show="l.show"
        :url="l.serverUrl"
        :ip="l.ip"
        :port="l.port"
        :serverName="l.serverName"
      />
      <cesium-igs-doc-layer
        v-if="isIgsDocLayer(l.subtype)"
        :id="l.id"
        :show="l.show"
        :url="l.serverUrl"
        :ip="l.ip"
        :port="l.port"
        :serverName="l.serverName"
      />
      <cesium-igs-wms-layer
        v-if="isIgsWmsLayer(l.subtype)"
        :id="l.id"
        :show="l.show"
        :url="l.serverUrl"
      />
      <cesium-igs-wmts-layer
        v-if="isIgsWmtsLayer(l.subtype)"
        :id="l.id"
        :show="l.show"
        :url="l.serverUrl"
        :serverName="l.serverName"
      />
      <cesium-arcgis-layer
        v-if="isIgsArcgisLayer(l.subtype)"
        :id="l.id"
        :url="l.serverUrl"
        :show="l.show"
      />
      <cesium-doc3d-layer
        v-if="isDoc3dLayer(l.subtype)"
        :id="l.id"
        :show="l.show"
        :url="l.serverUrl"
        :ip="l.ip"
        :port="l.port"
        :serverName="l.serverName"
      />
      <cesium-tile3d-layer
        v-if="isTile3dLayer(l.subtype)"
        :id="l.id"
        :show="l.show"
        :url="l.serverUrl"
        :ip="l.ip"
        :port="l.port"
        :serverName="l.serverName"
      />
      <cesium-pointcloud-layer
        v-if="isPointcloudLayer(l.subtype)"
        :id="l.id"
        :show="l.show"
        :url="l.serverUrl"
        :ip="l.ip"
        :port="l.port"
        :serverName="l.serverName"
      />
      <cesium-vectortile-layer
        v-if="isVectortileLayer(l.subtype)"
        :id="l.id"
        :show="l.show"
        :url="l.serverUrl"
        :ip="l.ip"
        :port="l.port"
        :serverName="l.serverName"
      />
      <cesium-raster-layer
        v-if="isRasterLayer(l.subtype)"
        :id="l.id"
        :show="l.show"
        :url="l.url"
        :alpha="l.opacity"
      />
      <cesium-tdt-layer
        v-if="isIgsTdtLayer(l.subtype)"
        :id="l.id"
        :show="l.show"
        :url="l.baseURL"
      />
      <cesium-terrain-layer
        v-if="isTerrainLayer(l.subtype)"
        :id="l.id"
        :show="l.show"
        :url="l.serverUrl"
        :ip="l.ip"
        :port="l.port"
        :serverName="l.serverName"
      />
    </div>
  </cesium-web-globe>
</template>

<script>
import { IDocument, Layer, VectorTile } from '@mapgis/webclient-store'
import { CesiumWebGlobe, CesiumRasterLayer } from '@mapgis/webclient-vue-cesium'
import CesiumIgsWmsLayer from '../CesiumLayers/CesiumIgsWmsLayer.vue'
import CesiumIgsWmtsLayer from '../CesiumLayers/CesiumIgsWmtsLayer.vue'
import CesiumIgsTileLayer from '../CesiumLayers/CesiumIgsTileLayer.vue'
import CesiumIgsDocLayer from '../CesiumLayers/CesiumIgsDocLayer.vue'
import CesiumArcgisLayer from '../CesiumLayers/CesiumArcgisLayer.vue'
import CesiumDoc3dLayer from '../CesiumLayers/CesiumDoc3dLayer.vue'
import CesiumTile3dLayer from '../CesiumLayers/CesiumTile3dLayer.vue'
import CesiumPointcloudLayer from '../CesiumLayers/CesiumPointcloudLayer.vue'
import CesiumVectortileLayer from '../CesiumLayers/CesiumVectortileLayer.vue'
import CesiumTdtLayer from '../CesiumLayers/CesiumTdtLayer.vue'
import CesiumTerrainLayer from '../CesiumLayers/CesiumTerrainLayer.vue'
import { Map } from '../../store/layer/document'

const { SubLayerType, LayerType } = Layer
const { Convert } = VectorTile

export default {
  name: 'MpCesiumView',
  components: {
    CesiumWebGlobe,
    CesiumRasterLayer,
    CesiumIgsDocLayer,
    CesiumIgsWmsLayer,
    CesiumIgsWmtsLayer,
    CesiumIgsTileLayer,
    CesiumArcgisLayer,
    CesiumDoc3dLayer,
    CesiumTile3dLayer,
    CesiumPointcloudLayer,
    CesiumVectortileLayer,
    CesiumTdtLayer,
    CesiumTerrainLayer
  },
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
      rasters: []
    }
  },
  watch: {
    pageHeight() {
      this.changePageHeight()
    },
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
    parseDocument() {
      this.parseRasterTile()
    },
    parseRasterTile() {
      if (!this.document) return

      const { defaultMap } = this.document

      this.rasters = defaultMap.allLayers
    },
    handleLoad(payload) {
      const { Cesium } = payload
      // 底层传递到window上,通过window取当分屏时是否存在问题???
      const { webGlobe } = window

      this.$root.$emit('cesium-load', { webGlobe, Cesium })

      this.changePageHeight()
    },
    isRasterLayer(subtype) {
      return subtype === 'Raster'
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
    isDoc3dLayer(subtype) {
      return subtype === SubLayerType.IgsDoc3dLayer
    },
    isTile3dLayer(subtype) {
      return subtype === SubLayerType.IgsTile3dLayer
    },
    isPointcloudLayer(subtype) {
      return subtype === LayerType.PointCloudLayer
    },
    isVectortileLayer(subtype) {
      // return subtype === LayerType.VectorTileLayer
      return subtype === 'VectorTileLayer'
    },
    isTerrainLayer(subtype) {
      return subtype === SubLayerType.Terrain
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
