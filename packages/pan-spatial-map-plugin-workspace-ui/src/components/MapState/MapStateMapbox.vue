<template>
  <div class="map-state-container">
    <span class="state-mouse-position">{{ mousePosition.join(',') }}</span>
    <span class="state-zoom">当前显示级数：第{{ standardZoom }}级</span>
  </div>
</template>

<script lang="ts">
import { Component, Mixins, Watch } from 'vue-property-decorator'
import { MapDocumentMixin } from '@mapgis/pan-spatial-map-store'

@Component({ components: {} })
export default class MapStateMapbox extends Mixins(MapDocumentMixin) {
  private mousePosition = [0, 0]

  private standardZoom = 0

  private isDestory = false

  created() {
    this.isDestory = false
  }

  @Watch('initZoom')
  updateZoom() {
    this.standardZoom = Math.floor(this.initZoom)
    this.map.setZoom(this.standardZoom)
  }

  @Watch('initCenter', { deep: true, immediate: true })
  updateCenter() {
    this.mousePosition = [
      Number(this.initCenter.lng.toFixed(6)),
      Number(this.initCenter.lat.toFixed(6))
    ]

    this.map.setCenter(this.initCenter)
  }

  onMapLoad(map: any) {
    if (this.isDestory) {
      return
    }

    const self = this
    this.standardZoom = Math.floor(this.initZoom)
    this.mousePosition = [
      Number(this.initCenter.lng.toFixed(6)),
      Number(this.initCenter.lat.toFixed(6))
    ]
    map.on('zoom', () => {
      self.standardZoom = Math.floor(map.getZoom())
    })

    map.on('mousemove', function mousemove(e: any) {
      self.mousePosition = [e.lngLat.lng.toFixed(6), e.lngLat.lat.toFixed(6)]
    })
  }

  beforeDestroy() {
    this.isDestory = true
  }
}
</script>

<style scoped>
.map-state-container {
  position: absolute;
  font-size: 12px;
  height: 1.5em;
  line-height: 1.5em;
  bottom: 0em;
  width: 100%;
  background-color: rgba(220, 220, 220, 0.5);
}

.state-mouse-position {
  margin-left: 1em;
  width: 10em;
}

.state-zoom {
  margin-left: 2em;
}
</style>
