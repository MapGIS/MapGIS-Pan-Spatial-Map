<template>
  <div class="mp-widget-zoom">
    <a-tooltip title="放大" placement="right" :overlay-style="{ zIndex: 1000 }">
      <div class="zoom-in button" @click="onZoomIn">
        <a-icon type="plus" />
      </div>
    </a-tooltip>
    <a-tooltip title="缩小" placement="right" :overlay-style="{ zIndex: 1000 }">
      <div class="zoom-out button" @click="onZoomOut">
        <a-icon type="minus" />
      </div>
    </a-tooltip>
    <a-tooltip title="重置" placement="right" :overlay-style="{ zIndex: 1000 }">
      <div class="button" @click="onRestore">
        <a-icon type="home" />
      </div>
    </a-tooltip>
  </div>
</template>

<script lang="ts">
import { Mixins, Component, Watch } from 'vue-property-decorator'
import { Objects, WidgetMixin } from '@mapgis/web-app-framework'
import _last from 'lodash/last'

@Component({ name: 'MpZoom' })
export default class MpZoom extends Mixins(WidgetMixin) {
  private sceneController = null

  private defaultCameraView = {
    destination: {
      x: -8579846.669255955,
      y: 20871852.812287178,
      z: 16141755.871903004
    },
    orientation: {
      heading: 0.03209985611581789,
      pitch: -1.5635848496585378,
      roll: 0
    },
    positionWC: {
      x: -8579846.66925595,
      y: 20871852.812287178,
      z: 16141755.871903006
    }
  }

  private cameraView = null

  private mapBounds = null

  @Watch('is2DMapMode', { immediate: true })
  is2DMapModeChange(mode2D) {
    if (!mode2D) {
      if (this.webGlobe && !this.cameraView) {
        // fixme 目前的首次加载的初始视角效果不好，先使用defaultCameraView视角做重置视角
        // this.cameraView = this.webGlobe.viewer.camera.getView()
        this.cameraView = this.defaultCameraView
      }
    } else if (this.map && !this.mapBounds) {
      this.mapBounds = this.map.getBounds()
    }
  }

  created() {
    this.sceneController = Objects.SceneController.getInstance(
      this.Cesium,
      this.CesiumZondy,
      this.webGlobe
    )
  }

  onRestore() {
    if (!this.is2DMapMode) {
      this.sceneController.cameraFlyTo(this.cameraView)
    } else if (this.map) {
      const { _ne, _sw } = this.mapBounds
      this.map.setPitch(0)
      this.map.fitBounds([
        [_sw.lng, _sw.lat],
        [_ne.lng, _ne.lat]
      ])
    }
  }

  onZoomIn() {
    if (this.is2DMapMode) {
      if (this.map) {
        this.map.zoomIn()
      }
    } else {
      this.ZoomCesiumView('zoomIn')
    }
  }

  onZoomOut() {
    if (this.is2DMapMode) {
      if (this.map) {
        this.map.zoomOut()
      }
    } else {
      this.ZoomCesiumView('zoomOut')
    }
  }

  // 三维视图的缩放功能
  ZoomCesiumView(type) {
    // 获取当前镜头位置的笛卡尔坐标
    const cameraPos = this.webGlobe.viewer.camera.position
    // 获取当前坐标系标准
    const ellipsoid = this.webGlobe.viewer.scene.globe.ellipsoid
    // 根据坐标系标准，将笛卡尔坐标转换为地理坐标
    const cartographic = ellipsoid.cartesianToCartographic(cameraPos)
    // 获取镜头的高度
    const height = cartographic.height

    // 根据上面当前镜头的位置，获取该中心位置的经纬度坐标
    const centerLon = parseFloat(
      this.Cesium.Math.toDegrees(cartographic.longitude).toFixed(8)
    )
    const centerLat = parseFloat(
      this.Cesium.Math.toDegrees(cartographic.latitude).toFixed(8)
    )
    if (type === 'zoomIn') {
      this.webGlobe.viewer.camera.flyTo({
        destination: this.Cesium.Cartesian3.fromDegrees(
          centerLon,
          centerLat,
          height / 1.8
        ),
        duration: 1.0
      })
    } else if (type === 'zoomOut') {
      this.webGlobe.viewer.camera.flyTo({
        destination: this.Cesium.Cartesian3.fromDegrees(
          centerLon,
          centerLat,
          height * 1.8
        ),
        duration: 1.0
      })
    }
  }
}
</script>

<style lang="less" scoped>
.mp-widget-zoom {
  background: @base-bg-color;
  border-radius: 2px;
  line-height: 32px;
  font-size: 16px;
  box-shadow: 0px 1px 2px 0px @shadow-color;
  color: @text-color;
  text-align: center;
  .button {
    width: 32px;
    height: 32px;
    cursor: pointer;
    &:hover {
      color: @primary-color;
    }
    &:not(:last-of-type) {
      border-bottom: 1px solid @border-color;
    }
  }
}
</style>
