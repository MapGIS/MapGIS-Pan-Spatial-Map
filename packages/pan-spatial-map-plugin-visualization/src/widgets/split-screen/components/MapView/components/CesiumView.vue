<template>
  <div v-if="mapViewDocument">
    <!-- 三维地图组件 -->
    <mp-cesium-view
      @map-load="onMapLoad"
      :document="mapViewDocument"
      :vue-key="vueKey"
      :height="700"
    >
      <!-- 多屏联动组件 -->
      <mapgis-3d-link :vue-key="vueKey" :enable="isMapLoaded" />
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

@Component({
  components: {
    MpCesiumView
  }
})
export default class CesiumView extends Vue {
  @Prop() mapViewDocument!: Document

  @Prop({ default: UUID.uuid() }) mapViewId!: string

  drawer = null

  isMapLoaded = false

  get vueKey() {
    return this.mapViewId
  }

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
   * 地图绘制创建
   * @param 笛卡尔集坐标
   * @param 经纬度坐标
   */
  onDrawCreate(cartesian3, lnglat) {
    if (this.isMapLoaded) {
      const [[xmin, ymax], [xmax, ymin]] = lnglat
      this.$emit('on-create', { xmin, ymin, xmax, ymax })
      if (this.drawer) {
        this.drawer.removeEntities()
      }
    }
  }

  beforeDestroyed() {
    this.isMapLoaded = false
  }
}
</script>
