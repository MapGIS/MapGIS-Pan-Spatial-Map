<template>
  <div></div>
</template>

<script lang="ts">
import { Component, Prop, Watch, Mixins, Emit } from 'vue-property-decorator'
import { MapMixin, ThemeMixin, Objects } from '@mapgis/web-app-framework'

@Component
export default class M3DCesium extends Mixins(MapMixin) {
  @Prop({
    type: Boolean,
    default: false
  })
  readonly filterWithMap!: boolean

  @Prop({
    type: String,
    default: ''
  })
  readonly vueIndex!: string

  @Prop({
    type: Object,
    default: () => {
      return {}
    }
  })
  readonly fitBound!: Record<string, any>

  @Prop({
    type: Object,
    default: () => {
      return {}
    }
  })
  readonly highlightStyle!: Record<string, any>

  @Prop({
    type: Object,
    default: () => {
      return {}
    }
  })
  readonly selectionBound!: Record<string, any>

  @Watch('fitBound')
  changeMapBound() {
    if (this.fitBound) {
      const { source } = this.CesiumZondy.M3DIgsManager.findSource(
        'default',
        this.vueIndex
      )
      if (source.length > 0) {
        const tranform = source[0].root.transform
        // const { xmin, ymin, xmax, ymax, zmin, zmax } = this.fitBound
        // const center = {
        //   x: (xmin + xmax) / 2,
        //   y: (ymin + ymax) / 2,
        //   z: zmax * 4
        // }
        let bound = this.sceneController.dataPositionExtentToDegreeExtent(
          this.fitBound,
          tranform
        )
        const width = bound.xmax - bound.xmin
        const height = bound.ymax - bound.ymin
        const center = {
          x: (bound.xmin + bound.xmax) / 2,
          y: (bound.ymin + bound.ymax) / 2
        }
        bound = {
          xmin: center.x - width,
          ymin: center.y - height,
          xmax: center.x + width,
          ymax: center.y + height
        }
        this.webGlobe.viewer.camera.flyTo({
          destination: this.Cesium.Rectangle.fromDegrees(
            bound.xmin,
            bound.ymin,
            bound.xmax,
            bound.ymax
          )
        })
      }
    }
  }

  @Watch('selectionBound')
  changeSelectionBound() {
    this.zoomOrPanTo(this.selectionBound)
  }

  changeFilterWithMap() {
    if (!this.filterWithMap) {
      return
    }
    const cExtent = this.sceneController.getCurrentExtent(this.webGlobe)
    const bounds = {
      xmin: cExtent.xmin,
      ymin: cExtent.ymin,
      xmax: cExtent.xmax,
      ymax: cExtent.ymax
    }
    this.emitMapBoundChange(bounds)
  }

  @Emit('map-bound-change')
  emitMapBoundChange(bound: Record<string, any>) {}

  mounted() {
    this.sceneController = Objects.SceneController.getInstance(
      this.Cesium,
      this.CesiumZondy,
      this.webGlobe
    )
    this.webGlobe.viewer.camera.changed.addEventListener(
      this.changeFilterWithMap
    )
  }

  destroyed() {
    this.webGlobe.viewer.camera.changed.removeEventListener(
      this.changeFilterWithMap
    )
  }

  private zoomOrPanTo(bound) {
    const mapBound = this.getViewExtend()
    // 先查看是否在地图范围内
    if (
      bound.xmin > mapBound.xmin &&
      bound.ymin > mapBound.ymin &&
      bound.xmax < mapBound.xmax &&
      bound.ymax < mapBound.ymax
    ) {
      return
    }
    // 然后查看两个矩形的范围大小，如果选择集的范围较当前大，需要做缩放
    if (
      bound.xmax - bound.xmin > mapBound.xmax - mapBound.xmin ||
      bound.ymax - bound.ymin > mapBound.ymax - mapBound.ymin
    ) {
      const Rectangle = new this.Cesium.Rectangle.fromDegrees(
        bound.xmin,
        bound.ymin,
        bound.xmax,
        bound.ymax
      )
      this.webGlobe.viewer.camera.flyTo({
        destination: Rectangle
      })
    } else {
      this.webGlobe.viewer.camera.flyTo({
        destination: this.Cesium.Cartesian3.fromDegrees(
          (bound.xmin + bound.xmax) / 2,
          (bound.ymin + bound.ymax) / 2,
          this.webGlobe.viewer.camera.positionCartographic.height
        )
      })
    }
  }

  private getViewExtend() {
    const params = {}
    const extend = this.webGlobe.viewer.camera.computeViewRectangle()
    if (typeof extend === 'undefined') {
      // 2D下会可能拾取不到坐标，extend返回undefined,所以做以下转换
      const canvas = this.webGlobe.viewer.scene.canvas
      // canvas左上角坐标转2d坐标
      const upperLeft = new this.Cesium.Cartesian2(0, 0)
      // canvas右下角坐标转2d坐标
      const lowerRight = new this.Cesium.Cartesian2(
        canvas.clientWidth,
        canvas.clientHeight
      )

      const ellipsoid = this.webGlobe.viewer.scene.globe.ellipsoid
      // 2D转3D世界坐标
      const upperLeft3 = this.webGlobe.viewer.camera.pickEllipsoid(
        upperLeft,
        ellipsoid
      )

      // 2D转3D世界坐标
      const lowerRight3 = this.webGlobe.viewer.camera.pickEllipsoid(
        lowerRight,
        ellipsoid
      )

      // 3D世界坐标转弧度
      const upperLeftCartographic = this.webGlobe.viewer.scene.globe.ellipsoid.cartesianToCartographic(
        upperLeft3
      )
      // 3D世界坐标转弧度
      const lowerRightCartographic = this.webGlobe.viewer.scene.globe.ellipsoid.cartesianToCartographic(
        lowerRight3
      )

      // 弧度转经纬度
      const xmin = this.Cesium.Math.toDegrees(upperLeftCartographic.longitude)
      // 弧度转经纬度
      const xmax = this.Cesium.Math.toDegrees(lowerRightCartographic.longitude)

      // 弧度转经纬度
      const ymin = this.Cesium.Math.toDegrees(lowerRightCartographic.latitude)
      // 弧度转经纬度
      const ymax = this.Cesium.Math.toDegrees(upperLeftCartographic.latitude)

      params.xmin = xmin
      params.xmax = xmax
      params.ymin = ymin
      params.ymax = ymax
    } else {
      // 3D获取方式
      params.xmax = this.Cesium.Math.toDegrees(extend.east)
      params.ymax = this.Cesium.Math.toDegrees(extend.north)

      params.xmin = this.Cesium.Math.toDegrees(extend.west)
      params.ymin = this.Cesium.Math.toDegrees(extend.south)
    }
    // 返回屏幕所在经纬度范围
    return params
  }
}
</script>
<style lang="scss" scoped></style>
