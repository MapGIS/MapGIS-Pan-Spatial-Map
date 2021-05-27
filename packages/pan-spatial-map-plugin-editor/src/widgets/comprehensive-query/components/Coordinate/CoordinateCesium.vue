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

import { MapMixin, AppMixin } from '@mapgis/web-app-framework'

import {
  FeatureGeoJSON,
  cesiumUtilInstance,
  utilInstance,
  baseConfigInstance
} from '@mapgis/pan-spatial-map-store'

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
  readonly frameFeature!: FeatureGeoJSON | null

  @Prop({
    type: Object,
    default: () => {
      return {}
    }
  })
  readonly highlightStyle!: Record<string, any>

  private cesiumUtil = cesiumUtilInstance

  private entityNames: string[] = []

  @Emit('picked-coordinate')
  emitPickedCoordinate(pickedCoordinate: number[]) {}

  @Watch('pickable')
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
        this.emitPickedCoordinate([lng, lat])
      }
    }, this.Cesium.ScreenSpaceEventType.LEFT_CLICK)
  }

  @Watch('center', { deep: true })
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

  @Watch('frameFeature', { deep: true })
  private frameFeatureChange(val: FeatureGeoJSON | null) {
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
      }
    }
  }

  @Watch('coordinate')
  coordinateChange() {
    this.clearMarker()
    const marker = {
      name: 'coordinate-marker',
      center: this.coordinate,
      img: `${this.baseUrl}${baseConfigInstance.config.colorConfig.label.image.defaultImg}`
    }
    this.cesiumUtil.addMarkerByFeature(marker)
  }

  private beforeDestroy() {
    this.clearMarker()
    this.clearFrame()
  }

  // 清除
  private clearFrame() {
    for (let i = this.entityNames.length - 1; i >= 0; i -= 1) {
      this.cesiumUtil.removeEntityByName(this.entityNames[i])
      this.entityNames.pop()
    }
  }

  private clearMarker() {
    this.cesiumUtil.removeEntityByName('coordinate-marker')
  }
}
</script>

<style lang="scss"></style>
