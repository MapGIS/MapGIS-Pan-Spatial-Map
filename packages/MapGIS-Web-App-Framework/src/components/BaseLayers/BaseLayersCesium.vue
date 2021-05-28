<template>
  <div class="BaseLayersMapbox">
    <mapgis-3d-igs-doc-layer
      v-for="layer in docLayers"
      :key="layer.id"
      :url="layer.url"
      :ip="layer.ip"
      :port="layer.port"
      :serverName="layer.serverName"
    />
    <mapgis-3d-igs-tile-layer
      v-for="layer in tileLayers"
      :key="layer.id"
      :url="layer.url"
      :ip="layer.ip"
      :port="layer.port"
      :serverName="layer.serverName"
    />
    <mapgis-3d-tdt-layer
      v-for="layer in tdtLayers"
      :key="layer.id"
      :layerStyle="{ zIndex: layer.layerIndex }"
      :baseURL="layer.baseURL"
      :token="layer.token"
    />
  </div>
</template>

<script lang="ts">
import { Component, Mixins, Inject, Watch, Prop } from 'vue-property-decorator'
import {
  BaseLayersMixin,
  queryOGCInfoInstance
} from '@mapgis/pan-spatial-map-store'
import mapgis3dTdtLayer from '../CesiumLayers/CesiumTdtLayer'
import { WidgetMixin } from '@mapgis/web-app-framework'

@Component({
  components: { mapgis3dTdtLayer }
})
export default class BaseLayersCesium extends Mixins(BaseLayersMixin) {
  @Inject('map') map: any

  @Prop() document!: any

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
