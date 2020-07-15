<template>
  <div></div>
</template>

<script lang="ts">
import { Component, Mixins, Prop } from 'vue-property-decorator'
import CesiumLayerMixin from './mixins/cesium-layer'

@Component({ components: {} })
export default class CesiumGoogleLayer extends Mixins(CesiumLayerMixin) {
  @Prop({ type: String, default: '' }) readonly layerType?: string

  @Prop({ type: String, default: '' }) readonly pType?: string

  showLayer() {
    this.remove()
    if (!this.layerType && !this.pType) {
      return
    }
    this.addGoogleLayer()
  }

  addGoogleLayer() {
    if (this.layerType) {
      this.layer = this.webGlobe.appendGoogleMap(this.layerType)
    } else if (this.pType) {
      this.layer = this.webGlobe.appendGoogleMapExt({ ptype: this.pType })
    }
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
