<template>
  <div></div>
</template>

<script lang="ts">
import { Component, Mixins } from 'vue-property-decorator'
import CesiumLayerMixin from './mixins/cesium-layer'

@Component({ components: {} })
export default class CesiumPointcloudLayer extends Mixins(CesiumLayerMixin) {
  showLayer() {
    this.remove()
    if (!this.url) {
      return
    }
    this.addPointcloud()
  }

  addPointcloud() {
    this.layer = this.webGlobe.viewer.scene.primitives.add(
      new this.Cesium.Cesium3DTileset({
        url: this.url
      })
    )
    this.layer.readyPromise
      .then((tileset: any) => {
        const { boundingSphere } = tileset
        boundingSphere.radius *= 1.5

        this.webGlobe.viewer.camera.viewBoundingSphere(
          boundingSphere,
          new this.Cesium.HeadingPitchRange(0.0, -0.5, boundingSphere.radius)
        )
        this.webGlobe.viewer.camera.lookAtTransform(
          this.Cesium.Matrix4.IDENTITY
        )

        const cartographic = this.Cesium.Cartographic.fromCartesian(
          tileset.boundingSphere.center
        )
        const surface = this.Cesium.Cartesian3.fromRadians(
          cartographic.longitude,
          cartographic.latitude,
          0.0
        )
        const offset = this.Cesium.Cartesian3.fromRadians(
          cartographic.longitude,
          cartographic.latitude,
          -0.5
        )
        const translation = this.Cesium.Cartesian3.subtract(
          offset,
          surface,
          new this.Cesium.Cartesian3()
        )
        tileset.modelMatrix = this.Cesium.Matrix4.fromTranslation(translation)
      })
      .otherwise((error: Error) => {
        throw error
      })
    this.layer.show = this.show
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
