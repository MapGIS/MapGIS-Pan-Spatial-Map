<template>
  <div></div>
</template>

<script lang="ts">
import {
  Component,
  Watch,
  Mixins,
  Provide,
  Prop,
  Emit
} from 'vue-property-decorator'

import {
  MapMixin,
  AppMixin,
  ColorUtil,
  Feature,
  Overlay
} from '@mapgis/web-app-framework'

import { markerIconInstance } from '@mapgis/pan-spatial-map-store'

@Component({
  components: {}
})
export default class CoordinateCesium extends Mixins(MapMixin, AppMixin) {
  @Prop({
    type: Boolean,
    default: false
  })
  readonly pickable!: boolean

  @Prop({
    type: Array,
    default: () => {
      return []
    }
  })
  readonly coordinate!: number[]

  @Prop({
    type: Array,
    default: () => {
      return []
    }
  })
  readonly center!: number[]

  @Prop({
    type: Object,
    required: true,
    default: () => {
      return {}
    }
  })
  readonly frameFeature!: Feature.FeatureGeoJSON | null

  @Prop({
    type: Object,
    default: () => {
      return {}
    }
  })
  readonly highlightStyle!: Record<string, any>

  private entityNames: string[] = []

  private entityTextNames: string[] = []

  @Emit('picked-coordinate')
  emitPickedCoordinate(pickedCoordinate: number[]) {}

  @Watch('pickable', { immediate: true })
  private pickableChange() {
    // 定义当前场景的画布元素的事件处理
    const handler = new this.Cesium.ScreenSpaceEventHandler(
      this.webGlobe.scene._canvas
    )
    // 设置鼠标移动事件的处理函数，这里负责监听x,y坐标值变化
    handler.setInputAction(movement => {
      if (!this.pickable) return
      // 通过指定的椭球或者地图对应的坐标系，将鼠标的二维坐标转换为对应椭球体三维坐标
      const { ellipsoid } = this.webGlobe.scene.globe
      const cartesian = this.webGlobe.viewer.camera.pickEllipsoid(
        movement.position,
        ellipsoid
      )
      if (cartesian) {
        // 将笛卡尔坐标转换为地理坐标
        const cartographic = ellipsoid.cartesianToCartographic(cartesian)
        // 将弧度转为度的十进制度表示
        const lng = this.Cesium.Math.toDegrees(cartographic.longitude) // 转换后的经度
        const lat = this.Cesium.Math.toDegrees(cartographic.latitude) // 转换后的纬度
        this.emitPickedCoordinate([lng, lat], false)
      }
    }, this.Cesium.ScreenSpaceEventType.LEFT_CLICK)
  }

  @Watch('center', { deep: true, immediate: true })
  centerChange() {
    if (this.center && this.center.length > 0) {
      this.webGlobe.viewer.camera.flyTo({
        destination: this.Cesium.Cartesian3.fromDegrees(
          this.center[0],
          this.center[1],
          this.webGlobe.viewer.camera.positionCartographic.height
        )
      })
    }
  }

  @Watch('frameFeature', { deep: true, immediate: true })
  private frameFeatureChange(val: Feature.FeatureGeoJSON | null) {
    this.clearFrame()
    if (val && Object.keys(val).length > 0) {
      // 行政区划几何类型一般是Polygon
      const { features } = val
      this.entityNames = []
      const fillColor = new this.Cesium.Color.fromCssColorString(
        this.highlightStyle.feature.reg.color
      )

      const fillOutlineColor = new this.Cesium.Color.fromCssColorString(
        this.highlightStyle.feature.line.color
      )

      const width = parseInt(this.highlightStyle.feature.line.size)

      for (let i = 0; i < features.length; i += 1) {
        const coords = features[i].geometry.coordinates[0]
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
          { drawOutLine: true, outlineWidth: width }
        )
        const center = Feature.getGeoJSONFeatureCenter(features[i])
        const rgba = ColorUtil.getColorObject('#FD6A6F', 1)
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
  }

  @Watch('coordinate', { immediate: true })
  async coordinateChange() {
    const defaultImg = await markerIconInstance.unSelectIcon()
    const marker = {
      name: 'coordinate-marker',
      center: this.coordinate,
      img: defaultImg
    }
    this.sceneOverlays.addMarker(marker)
  }

  mounted() {
    this.sceneOverlays = Overlay.SceneOverlays.getInstance(
      this.Cesium,
      this.CesiumZondy,
      this.webGlobe
    )
  }

  private beforeDestroy() {
    this.clearMarker()
    this.clearFrame()
  }

  // 清除
  private clearFrame() {
    for (let i = this.entityNames.length - 1; i >= 0; i -= 1) {
      this.sceneOverlays.removeEntityByName(this.entityNames[i])
      this.entityNames.pop()
    }
    for (let i = this.entityTextNames.length - 1; i >= 0; i -= 1) {
      this.webGlobe.viewer.entities.remove(this.entityTextNames[i])
      this.entityTextNames.pop()
    }
  }

  private clearMarker() {
    this.sceneOverlays.removeEntityByName('coordinate-marker')
  }
}
</script>

<style lang="scss"></style>
