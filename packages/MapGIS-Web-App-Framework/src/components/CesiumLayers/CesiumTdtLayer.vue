<template>
  <div></div>
</template>

<script lang="ts">
import { Component, Mixins } from 'vue-property-decorator'
import CesiumLayerMixin from './mixins/cesium-layer'

@Component({ name: 'CesiumTdtLayer', components: {} })
export default class CesiumTdtLayer extends Mixins(CesiumLayerMixin) {
  showLayer() {
    this.remove()
    this.addTDT()
  }

  addTDT() {
    if (!this.url) {
      return
    }
    if (this.url.toLowerCase().includes('wmts')) {
      let str = this.url.split('gov.cn/')[1]
      if (this.url.indexOf('?') > 0) {
        str = str.split('?')[0]
      }
      const layerType = str.substring(0, str.length - 7)
      if (['img', 'cta', 'ter', 'cia'].includes(layerType)) {
        this.layer = this.webGlobe.appendTDTuMapByWMTS(layerType)
      } else {
        this.layer = this.webGlobe.appendTDTuMap({ type: layerType })
      }
    } else {
      this.layer = this.webGlobe.appendTDTuMap({ url: this.url })
    }
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
