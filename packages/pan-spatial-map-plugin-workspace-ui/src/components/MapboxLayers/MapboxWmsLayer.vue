<template>
  <mapbox-igs-wms-layer
    v-if="options.baseURL"
    :layer="layer"
    :layerId="layer.id"
    :sourceId="layer.id"
    :url="options.baseURL"
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

@Component({ components: { MapboxIgsWmsLayer } })
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
    let token: any = undefined
    if (url.indexOf('token') > -1 || url.indexOf('tk') > -1) {
      let str
      if (url.indexOf('token') > -1) {
        str = url.split('token=')[1]
      } else if (url.indexOf('tk') > -1) {
        str = url.split('tk=')[1]
      }
      if (str.indexOf('&') > -1) {
        token = str.split('&')[0]
      } else {
        token = str
      }
    }
    url = obj.url || this.url
    if (url.toLowerCase().indexOf('tianditu') > -1 && !token) {
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
    if (url.indexOf('?') > -1) {
      this.options.baseURL = url.split('?')[0]
    }
  }
}
</script>

<style scoped></style>
