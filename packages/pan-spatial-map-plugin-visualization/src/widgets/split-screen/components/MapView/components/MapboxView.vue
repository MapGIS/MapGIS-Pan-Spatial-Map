<template>
  <div v-if="document" class="mapbox-view">
    <!-- 二维地图组件 -->
    <mp-mapbox-view
      @map-load="onMapLoad"
      :document="document"
      :map-style="mapStyle"
    />
    <!-- 二维地图绘制组件 -->
    <mapgis-draw
      v-if="isMapLoaded"
      ref="mapgisDraw"
      @added="onDrawAdded"
      @drawCreate="onDrawCreated"
      :controls="controls"
    />
  </div>
</template>
<script lang="ts">
import { Vue, Component, Prop } from 'vue-property-decorator'
import { MpMapboxView, Document } from '@mapgis/web-app-framework'
import defaultStyle from '../../../../../assets/style/default-style.json'

@Component({
  components: {
    MpMapboxView
  }
})
export default class MapboxView extends Vue {
  @Prop() document!: Document

  isMapLoaded = false

  mapStyle = defaultStyle

  drawer = null

  controls = {
    point: false,
    line_string: false,
    polygon: false,
    trash: false,
    combine_features: false,
    uncombine_features: false
  }

  /**
   * 开启绘制
   */
  enableDrawer() {
    const drawEl = this.$refs.mapgisDraw
    if (drawEl) {
      drawEl.enableDrawer()
    }
    if (this.drawer) {
      this.drawer.changeMode('draw_rectangle')
    }
  }

  /**
   * 地图加载成功回调
   * @param payload { map, mapbox }
   */
  onMapLoad(payload) {
    this.isMapLoaded = true
    this.$emit('on-load', payload)
  }

  /**
   * 地图绘制添加
   * @param e { drawer }
   */
  onDrawAdded({ drawer }) {
    if (this.isMapLoaded) {
      this.drawer = drawer
      this.$emit('on-add', drawer)
    }
  }

  /**
   * 地图绘制创建
   * @param 要素信息
   */
  onDrawCreated({ features }) {
    if (this.isMapLoaded) {
      const {
        id,
        geometry: { coordinates }
      } = features[0]
      if (this.drawer) {
        this.drawer.delete(id)
      }
      let xmin: number
      let xmax: number
      let ymin: number
      let ymax: number
      coordinates[0].forEach(([lng, lat]) => {
        if (!xmin || lng < xmin) {
          xmin = lng
        }
        if (!xmax || lng > xmax) {
          xmax = lng
        }
        if (!ymin || lat < ymin) {
          ymin = lat
        }
        if (!ymax || lat > ymax) {
          ymax = lat
        }
      })
      this.$emit('on-created', { xmin, ymin, xmax, ymax })
    }
  }

  beforeDestroyed() {
    this.isMapLoaded = false
  }
}
</script>
<style lang="less" scoped>
.mapbox-view {
  flex: 1;
  overflow: hidden;
}
</style>
