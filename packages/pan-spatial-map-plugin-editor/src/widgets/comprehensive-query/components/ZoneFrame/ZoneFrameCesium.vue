<template>
  <div></div>
</template>

<script lang="ts">
import { Component, Watch, Mixins, Prop, Provide } from 'vue-property-decorator'
import {
  MapMixin,
  ColorUtil,
  Overlay,
  Feature
} from '@mapgis/web-app-framework'

@Component({})
export default class ZoneFramCesium extends Mixins(MapMixin) {
  @Prop({
    type: Object,
    required: true,
    default: () => {
      return {}
    }
  })
  readonly feature!: Feature.FeatureGeoJSON | null

  @Prop({
    type: Object,
    default: () => {
      return {}
    }
  })
  readonly highlightStyle!: Record<string, any>

  @Prop({
    type: Array,
    default: () => {
      return []
    }
  })
  readonly center

  @Prop({
    type: Object,
    default: () => {
      return {}
    }
  })
  readonly fitBound!: Record<string, any>

  private entityNames: string[] = []

  private entityTextNames: string[] = []

  timer = null

  mounted() {
    this.sceneOverlays = Overlay.SceneOverlays.getInstance(
      this.Cesium,
      this.vueCesium,
      this.viewer
    )
    this.featureChange()
    this.timer = window.setTimeout(() => {
      this.clearTimer()
      this.centerChange()
      this.fitBoundChange()
    }, 500)
  }

  clearTimer() {
    if (this.timer !== null) {
      window.clearTimeout(this.timer)
      this.timer = null
    }
  }

  @Watch('feature', { deep: true })
  @Watch('highlightStyle', { deep: true })
  featureChange() {
    this.clear()
    if (this.feature && Object.keys(this.feature).length > 0) {
      // 行政区划几何类型一般是Polygon

      const { features, geometry } = this.feature
      this.entityNames = []
      this.entityTextNames = []

      const fillColor = new this.Cesium.Color.fromCssColorString(
        this.highlightStyle.feature.reg.color
      )

      const fillOutlineColor = new this.Cesium.Color.fromCssColorString(
        this.highlightStyle.feature.line.color
      )

      const width = parseInt(this.highlightStyle.feature.line.size)

      // const coords = this.feature.geometry.coordinates[0]
      let arr
      if (this.center && this.center.length === 2) {
        arr = features
      } else {
        arr = geometry.coordinates
      }
      for (let i = 0; i < arr.length; i += 1) {
        const coords =
          this.center && this.center.length === 2
            ? arr[i].geometry.coordinates[0]
            : arr[i]
        const name = `zone-frame-${i}`
        this.entityNames.push(name)
        this.sceneOverlays.addPolygon(
          name,
          coords
            .join(',')
            .split(',')
            .map(Number),
          fillColor,
          fillOutlineColor,
          false,
          { drawOutLine: true, outlineWidth: width }
        )
        if (this.center && this.center.length === 2) {
          const rgba = ColorUtil.getColorObject('#FD6A6F', 1)
          const textColor = new this.Cesium.Color(
            rgba.r / 255,
            rgba.g / 255,
            rgba.b / 255,
            rgba.a
          )
          const text = this.sceneOverlays.addLabel(
            // 经度、纬度、高程
            this.center[0],
            this.center[1],
            0,
            // 文本内容
            features[i].properties.name,
            {
              // 文字大小、字体样式
              font: '12pt 楷体',
              // 文本颜色
              fillColor: textColor,
              // 文本样式，FILL：只填充；OUTLINE：只显示轮廓；FILL_AND_OUTLINE：填充颜色并显示轮廓
              style: this.Cesium.LabelStyle.FILL_AND_OUTLINE,
              // 边线颜色
              outlineColor: this.Cesium.Color.RED,
              // 边线宽度
              outlineWidth: 3,
              // 文本垂直方向与坐标点的相对位置：LEFT、CENTER、RIGHT
              verticalOrigin: this.Cesium.VerticalOrigin.CENTER,
              // 文本水平方向与坐标点的相对位置：LEFT、CENTER、RIGHT
              horizontalOrigin: this.Cesium.HorizontalOrigin.CENTER
            }
          )
          this.entityTextNames.push(text)
        }
      }
    }
  }

  @Watch('center', { deep: true })
  centerChange() {
    if (this.center && this.center.length > 0) {
      this.viewer.camera.flyTo({
        destination: this.Cesium.Cartesian3.fromDegrees(
          this.center[0],
          this.center[1],
          this.viewer.camera.positionCartographic.height
        )
      })
    }
  }

  @Watch('fitBound', { deep: true })
  fitBoundChange() {
    if (this.fitBound && Object.keys(this.fitBound).length > 0) {
      const { xmin, ymin, xmax, ymax } = this.fitBound
      const rectangle = new this.Cesium.Rectangle.fromDegrees(
        xmin,
        ymin,
        xmax,
        ymax
      )
      this.viewer.camera.flyTo({
        destination: rectangle
      })
    }
  }

  beforeDestroy() {
    this.clear()
    this.clearTimer()
  }

  private clear() {
    for (let i = this.entityNames.length - 1; i >= 0; i -= 1) {
      this.sceneOverlays.removeEntityByName(this.entityNames[i])
      this.entityNames.pop()
    }
    for (let i = this.entityTextNames.length - 1; i >= 0; i -= 1) {
      this.viewer.entities.remove(this.entityTextNames[i])
      this.entityTextNames.pop()
    }
  }
}
</script>

<style lang="less"></style>
