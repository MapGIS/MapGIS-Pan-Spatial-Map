<template>
  <div></div>
</template>

<script lang="ts">
import { Component, Mixins } from 'vue-property-decorator'
import CesiumLayerMixin from './mixins/cesium-layer'

import { vectorTileListInstance } from '@mapgis/pan-spatial-map-store'

declare const CesiumZondy: any

@Component({ name: 'CesiumVectortileLayer', components: {} })
export default class CesiumVectortileLayer extends Mixins(CesiumLayerMixin) {
  private vectorTileList = vectorTileListInstance

  showLayer() {
    this.remove()
    if (!this.url) {
      return
    }
    this.addVectortile()
  }

  addVectortile() {
    let url = this.url
    if (this.url && this.url.includes(',')) {
      const urls = this.url.split(',')
      url = urls[0]
    }
    const opt = {
      ip: this.ip,
      port: this.port,
      layerName: this.serverName,
      styleUrl: url,
      token: this.token
    }
    this.layer = new CesiumZondy.Overlayer.VectorTileLayer(
      this.webGlobe.viewer,
      opt
    )
    this.layer.name = this.serverName
    this.layer.styleUrls = this.url
    this.vectorTileList.cesiumVectorTileList.push(this.layer)
    this.vectorTileList.cesiumVectorTileNames.push(this.layer.name)
  }

  remove() {
    if (this.layer) {
      this.layer.remove()
      const index = this.vectorTileList.cesiumVectorTileNames.indexOf(
        this.layer.name
      )
      if (index > -1) {
        this.vectorTileList.cesiumVectorTileList.splice(index, 1)
        this.vectorTileList.cesiumVectorTileNames.splice(index, 1)
      }
      this.layer = undefined
    }
  }
}
</script>

<style scoped></style>
