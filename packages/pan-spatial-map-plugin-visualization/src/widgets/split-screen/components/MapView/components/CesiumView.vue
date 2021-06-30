<template>
  <div v-if="document" class="cesium-view">
    <!-- 三维地图组件 -->
    <mp-web-scene-pro
      @map-load="onMapLoad"
      :document="document"
      :vue-key="vueKey"
      :height="height"
    />
    <template v-if="isMapLoaded">
      <!-- 多屏联动组件 -->
      <mapgis-3d-link
        @change="onLinkChange"
        :vue-key="vueKey"
        :enable="isMapLoaded"
        :interval="20"
        :excludes="['default']"
      />
      <!-- 绘制组件 -->
      <mp-3d-draw-pro
        ref="draw3d"
        @finished="onDrawFinished"
        :vue-key="vueKey"
      />
    </template>
  </div>
</template>
<script lang="ts">
import { Vue, Component, Prop } from 'vue-property-decorator'
import { Document, UUID } from '@mapgis/web-app-framework'

@Component
export default class CesiumView extends Vue {
  @Prop() readonly document!: Document

  @Prop({ default: UUID.uuid() }) readonly vueKey!: string

  @Prop({ default: 500 }) readonly height!: number

  isMapLoaded = false

  get drawComponent() {
    return this.$refs.draw3d
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
   * @param payload { Cesium, CesiumZondy }
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
      this.$emit('draw-finished', { mode, feature, shape, center })
    }
  }

  /**
   * 联动组件change
   */
  onLinkChange({ '3d': view3d, '2d': rect2d }) {
    this.$emit('link-changed', rect2d)
  }
}
</script>
<style lang="less" scoped>
.cesium-view {
  flex: 1;
  overflow: hidden;
}
</style>
