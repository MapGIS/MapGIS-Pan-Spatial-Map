<template>
  <mapbox-igs-wms-layer
    v-if="options.baseURL"
    :layer="layer"
    :layerId="layer.id"
    :sourceId="layer.id"
    :baseUrl="options.baseURL"
    :layers="options.layers"
    :version="options.version"
    :token="options.token"
    :tileSize="tileSize"
  />
</template>

<script lang="ts">
import { Component, Vue, Prop, Watch } from 'vue-property-decorator'
import { queryOGCInfoInstance } from '@mapgis/pan-spatial-map-store'

const { MapboxIgsWmsLayer } = require('@mapgis/webclient-vue-mapboxgl')

@Component({ name: 'MapboxWmsLayer', components: { MapboxIgsWmsLayer } })
export default class MapboxWmsLayer extends Vue {
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
    type: Number,
    default: 256
  })
  readonly tileSize!: number

  private options: Record<string, any> = {}

  async mounted() {
    await this.getWmsInfo()
  }

  @Watch('url')
  async getWmsInfo() {
    if (!this.url) {
      return
    }
    const obj = await queryOGCInfoInstance.getWMSInfo(this.url)
    let { url } = this
    if (!url) {
      return
    }
    let token: any
    if (url.includes('token') || url.includes('tk')) {
      let str
      if (url.includes('token')) {
        str = url.split('token=')[1]
      } else if (url.includes('tk')) {
        str = url.split('tk=')[1]
      }
      if (str.indexOf('&') > -1) {
        token = str.split('&')[0]
      } else {
        token = str
      }
    }
    url = obj.url || this.url
    if (url.toLowerCase().includes('tianditu') && !token) {
      token = '4c27d6e0e8a90715b23a989d42272fd8'
    }
    this.options = {
      layers: obj.layers,
      version: obj.version || '1.3.0'
    }
    if (token) {
      this.options.token = token
    }
    this.options.baseURL = url
    if (url.includes('?')) {
      this.options.baseURL = url.split('?')[0]
    }
  }
}
</script>

<style scoped></style>
