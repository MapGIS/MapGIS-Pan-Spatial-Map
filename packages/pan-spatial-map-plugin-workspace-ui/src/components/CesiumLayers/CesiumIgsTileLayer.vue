<template>
  <div></div>
</template>

<script lang="ts">
import { Component, Mixins } from 'vue-property-decorator'
import CesiumLayerMixin from './mixins/cesium-layer'

@Component({ components: {} })
export default class CesiumIgsTileLayer extends Mixins(CesiumLayerMixin) {
  async showLayer() {
    this.remove()
    await this.getIgsExtent('tile')
    this.addTile2D(true)
  }

  addTile2D(flag: boolean) {
    let { domain } = this
    if (!this.domain) {
      domain = `${this.protocol}://${this.ip}:${this.port}`
    }
    let tileSize = 256
    if (this.layerInfo && this.layerInfo.tileSize) {
      tileSize = this.layerInfo.tileSize
    }
    const otherOptions: Record<string, any> = {
      tileRang: this.Cesium.Rectangle.fromDegrees(-180, -90, 180, 90),
      colNum: 2,
      rowNum: 1,
      maxLevel: 19,
      tileWidth: tileSize,
      tileHeight: tileSize
    }
    if (!flag) {
      // 动态裁图
      otherOptions.mapStyle = 'mapgis-tianditu'
    }
    if (!domain || !this.serverName) {
      return
    }
    const url = `${domain}/igs/rest/mrms/tile/${this.serverName}`
    this.layer = this.webGlobe.appendMapGISTile(url, otherOptions)
    this.layer.show = this.show
  }

  remove() {
    if (this.layer) {
      this.webGlobe.removeImageryLayer(this.layer, false)
      this.layer = undefined
    }
  }
}
</script>

<style scoped></style>
