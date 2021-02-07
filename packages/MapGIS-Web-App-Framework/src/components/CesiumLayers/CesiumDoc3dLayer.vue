<template>
  <div></div>
</template>

<script lang="ts">
import { Component, Mixins } from 'vue-property-decorator'
import CesiumLayerMixin from './mixins/cesium-layer'

@Component({ name: 'CesiumDoc3dLayer', components: {} })
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
    this.layer.id = this.id
    // 把模型加入到webGlobe里
    this.webGlobe._m3dServerLayer.push(this.layer)
  }

  remove() {
    if (this.layer) {
      this.webGlobe.removeDoc(this.layer)
      const index = this.webGlobe._m3dServerLayer.indexOf(this.layer)
      if (index > -1) {
        this.webGlobe._m3dServerLayer.splice(index, 1)
      }
      this.layer = undefined
    }
  }
}
</script>

<style scoped></style>
