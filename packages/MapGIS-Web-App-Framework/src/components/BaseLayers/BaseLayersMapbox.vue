<template>
  <div class="BaseLayersMapbox">
    <mapgis-igs-tdt-layer
      v-for="layer in tdtLayers"
      :key="layer.id"
      :layer="layer"
      :layerId="layer.id"
      :sourceId="layer.id"
      :baseURL="layer.baseURL"
      :token="layer.token"
      :before="getBeforeLayerId()"
    />
    <mapgis-igs-wmts-layer
      v-for="layer in wmtsLayers"
      :key="layer.id"
      :layer="layer"
      :layerId="layer.id"
      :sourceId="layer.id"
      :ip="layer.ip"
      :port="layer.port"
      :wmtsLayer="layer.serverName"
      :tileMatrixSet="getWmtsInfo(layer)"
      :before="getBeforeLayerId()"
    />
    <mapgis-igs-tile-layer
      v-for="layer in tileLayers"
      :key="layer.id"
      :layer="layer"
      :layerId="layer.id"
      :sourceId="layer.id"
      :url="layer.url"
      :ip="layer.ip"
      :port="layer.port"
      :serverName="layer.serverName"
      :before="getBeforeLayerId()"
    />
    <mapgis-igs-doc-layer
      v-for="layer in docLayers"
      :key="layer.id"
      :layer="layer"
      :layerId="layer.id"
      :sourceId="layer.id"
      :url="layer.url"
      :ip="layer.ip"
      :port="layer.port"
      :serverName="layer.serverName"
      :before="getBeforeLayerId()"
    />
    <mapgis-arcgis-layer
      v-for="layer in arcgisLayers"
      :key="layer.id"
      :layer="layer"
      :layerId="layer.id"
      :sourceId="layer.id"
      :layerType="layer.layerType"
      :url="layer.url"
      :before="getBeforeLayerId()"
    />
    <mapgis-google-layer
      v-for="layer in googleLayers"
      :key="layer.id"
      :layer="layer"
      :layerId="layer.id"
      :sourceId="layer.id"
      :url="layer.url"
      :layerType="layer.layerType"
      :before="getBeforeLayerId()"
    />
  </div>
</template>

<script lang="ts">
import { Component, Mixins, Inject, Watch, Prop } from 'vue-property-decorator'
import {
  BaseLayersMixin,
  queryOGCInfoInstance
} from '@mapgis/pan-spatial-map-store'
import { WidgetMixin } from '@mapgis/web-app-framework'

// const {
//   MapboxIgsTdtLayer,
//   MapboxIgsWmtsLayer,
//   MapboxIgsTileLayer,
//   MapboxIgsDocLayer,
//   MapboxArcgisLayer,
//   MapboxGoogleLayer
// } = require('@mapgis/webclient-vue-mapboxgl')

@Component({
  components: {
    // MapboxIgsTdtLayer,
    // MapboxIgsWmtsLayer,
    // MapboxIgsTileLayer,
    // MapboxIgsDocLayer,
    // MapboxArcgisLayer,
    // MapboxGoogleLayer
  }
})
export default class BaseLayersMapbox extends Mixins(BaseLayersMixin) {
  @Inject('map') map: any

  @Prop() document!: any

  @Watch('defaultBaseLayerId')
  getBeforeLayerId() {
    if (this.document) {
      const layers = this.document.defaultMap.layers()

      if (layers && layers.length > 0) {
        if (this.map.getSource(layers[0].id)) {
          return layers[0].id
        }
      }
    }

    if (this.map.getSource(this.defaultBaseLayerId)) {
      return this.defaultBaseLayerId
    }
    return undefined
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

<style lang="scss"></style>
