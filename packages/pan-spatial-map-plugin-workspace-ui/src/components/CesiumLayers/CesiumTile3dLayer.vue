<template>
  <div></div>
</template>

<script lang="ts">
import { Component, Mixins } from 'vue-property-decorator'
import CesiumLayerMixin from './mixins/cesium-layer'

@Component({ components: {} })
export default class CesiumTile3dLayer extends Mixins(CesiumLayerMixin) {
  showLayer() {
    this.remove()
    if (!this.url) {
      return
    }
    this.addTile3D()
  }

  addTile3D() {
    this.layer = this.webGlobe.append3DTile(
      this.url,
      this.flyToTileset.bind(this)
    )
    this.layer.show = this.show
  }

  flyToTileset(tileset: any) {
    const { boundingSphere } = tileset
    this.webGlobe.viewer.camera.viewBoundingSphere(
      boundingSphere,
      new this.Cesium.HeadingPitchRange(0.0, -0.5, boundingSphere.radius * 2)
    )
    this.webGlobe.viewer.camera.lookAtTransform(this.Cesium.Matrix4.IDENTITY)
  }

  remove() {
    if (this.layer) {
      this.webGlobe.delete3DTile(this.layer)
      this.layer = undefined
    }
  }
}
</script>

<style scoped></style>
