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
      <div class="restore button" @click="onRestore">
        <a-icon type="home" />
      </div>
    </a-tooltip>
  </div>
</template>

<script lang="ts">
import { Mixins, Component } from 'vue-property-decorator'
import { Objects, WidgetMixin } from '@mapgis/web-app-framework'
import _last from 'lodash/last'

@Component({ name: 'MpZoom' })
export default class MpZoom extends Mixins(WidgetMixin) {
  private sceneController = null

  private defaultCameraView = {
    destination: {
      x: -11497134.029909685,
      y: 31691287.057739086,
      z: 23000012.279109716
    },
    orientation: {
      heading: 0.09497969065312528,
      pitch: -1.5659838368719945,
      roll: 0
    },
    positionWC: {
      x: -11497134.029909685,
      y: 31691287.057739094,
      z: 23000012.279109713
    }
  }

  private defaultMapBounds = {
    _ne: {
      lat: 41.29839790254586,
      lng: 118.22836140945924
    },
    _sw: {
      lat: 38.85668647676454,
      lng: 114.64132527664754
    }
  }

  private cameraView = this.defaultCameraView

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
    } else {
      this.map.setBounds(this.defaultMapBounds)
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
  }
  .zoom-in {
    border-bottom: 1px solid @border-color;
  }
}
</style>
