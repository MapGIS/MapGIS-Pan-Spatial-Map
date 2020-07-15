<template>
  <div>
    <mapbox-igs-tdt-layer
      v-for="layer in tdtLayers"
      :key="layer.id"
      :layer="layer"
      :layerId="layer.id"
      :sourceId="layer.id"
      :baseURL="layer.baseURL"
      :token="layer.token"
      :before="layerId"
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
      :tileMatrixSet="layer.tilematrixSet"
      :zoomOffset="1"
    />
  </div>
</template>

<script lang="ts">
import { Component, Mixins, Prop } from 'vue-property-decorator'
import { BaseLayersMixin } from '@mapgis/pan-spatial-map-store'

const {
  MapboxIgsTdtLayer,
  MapboxIgsWmtsLayer
} = require('@mapgis/webclient-vue-mapboxgl')

@Component({
  components: { MapboxIgsTdtLayer, MapboxIgsWmtsLayer }
})
export default class BaseLayers extends Mixins(BaseLayersMixin) {
  @Prop(String) readonly crs!: string

  @Prop(String) readonly layerId!: string
}
</script>

<style lang="scss"></style>
