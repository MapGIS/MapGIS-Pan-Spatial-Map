<template>
  <div v-if="document" class="mapbox-view">
    <!-- 二维地图组件 -->
    <mp-web-map-pro
      @map-load="onMapLoad"
      :document="document"
      :map-style="mapStyle"
    />
    <!-- 二维地图绘制组件 -->
    <mp-draw-pro v-if="isMapLoaded" ref="draw" @finished="onDrawFinished" />
  </div>
</template>
<script lang="ts">
import { Vue, Component, Prop } from 'vue-property-decorator'
import { Document } from '@mapgis/web-app-framework'

@Component
export default class MapboxView extends Vue {
  @Prop() readonly document!: Document

  isMapLoaded = false

  // 图层样式
  mapStyle = {
    version: 8,
    sources: {},
    layers: [],
    glyphs:
      'http://develop.smaryun.com:6163/igs/rest/mrms/vtiles/fonts/{fontstack}/{range}.pbf'
  }

  get drawComponent() {
    return this.$refs.draw
  }

  beforeDestroyed() {
    this.isMapLoaded = false
  }

  /**
   * 供父组件调用
   */
  openDraw(mode) {
    this.drawComponent.openDraw(mode || 'draw-rectangle')
  }

  /**
   * 供父组件调用
   */
  closeDraw() {
    this.drawComponent.closeDraw()
  }

  /**
   * 地图加载成功回调
   * @param payload { map, mapbox }
   */
  onMapLoad(payload) {
    this.isMapLoaded = true
    this.$emit('load', payload)
  }

  onDrawFinished({ mode, feature, shape, center }) {
    if (this.isMapLoaded) {
      this.$emit('draw-finished', { mode, feature, shape, center })
    }
  }
}
</script>

<style lang="less" scoped>
.mapbox-view {
  flex: 1;
  overflow: hidden;
}
</style>
