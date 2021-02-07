<template>
  <div></div>
</template>

<script lang="ts">
import { Component, Mixins } from 'vue-property-decorator'
import CesiumLayerMixin from './mixins/cesium-layer'

@Component({ name: 'CesiumArcgisLayer', components: {} })
export default class CesiumArcgisLayer extends Mixins(CesiumLayerMixin) {
  showLayer() {
    this.remove()
    if (!this.url) {
      return
    }
    this.addArcgisLayer()
  }

  addArcgisLayer() {
    this.layer = this.webGlobe.addImageLayer(
      new this.Cesium.ArcGisMapServerImageryProvider({
        url: this.url
      })
    )
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
