<template>
  <div class="mp-widget-map-mode-picker">
    <a-tooltip
      title="二三维切换"
      placement="right"
      :overlay-style="{ zIndex: 1000 }"
    >
      <div class="button" @click="beforeSwitchMapMode">
        <mp-icon :icon="icon" />
      </div>
    </a-tooltip>
  </div>
</template>

<script lang="ts">
import { Mixins, Component } from 'vue-property-decorator'
import { WidgetMixin, Layer3D, Objects } from '@mapgis/web-app-framework'

@Component({ name: 'MpMapModePicker' })
export default class MpMapModePicker extends Mixins(WidgetMixin) {
  private rectBounds = null

  get icon() {
    return this.is2DMapMode
      ? '<svg class="icon" viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg" width="200" height="200"><defs><style/></defs><path d="M213.705 824.96c128.64 0 221.111-75.246 221.111-177.81 0-83.237-59.685-137.875-155.538-144.183v-1.682c79.872-13.459 129.463-66.835 129.463-141.66 0-90.807-82.378-156.38-196.718-156.38-86.583 0-156.8 37.834-186.642 100.462-7.552 15.543-11.338 29.843-11.338 46.245 0 19.749 13.44 32.786 32.787 32.786 19.328 0 27.74-7.131 34.048-26.898 18.066-55.077 64.31-86.601 128.621-86.601 74.826 0 123.173 39.515 123.173 100.462 0 62.646-51.291 104.246-126.958 104.246h-46.226c-19.749 0-32.786 12.197-32.786 31.543 0 18.908 13.02 31.525 32.786 31.525h47.067c93.33 0 148.81 39.497 148.81 109.714 0 64.732-57.6 110.556-140.8 110.556-72.741 0-124.855-32.366-143.781-87.863-6.309-18.067-16.823-26.057-34.469-26.057-21.851 0-36.15 13.458-36.15 35.31 0 14.72 3.785 28.16 11.776 42.88C46.83 787.967 119.973 824.96 213.705 824.96zm340.919-10.514h172.343c188.343 0 297.198-112.238 297.198-301.806 0-189.586-108.874-299.3-297.198-299.3H554.624c-23.113 0-37.833 15.122-37.833 38.655v523.356c0 23.954 14.72 39.095 37.833 39.095zm38.254-68.937V281.417H721.92c144.201 0 224.475 84.078 224.475 231.625 0 148.389-80.274 232.467-224.475 232.467z"/></svg>'
      : '<svg class="icon" viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg" width="200" height="200"><defs><style/></defs><path d="M37.01 822.29h353.536c21.687 0 35.292-13.623 35.292-34.468 0-20.425-13.605-34.03-35.292-34.03H107.21v-2.14l166.345-161.645c101.248-98.286 131.017-149.34 131.017-214.857 0-97.408-86.345-171.868-201.636-171.868-90.624 0-168.046 48.933-194.012 123.795-5.083 14.5-7.094 26.386-7.094 37.028 0 21.266 12.635 35.292 33.48 35.292 20.005 0 28.508-9.344 34.89-30.61 3.401-13.203 8.082-25.107 14.884-36.17 22.547-37.851 64.677-62.116 117.852-62.116 68.919 0 123.794 48.493 123.794 108.91 0 48.932-19.986 82.102-104.228 165.064L23.406 742.31C5.522 760.174 0 770.816 0 786.56c0 22.126 14.464 35.73 37.01 35.73zm511.78-.86h174.447C913.792 821.43 1024 707.84 1024 515.969c0-191.854-110.19-302.903-300.782-302.903H548.791c-23.406 0-38.272 15.324-38.272 39.132V781.86c0 24.246 14.884 39.57 38.272 39.57zm38.73-69.777V281.984h130.176c146.34 0 227.602 85.102 227.602 234.423 0 150.162-81.261 235.246-227.602 235.246z"/></svg>'
  }

  /**
   * 获取当前视图的经纬度范围
   */
  getCurrentViewRectBounds() {
    let rectBounds = null
    if (!this.is2DMapMode) {
      rectBounds = this.sceneController.getComputeViewRectangle()
    } else if (this.map) {
      const { _ne, _sw } = this.map.getBounds()
      rectBounds = {
        xmin: _sw.lng,
        ymin: _sw.lat,
        xmax: _ne.lng,
        ymax: _ne.lat
      }
    }
    this.rectBounds = rectBounds
  }

  /**
   * 切换模式之前的操作
   */
  beforeSwitchMapMode() {
    // this.getCurrentViewRectBounds()
    this.switchMapMode()
  }

  /**
   * 二三维切换变化后
   */
  // onMapModeChanged() {
  //   const { xmin, ymin, xmax, ymax } = this.rectBounds
  //   if (!this.is2DMapMode) {
  //     this.sceneController.CameraSetView({
  //       destination: this.sceneController.getCartesian3FromDegrees(
  //         (xmin + xmax) / 2,
  //         (ymin + ymax) / 2,
  //         this.sceneController.getPositionCartographicHeight() * 2
  //       )
  //     })
  //   } else {
  //     this.map.fitBounds(
  //       [
  //         [xmax, ymin],
  //         [xmin, ymax]
  //       ],
  //       {
  //         animate: false
  //       }
  //     )
  //   }
  // }

  created() {
    this.sceneController = Objects.SceneController.getInstance(
      this.Cesium,
      this.CesiumZondy,
      this.webGlobe
    )
  }
}
</script>

<style lang="less" scoped>
.mp-widget-map-mode-picker {
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
}
</style>
