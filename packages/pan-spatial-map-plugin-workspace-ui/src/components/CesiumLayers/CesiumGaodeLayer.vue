<template>
  <div></div>
</template>

<script lang="ts">
import { Component, Mixins, Prop } from 'vue-property-decorator'
import CesiumLayerMixin from './mixins/cesium-layer'

@Component({ components: {} })
export default class CesiumGaodeLayer extends Mixins(CesiumLayerMixin) {
  @Prop({ type: String, default: '' }) readonly layerType?: string

  showLayer() {
    this.remove()
    if (!this.layerType) {
      return
    }
    this.addGaodeLayer()
  }

  addGaodeLayer() {
    this.layer = this.webGlobe.appendGaodeMap({ type: this.layerType })
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
