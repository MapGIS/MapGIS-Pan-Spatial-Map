<template>
  <div></div>
</template>

<script lang="ts">
import { Component, Mixins } from 'vue-property-decorator'
import CesiumLayerMixin from './mixins/cesium-layer'

@Component({ components: {} })
export default class CesiumDoc3dLayer extends Mixins(CesiumLayerMixin) {
  showLayer() {
    this.remove()
    this.addDoc3D()
  }

  addDoc3D() {
    let { domain } = this
    if (!this.domain) {
      domain = `${this.protocol}://${this.ip}:${this.port}`
    }
    if (!domain || !this.serverName) {
      return
    }
    const url = `${domain}/igs/rest/g3d/${this.serverName}`
    this.layer = this.webGlobe.append(url, {})
    this.layer.show = this.show
  }

  remove() {
    if (this.layer) {
      this.webGlobe.removeDoc(this.layer)
      this.layer = undefined
    }
  }
}
</script>

<style scoped></style>
