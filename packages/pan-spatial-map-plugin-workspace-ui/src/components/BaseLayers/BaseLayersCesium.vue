<template>
  <div class="BaseLayers">
    <cesium-tdt-layer
      v-for="layer in tdtLayers"
      :key="layer.id"
      :url="layer.baseURL"
      :token="layer.token"
      :show="true"
    />
    <cesium-igs-wmts-layer
      v-for="layer in wmtsLayers"
      :key="layer.id"
      :show="true"
      :url="layer.url"
      :serverName="layer.serverName"
    />
    <cesium-arcgis-layer
      v-for="layer in arcgisLayers"
      :key="layer.id"
      :url="layer.baseURL"
      :show="true"
    />

    <cesium-google-layer
      v-for="layer in googleLayers"
      :key="layer.id"
      :layerType="layer.layerType"
      :pType="layer.pType"
      :show="true"
    />
    <cesium-baidu-layer
      v-for="layer in baiduLayers"
      :key="layer.id"
      :layerType="layer.layerType"
      :show="true"
    />
    <cesium-gaode-layer
      v-for="layer in gaodeLayers"
      :key="layer.id"
      :layerType="layer.layerType"
      :show="true"
    />
    <cesium-open-weather-layer
      v-for="layer in openWeatherLayers"
      :key="layer.id"
      :layerType="layer.layerType"
      :appid="layer.appid"
      :show="true"
    />

    <cesium-igs-tile-layer
      v-for="layer in tileLayers"
      :key="layer.id"
      :url="layer.url"
      :ip="layer.ip"
      :port="layer.port"
      :serverName="layer.serverName"
    />
    <cesium-igs-doc-layer
      v-for="layer in docLayers"
      :key="layer.id"
      :show="layer.show"
      :url="layer.url"
      :ip="layer.ip"
      :port="layer.port"
      :serverName="layer.serverName"
    />
  </div>
</template>

<script lang="ts">
import { Component, Mixins } from 'vue-property-decorator'
import { CesiumIgsDocLayer } from '@mapgis/webclient-vue-cesium'
import { BaseLayersMixin } from '@mapgis/pan-spatial-map-store'
import CesiumTdtLayer from '../CesiumLayers/CesiumTdtLayer.vue'
import CesiumIgsWmtsLayer from '../CesiumLayers/CesiumIgsWmtsLayer.vue'
import CesiumArcgisLayer from '../CesiumLayers/CesiumArcgisLayer.vue'
import CesiumGoogleLayer from '../CesiumLayers/CesiumGoogleLayer.vue'
import CesiumBaiduLayer from '../CesiumLayers/CesiumBaiduLayer.vue'
import CesiumGaodeLayer from '../CesiumLayers/CesiumGaodeLayer.vue'
import CesiumOpenWeatherLayer from '../CesiumLayers/CesiumOpenWeatherLayer.vue'
import CesiumIgsTileLayer from '../CesiumLayers/CesiumIgsTileLayer.vue'

@Component({
  components: {
    CesiumTdtLayer,
    CesiumIgsWmtsLayer,
    CesiumArcgisLayer,
    CesiumGoogleLayer,
    CesiumBaiduLayer,
    CesiumGaodeLayer,
    CesiumOpenWeatherLayer,
    CesiumIgsTileLayer,
    CesiumIgsDocLayer
  }
})
export default class BaseLayersCesium extends Mixins(BaseLayersMixin) {}
</script>

<style lang="scss"></style>
