<template>
  <div></div>
</template>

<script lang="ts">
import { Component, Mixins } from 'vue-property-decorator'
import CesiumLayerMixin from './mixins/cesium-layer'

@Component({ name: 'CesiumIgsDocLayer', components: {} })
export default class CesiumIgsDocLayer extends Mixins(CesiumLayerMixin) {
  async showLayer() {
    this.remove()
    await this.getIgsExtent('vector')
    this.addDoc2D(true)
  }

  addDoc2D(flag: boolean) {
    let { domain } = this
    if (!this.domain) {
      domain = `${this.protocol}://${this.ip}:${this.port}`
    }
    if (!domain || !this.serverName) {
      return
    }
    const url = `${domain}/igs/rest/mrms/docs/${this.serverName}`
    this.layer = this.webGlobe.append2DDocTile(url, {})
    this.layer.show = this.show
    this.layer.id = this.id
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
