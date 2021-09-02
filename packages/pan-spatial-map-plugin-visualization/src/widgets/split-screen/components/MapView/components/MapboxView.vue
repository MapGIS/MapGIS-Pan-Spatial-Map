<template>
  <div class="mapbox-view">
    <!-- 二维地图组件 -->
    <mp-web-map-pro @map-load="onMapLoad" :document="document" />
    <!-- 二维地图绘制组件 -->
    <mp-draw-pro v-if="isMapLoaded" ref="draw" @finished="onDrawFinished" />
  </div>
</template>
<script lang="ts">
import { Vue, Component, Prop } from 'vue-property-decorator'
import { Document, Layer, Objects } from '@mapgis/web-app-framework'

@Component
export default class MapboxView extends Vue {
  @Prop() readonly document!: Document

  @Prop({ default: () => ({}) }) readonly layer!: Layer

  isMapLoaded = false

  get drawComponent() {
    return this.$refs.draw
  }

  beforeDestroy() {
    this.isMapLoaded = false
  }

  /**
   * 供父组件调用
   * 二维默认画矩形
   * @param {string} [mode = 'draw-rectangle'] 参考MpDrawPro组件内定义的mode类型
   */
  openDraw(mode = 'draw-rectangle') {
    this.drawComponent.openDraw(mode)
  }

  /**
   * 供父组件调用
   */
  closeDraw() {
    this.drawComponent.closeDraw()
  }

  /**
   * 获取经纬度范围
   */
  getRect({ xmin, ymin, xmax, ymax }) {
    return Objects.GeometryExp.creatRectByMinMax(xmin, ymin, xmax, ymax)
  }

  /**
   * 绘制完成的回调
   */
  onDrawFinished({ mode, feature, shape, center }) {
    if (this.isMapLoaded) {
      const rect = this.getRect(shape)
      this.$emit('draw-finished', { geometry: rect, rect })
    }
  }

  /**
   * 地图加载成功回调
   * @param payload { map, mapbox }
   */
  onMapLoad(payload) {
    this.isMapLoaded = true
    this.$emit('load', payload)
  }
}
</script>

<style lang="less" scoped>
.mapbox-view {
  flex: 1;
  overflow: hidden;
}
</style>
