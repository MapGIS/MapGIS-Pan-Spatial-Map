<template>
  <div></div>
</template>

<script lang="ts">
import { Component, Mixins, Prop } from 'vue-property-decorator'
import CesiumLayerMixin from './mixins/cesium-layer'

@Component({ name: 'CesiumOpenWeatherLayer', components: {} })
export default class CesiumOpenWeatherLayer extends Mixins(CesiumLayerMixin) {
  @Prop({ type: String, default: '' }) readonly layerType?: string
  // 类型有: Pressure,Temperature,Windspeed,Clouds,Label

  @Prop({ type: String, default: 'b1b15e88fa797225412429c150c122a1' })
  readonly appid?: string

  showLayer() {
    this.remove()
    if (!this.layerType) {
      return
    }
    this.addOpenWeatherLayer()
  }

  addOpenWeatherLayer() {
    this.layer = this.webGlobe.appendOpenWeatherMap({
      ptype: this.layerType,
      appid: this.appid
    })
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
