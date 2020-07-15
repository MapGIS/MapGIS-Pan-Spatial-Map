<template>
  <cesium-web-globe
    libPath="statics/cesium/Cesium.js"
    pluginPath="statics/cesium/webclient-cesium-plugins.js"
    @load="getMap"
    :style="{ height: pageHeight }"
  >
    <base-layers-cesium />
    <div v-for="l in rasters" :key="l.id">
      <cesium-igs-tile-layer
        v-if="isIgsTileLayer(l.subtype)"
        :url="l.url"
        :ip="l.ip"
        :port="l.port"
        :serverName="l.serverName"
      />
      <cesium-igs-doc-layer
        v-if="isIgsDocLayer(l.subtype)"
        :show="l.show"
        :url="l.url"
        :ip="l.ip"
        :port="l.port"
        :serverName="l.serverName"
      />
      <cesium-igs-wms-layer
        v-if="isIgsWmsLayer(l.subtype)"
        :show="l.show"
        :url="l.serverUrl"
      />
      <cesium-igs-wmts-layer
        v-if="isIgsWmtsLayer(l.subtype)"
        :show="l.show"
        :url="l.url"
        :serverName="l.serverName"
      />
    </div>
    <map-state-cesium />
  </cesium-web-globe>
</template>

<script lang="ts">
import { Component, Watch, Emit, Mixins, Prop } from 'vue-property-decorator'
import { MapDocumentMixin } from '@mapgis/pan-spatial-map-store'
import MapStateCesium from '../MapState/MapStateCesium.vue'
import CesiumIgsWmsLayer from '../CesiumLayers/CesiumIgsWmsLayer.vue'
import CesiumIgsWmtsLayer from '../CesiumLayers/CesiumIgsWmtsLayer.vue'
import CesiumIgsTileLayer from '../CesiumLayers/CesiumIgsTileLayer.vue'
import BaseLayersCesium from '../BaseLayers/BaseLayersCesium.vue'

const { IDocument, Layer, VectorTile } = require('@mapgis/webclient-store')
const {
  CesiumWebGlobe,
  CesiumIgsDocLayer
} = require('@mapgis/webclient-vue-cesium')

const { IgsLayerType } = Layer
const { Convert } = VectorTile

@Component({
  name: 'MpSceneView',
  components: {
    CesiumWebGlobe,
    MapStateCesium,
    CesiumIgsDocLayer,
    CesiumIgsWmsLayer,
    CesiumIgsWmtsLayer,
    CesiumIgsTileLayer,
    BaseLayersCesium
  }
})
export default class MpSceneView extends Mixins(MapDocumentMixin) {
  @Prop(String) readonly pageHeight?: string

  private mapId = ''

  rasters = []

  created() {
    this.parseRasterTile()
  }

  @Watch('pageHeight')
  changePageHeight() {
    const div = document.getElementsByClassName('cesium-viewer')
    if (div.length > 0) {
      div[0].style.height = this.pageHeight
    }
  }

  @Watch('document', { deep: true, immediate: true })
  parseRasterTile() {
    if (!this.document) return

    const doc = IDocument.deepclone(this.document)
    const layers = new Convert().docTomvtLayers(doc, false)
    const rasters = layers.filter((l: any) => {
      l.source = { type: 'raster', tiles: [l.url] }
      if (!l.layout) {
        l.show = true
      } else if (l.layout.visibility === 'none') {
        l.show = false
      } else {
        l.show = true
      }
      return l.type === 'raster'
    })
    this.rasters = rasters
  }

  @Emit('load')
  emitTodo(mapInfo: Record<string, any>) {}

  getMap(e: any) {
    const obj = {
      map: e.component.webGlobe,
      mapLib: e.component.Cesium
    }
    this.emitTodo(obj)
    this.mapId = this.registerMap(obj)
    this.changePageHeight()
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
}
</script>
