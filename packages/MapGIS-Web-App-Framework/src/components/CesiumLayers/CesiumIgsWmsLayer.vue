<template>
  <div></div>
</template>

<script lang="ts">
import { Component, Mixins } from 'vue-property-decorator'
import { queryOGCInfoInstance } from '@mapgis/pan-spatial-map-store'
import CesiumLayerMixin from './mixins/cesium-layer'

@Component({ name: 'CesiumIgsWmsLayer', components: {} })
export default class CesiumIgsWmsLayer extends Mixins(CesiumLayerMixin) {
  async showLayer() {
    if (!this.url) {
      return
    }
    this.remove()
    await this.addWMS()
  }

  remove() {
    if (this.layer) {
      this.webGlobe.removeImageryLayer(this.layer, false)
      this.layer = undefined
    }
  }

  async addWMS() {
    if (!this.url) {
      return
    }
    const obj = await queryOGCInfoInstance.getWMSInfo(this.url)
    let otherOpt: Record<string, any> = {}
    const { url } = this
    if (!url) {
      return
    }
    let token = ''
    if (url.includes('token') || url.includes('tk')) {
      let str = ''
      if (url.includes('token')) {
        // eslint-disable-next-line prefer-destructuring
        str = url.split('token=')[1]
      } else if (url.includes('tk')) {
        // eslint-disable-next-line prefer-destructuring
        str = url.split('tk=')[1]
      }
      if (str && str.includes('&')) {
        // eslint-disable-next-line prefer-destructuring
        token = str.split('&')[0]
      } else {
        token = str
      }
    }
    const baseUrl = obj.url || this.url
    if (baseUrl.toLowerCase().indexOf('tianditu') > -1 && !token) {
      token = '4c27d6e0e8a90715b23a989d42272fd8'
    }
    otherOpt = {
      format: 'image/png',
      service: 'WMS',
      version: obj.version || '1.3.0',
      request: 'GetMap',
      transparent: true,
      tiled: true
    }
    if (token) {
      otherOpt.token = token
    }

    this.layer = this.webGlobe.appendWMSTile(
      baseUrl,
      obj.layers.join(','),
      otherOpt
    )

    this.webGlobe.viewer.imageryLayers.addImageryProvider(this.layer)
    this.layer.show = this.show
    this.layer.id = this.id
  }
}
</script>

<style scoped></style>
