<template>
  <div v-if="document" class="mapbox-view">
    <!-- 二维地图组件 -->
    <mp-web-map-pro @map-load="onMapLoad" :document="document" />
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

  get drawComponent() {
    return this.$refs.draw
  }

  beforeDestroy() {
    this.isMapLoaded = false
  }

  /**
   * 供父组件调用
   */
  openDraw() {
    this.drawComponent.openDraw('draw-rectangle')
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

  /**
   * 绘制完成的回调
   */
  onDrawFinished({ mode, feature, shape, center }) {
    if (this.isMapLoaded) {
      this.$emit('draw-finished', shape, shape)
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
