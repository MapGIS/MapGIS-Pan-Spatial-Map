<template>
  <div></div>
</template>

<script lang="ts">
import { Component, Mixins } from 'vue-property-decorator'
import CesiumLayerMixin from './mixins/cesium-layer'

@Component({ name: 'CesiumTerrainLayer', components: {} })
export default class CesiumTerrainLayer extends Mixins(CesiumLayerMixin) {
  showLayer() {
    this.remove()
    this.addTerrain()
  }

  addTerrain() {
    let { domain } = this
    if (!this.domain) {
      domain = `${this.protocol}://${this.ip}:${this.port}`
    }
    if (!domain || !this.serverName) {
      return
    }
    const url = `${domain}/igs/rest/g3d/${this.serverName}`
    this.terrainLayer = new window.CesiumZondy.Layer.TerrainLayer({
      viewer: this.webGlobe.viewer
    })
    this.layer = this.terrainLayer.append(url, {})
    this.layer.show = this.show
    this.layer.id = this.id
    // 把模型加入到webGlobe里
    // this.webGlobe._m3dServerLayer.push(this.layer)
  }

  remove() {
    if (this.layer) {
      // eslint-disable-next-line no-unused-expressions
      this.terrainLayer && this.terrainLayer.removeTerrain()
      this.layer = undefined
    }
  }
}
</script>

<style scoped></style>
