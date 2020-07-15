<template>
  <div class="BaseLayers">
    <mapbox-igs-tdt-layer
      v-for="layer in tdtLayers"
      :key="layer.id"
      :layer="layer"
      :layerId="layer.id"
      :sourceId="layer.id"
      :baseURL="layer.baseURL"
      :token="layer.token"
      :before="getBeforeLayerId()"
      :crs="crs"
    />
    <mapbox-igs-wmts-layer
      v-for="layer in wmtsLayers"
      :key="layer.id"
      :layer="layer"
      :layerId="layer.id"
      :sourceId="layer.id"
      :ip="layer.ip"
      :port="layer.port"
      :wmtsLayer="layer.serverName"
      :tileMatrixSet="getWmtsInfo(layer)"
      :zoomOffset="1"
      :before="getBeforeLayerId()"
      :crs="crs"
    />
    <mapbox-igs-tile-layer
      v-for="layer in tileLayers"
      :key="layer.id"
      :layer="layer"
      :layerId="layer.id"
      :sourceId="layer.id"
      :url="layer.url"
      :zoomOffset="1"
      :ip="layer.ip"
      :port="layer.port"
      :serverName="layer.serverName"
      :before="getBeforeLayerId()"
      :crs="crs"
    />
    <mapbox-igs-doc-layer
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
      :crs="crs"
    />
    <mapbox-arcgis-layer
      v-for="layer in arcgisLayers"
      :key="layer.id"
      :layer="layer"
      :layerId="layer.id"
      :sourceId="layer.id"
      :url="layer.url"
      :before="getBeforeLayerId()"
      :crs="crs"
    />
    <mapbox-google-layer
      v-for="layer in googleLayers"
      :key="layer.id"
      :layer="layer"
      :layerId="layer.id"
      :sourceId="layer.id"
      :url="layer.url"
      :layerType="layer.layerType"
      :before="getBeforeLayerId()"
      :crs="crs"
    />
  </div>
</template>

<script lang="ts">
import { Component, Mixins, Prop, Inject, Watch } from 'vue-property-decorator'
import {
  BaseLayersMixin,
  queryOGCInfoInstance
} from '@mapgis/pan-spatial-map-store'

const {
  MapboxIgsTdtLayer,
  MapboxIgsWmtsLayer,
  MapboxIgsTileLayer,
  MapboxIgsDocLayer,
  MapboxArcgisLayer,
  MapboxGoogleLayer
} = require('@mapgis/webclient-vue-mapboxgl')

@Component({
  components: {
    MapboxIgsTdtLayer,
    MapboxIgsWmtsLayer,
    MapboxIgsTileLayer,
    MapboxIgsDocLayer,
    MapboxArcgisLayer,
    MapboxGoogleLayer
  }
})
export default class BaseLayersMapbox extends Mixins(BaseLayersMixin) {
  @Inject('map') map: any

  @Prop(String) readonly crs!: string

  @Watch('defaultBaseLayerId')
  getBeforeLayerId() {
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
