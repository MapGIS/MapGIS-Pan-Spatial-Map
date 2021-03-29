<template>
  <mapbox-igs-wmts-layer
    v-if="options.url"
    :layer="layer"
    :layerId="layer.id"
    :sourceId="layer.id"
    :baseUrl="options.url"
    :wmtsLayer="options.serverName"
    :tileMatrixSet="options.tilematrixSet"
    :token="options.token"
    :tileSize="tileSize"
  />
</template>

<script lang="ts">
import { Component, Vue, Prop, Watch, Inject } from 'vue-property-decorator'
import { queryOGCInfoInstance } from '@mapgis/pan-spatial-map-store'

const { MapboxIgsWmtsLayer } = require('@mapgis/webclient-vue-mapboxgl')

@Component({ name: 'MapboxWmtsLayer', components: { MapboxIgsWmtsLayer } })
export default class MapboxWmtsLayer extends Vue {
  @Inject('map') map: any

  @Prop({
    type: Object,
    default: () => {
      return {}
    }
  })
  readonly layer!: Record<string, any>

  @Prop({
    type: String,
    default: null
  })
  readonly url!: string

  @Prop({
    type: String,
    default: null
  })
  readonly serverName!: string

  @Prop({
    type: Number,
    default: 256
  })
  readonly tileSize!: number

  get wmtsInfos() {
    return queryOGCInfoInstance.wmtsInfos || {}
  }

  private options: Record<string, any> = {}

  async mounted() {
    await this.getWMTSInfo()
  }

  @Watch('wmtsInfos', { deep: true, immediate: true })
  @Watch('url')
  async getWMTSInfo() {
    if (!this.url) {
      return
    }
    const obj = (await queryOGCInfoInstance.getWMTSInfo(this.url))[0]
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
    if (this.url.toLowerCase().includes('tianditu') && !token) {
      token = '4c27d6e0e8a90715b23a989d42272fd8'
    }
    let url = obj.url || this.url
    if (url.toLowerCase().indexOf('.xml') > -1) {
      url = `${url.split('WMTSServer')[0]}'WMTSServer'`
    }
    const name = obj.title || this.serverName
    if (!name) {
      return
    }
    this.options = {
      url: url,
      serverName: name,
      tilematrixSet: obj.tilematrixSet,
      // wmts服务名称
      layer: name,
      token: token !== '' ? token : null
    }
  }
}
</script>

<style scoped></style>
