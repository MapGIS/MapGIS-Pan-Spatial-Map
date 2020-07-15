<template>
  <div class="map-state-container">
    <span class="state-mouse-position">{{ mousePosition.join(',') }}</span>
  </div>
</template>

<script lang="ts">
import { Component, Mixins, Provide, Watch } from 'vue-property-decorator'
import { MapDocumentMixin } from '@mapgis/pan-spatial-map-store'

@Component({ components: {} })
export default class MapStateCesium extends Mixins(MapDocumentMixin) {
  private mousePosition = [0, 0, 0]

  private isDestory = false

  @Provide()
  get webGlobe() {
    return this.map
  }

  @Provide()
  get Cesium() {
    return this.mapLib
  }

  created() {
    this.isDestory = false
  }

  @Watch('initCenter', { deep: true, immediate: true })
  updateCenter() {
    this.mousePosition = [
      Number(this.initCenter.lng.toFixed(6)),
      Number(this.initCenter.lat.toFixed(6)),
      0
    ]
  }

  onMapLoad(map: any) {
    if (this.isDestory) {
      return
    }
    this.mousePosition = [
      Number(this.initCenter.lng.toFixed(6)),
      Number(this.initCenter.lat.toFixed(6)),
      0
    ]
    // 定义当前场景的画布元素的事件处理
    const handler = new this.Cesium.ScreenSpaceEventHandler(
      this.webGlobe.scene._canvas
    )
    // 设置鼠标移动事件的处理函数，这里负责监听x,y坐标值变化
    handler.setInputAction(movement => {
      // 通过指定的椭球或者地图对应的坐标系，将鼠标的二维坐标转换为对应椭球体三维坐标
      const { ellipsoid } = this.webGlobe.scene.globe
      const cartesian = this.webGlobe.viewer.camera.pickEllipsoid(
        movement.endPosition,
        ellipsoid
      )
      if (cartesian) {
        // 将笛卡尔坐标转换为地理坐标
        const cartographic = ellipsoid.cartesianToCartographic(cartesian)
        // 将弧度转为度的十进制度表示
        const lng = this.Cesium.Math.toDegrees(cartographic.longitude).toFixed(
          6
        ) // 转换后的经度
        const lat = this.Cesium.Math.toDegrees(cartographic.latitude).toFixed(6) // 转换后的纬度

        // 相机高度
        const cameraHeight = this.webGlobe.viewer.camera.positionCartographic.height.toFixed(
          2
        )

        /*
        // 地理高度
        const cartographicHeight = (cartographic.height + 1).toFixed(2)
        // 偏航角
        const heading = this.Cesium.Math.toDegrees(
          this.webGlobe.viewer.camera.heading
        ).toFixed(2)
        // 俯仰角
        const pitch = this.Cesium.Math.toDegrees(
          this.webGlobe.viewer.camera.pitch
        ).toFixed(2)
        */

        this.mousePosition = [lng, lat, cameraHeight]
      }
    }, this.Cesium.ScreenSpaceEventType.MOUSE_MOVE)
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
  color: white;
  background-color: rgba(220, 220, 220, 0.5);
}

.state-mouse-position {
  margin-left: 12em;
  width: 10em;
}
</style>
