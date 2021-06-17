<template>
  <div v-if="document" class="cesium-view">
    <!-- 三维地图组件 -->
    <mp-cesium-view
      @map-load="onMapLoad"
      :document="document"
      :vue-key="vueKey"
      :height="height"
    >
      <!-- 多屏联动组件 -->
      <mapgis-3d-link :enable="true" />
    </mp-cesium-view>
    <!-- 绘制组件 -->
    <mapgis-3d-draw
      v-if="isMapLoaded"
      @load="onDrawLoad"
      @drawCreate="onDrawCreate"
      :vue-key="vueKey"
    />
  </div>
</template>
<script lang="ts">
import { Vue, Component, Prop } from 'vue-property-decorator'
import { MpCesiumView, Document, UUID } from '@mapgis/web-app-framework'
import mStateInstance from '../../mixins/map-view-state'

@Component({
  components: {
    MpCesiumView
  }
})
export default class CesiumView extends Vue {
  @Prop() document!: Document

  @Prop({ default: UUID.uuid() }) vueKey!: string

  @Prop({ default: 500 }) height!: number

  drawer = null

  isMapLoaded = false

  enable = false

  /**
   * 开启绘制
   */
  enableDrawer() {
    if (this.drawer) {
      this.drawer.enableDrawRectangle()
    }
  }

  /**
   * 地图加载成功回调
   * @param payload { Cesium, CesiumZondy }
   */
  onMapLoad(payload) {
    this.isMapLoaded = true
    this.$emit('on-load', payload)
  }

  /**
   * 地图绘制组件加载成功的回调
   * @param 绘制组件实例
   */
  onDrawLoad(drawer) {
    if (!this.drawer) {
      this.drawer = drawer
    }
  }

  /**
   * 移除地图绘制实体
   */
  onDrawRemove() {
    if (this.drawer) {
      this.drawer.removeEntities()
    }
  }

  /**
   * 地图绘制创建
   * @param 笛卡尔集坐标
   * @param 经纬度坐标
   */
  onDrawCreate(cartesian3, lnglat) {
    if (this.isMapLoaded) {
      const [[xmin, ymax], [xmax, ymin]] = lnglat
      this.$emit('on-create', { xmin, ymin, xmax, ymax })
      this.onDrawRemove()
    }
  }

  beforeDestroyed() {
    this.isMapLoaded = false
    this.onDrawLoad()
  }
}
</script>
<style lang="less" scoped>
.cesium-view {
  flex: 1;
  overflow: hidden;
}
</style>
