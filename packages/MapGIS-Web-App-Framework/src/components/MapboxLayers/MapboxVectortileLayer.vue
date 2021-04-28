<template>
  <div>
    <mapgis-vector-layer
      v-for="l in layers"
      :key="l.id"
      :layerId="l.id"
      :layer="l"
      :sourceId="l.source"
      :source="sources[l.source]"
    />
  </div>
</template>

<script lang="ts">
import { Component, Vue, Inject, Prop, Watch } from 'vue-property-decorator'
import { eventBus } from '@mapgis/pan-spatial-map-store'
import axios from 'axios'

@Component({ name: 'MapboxVectortileLayer', components: {} })
export default class MapboxVectortileLayer extends Vue {
  // @Inject('mapbox') mapbox: any

  // @Prop({
  //   type: Object,
  //   default: () => {
  //     return {}
  //   }
  // })
  // readonly layer!: Record<string, any>
  private sources = {}

  private layers = []

  @Prop({
    type: String,
    default: null
  })
  readonly url!: string

  mounted() {
    eventBus.$on('update-layers', layers => {
      this.layers = layers
    })
    this.showLayer()
  }

  @Watch('url')
  showLayer() {
    this.remove()
    this.addVectortile()
  }

  async addVectortile() {
    let url = this.url
    if (this.url && this.url.includes(',')) {
      const urls = this.url.split(',')
      url = urls[0]
    }
    const { data } = await axios.get(url)
    this.sources = data.sources
    this.layers = data.layers
  }

  remove() {}
}
</script>

<style scoped></style>
