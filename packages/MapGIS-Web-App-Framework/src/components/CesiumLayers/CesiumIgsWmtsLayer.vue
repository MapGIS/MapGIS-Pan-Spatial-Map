/* eslint-disable spaced-comment */
<template>
  <div></div>
</template>

<script lang="ts">
import { Component, Mixins } from 'vue-property-decorator'
import { queryOGCInfoInstance } from '@mapgis/pan-spatial-map-store'
import CesiumLayerMixin from './mixins/cesium-layer'

@Component({ name: 'CesiumIgsWmtsLayer', components: {} })
export default class CesiumIgsWmtsLayer extends Mixins(CesiumLayerMixin) {
  async showLayer() {
    if (!this.url) {
      return
    }
    this.remove()
    await this.addWMTS()
  }

  remove() {
    if (this.layer) {
      this.webGlobe.removeImageryLayer(this.layer, false)
      this.layer = undefined
    }
  }

  async addWMTS() {
    if (!this.url) {
      return
    }
    const obj = await queryOGCInfoInstance.getWMTSInfo(this.url)
    const option: Record<string, any> = {}
    let token = ''
    if (this.url.includes('token') || this.url.includes('tk')) {
      for (let i = 0; i < this.url.split('&').length; i += 1) {
        if (
          this.url
            .split('&')
            [i].toLowerCase()
            .includes('token') ||
          this.url
            .split('&')
            [i].toLowerCase()
            .includes('tk')
        ) {
          // eslint-disable-next-line prefer-destructuring
          token = this.url.split('&')[i].split('=')[1]
          break
        }
      }
    }
    let baseUrl = obj.url || this.url
    if (baseUrl.toLowerCase().indexOf('tianditu') > -1 && !token) {
      token = '4c27d6e0e8a90715b23a989d42272fd8'
    }
    if (token) option.token = token

    // 修改说明：修订通过添加服务方式加入的wmts服务,如果用户设置的ServerName不是服务中所包含的图层名时，在三维球上显示不了的问题。
    // 修改人：马原野 2020年11月13日
    const name = obj.title || this.serverName
    if (!name) {
      return
    }

    option.serverName = name
    if (baseUrl.indexOf('ime-cloud/rest') > -1) {
      // 判断是否为吉威服务
      option.from = 'jiwei'
    }
    if (baseUrl.indexOf('?') > -1) {
      // eslint-disable-next-line prefer-destructuring
      baseUrl = baseUrl.split('?')[0]
    }
    this.layer = this.webGlobe.appendWMTSTileExt(baseUrl, option)
    this.layer.show = this.show
    this.layer.id = this.id
  }
}
</script>

<style scoped></style>
