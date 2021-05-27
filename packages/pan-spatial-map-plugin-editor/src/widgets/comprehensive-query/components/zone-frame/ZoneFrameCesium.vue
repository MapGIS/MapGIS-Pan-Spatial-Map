<template>
  <div></div>
</template>

<script lang="ts">
import { Component, Watch, Mixins, Prop, Provide } from 'vue-property-decorator'
import { MapMixin } from '@mapgis/web-app-framework'
import { bboxPolygon, lineString, bbox } from '@turf/turf'
import {
  utilInstance,
  FeatureGeoJSON,
  cesiumUtilInstance
} from '@mapgis/pan-spatial-map-store'

@Component({})
export default class ZoneFramCesium extends Mixins(MapMixin) {
  @Prop({
    type: Object,
    required: true,
    default: () => {
      return {}
    }
  })
  readonly geojson!: FeatureGeoJSON | null

  @Prop({ type: String, default: '#FF0000' })
  readonly fillOutlineColor!: string

  @Prop({ type: String, default: '#EFFF5F' })
  readonly fillColor!: string

  @Prop({
    type: Object,
    default: () => {
      return {}
    }
  })
  readonly bounds!: Record<string, any>

  private cesiumUtil = cesiumUtilInstance

  private entityNames: string[] = []

  private entityTextNames: string[] = []

  mounted() {
    this.cesiumUtil.setCesiumGlobe(this.Cesium, this.webGlobe)
  }

  @Watch('geojson')
  changeGeojson(val: FeatureGeoJSON | null) {
    this.clear()
    if (val && Object.keys(val).length > 0) {
      // 行政区划几何类型一般是Polygon
      const { features } = val
      this.entityNames = []
      this.entityTextNames = []
      const rgba = utilInstance.getRGBA(this.fillColor, 0.75)
      const fillColor = new this.Cesium.Color(
        rgba.r / 255,
        rgba.g / 255,
        rgba.b / 255,
        rgba.a
      )
      const outlineRgba = utilInstance.getRGBA(this.fillOutlineColor, 0.75)
      const fillOutlineColor = new this.Cesium.Color(
        outlineRgba.r / 255,
        outlineRgba.g / 255,
        outlineRgba.b / 255,
        outlineRgba.a
      )
      for (let i = 0; i < features.length; i += 1) {
        const coords = features[i].geometry.coordinates[0]
        const name = `zone-frame-${i}`
        this.entityNames.push(name)
        this.cesiumUtil.appendPolygon(
          name,
          coords
            .join(',')
            .split(',')
            .map(Number),
          fillColor,
          fillOutlineColor
        )
        if (this.bounds && JSON.stringify(this.bounds) !== '{}') {
          const center = utilInstance.getGeoJsonFeatureCenter(features[i])
          const rgba = utilInstance.getRGBA('#FD6A6F', 1)
          const textColor = new this.Cesium.Color(
            rgba.r / 255,
            rgba.g / 255,
            rgba.b / 255,
            rgba.a
          )
          const text = this.webGlobe.appendLabel(
            // 经度、纬度、高程
            center[0],
            center[1],
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
      if (val && JSON.stringify(val) !== '{}') {
        const box = bbox(val)
        const rectangle = new this.Cesium.Rectangle.fromDegrees(
          box[0],
          box[1],
          box[2],
          box[3]
        )
        this.webGlobe.viewer.camera.flyTo({
          destination: rectangle
        })
      }

      // const center = utilInstance.getFeaturesCenter(val.features)
      // this.webGlobe.flyTo(center[0], center[1], 10000000, 2)
    }
  }

  @Watch('bounds', { deep: true })
  fitBounds() {
    if (this.bounds && Object.keys(this.bounds).length > 0) {
      const { xmin, ymin, xmax, ymax } = this.bounds
      // eslint-disable-next-line new-cap
      const rectangle = new this.Cesium.Rectangle.fromDegrees(
        xmin,
        ymin,
        xmax,
        ymax
      )
      this.webGlobe.viewer.camera.flyTo({
        destination: rectangle
      })
    }
  }

  clear() {
    debugger
    for (let i = this.entityNames.length - 1; i >= 0; i -= 1) {
      this.cesiumUtil.removeEntityByName(this.entityNames[i])
      this.entityNames.pop()
    }
    for (let i = this.entityTextNames.length - 1; i >= 0; i -= 1) {
      this.webGlobe.viewer.entities.remove(this.entityTextNames[i])
      this.entityTextNames.pop()
    }
  }

  private deactivated() {
    this.clear()
  }

  onMapClear() {
    this.clear()
  }
}
</script>

<style lang="scss"></style>
