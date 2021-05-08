<template>
  <div class="coordinate column q-pa-md"></div>
</template>

<script lang="ts">
/* eslint-disable @typescript-eslint/no-non-null-assertion */
import {
  Component,
  Watch,
  Mixins,
  Provide,
  Prop,
  Emit
} from 'vue-property-decorator'

import { MapMixin } from '@mapgis/web-app-framework'

import {
  FeatureGeoJSON,
  cesiumUtilInstance,
  utilInstance
} from '@mapgis/pan-spatial-map-store'
import MarkerBlue from '../../../assets/images/markerBlue.png'

@Component({
  components: {}
})
export default class CoordinateCesium extends Mixins(MapMixin) {
  @Prop({
    type: Object,
    required: true,
    default: () => {
      return {}
    }
  })
  readonly geojson!: FeatureGeoJSON | null

  @Prop({
    type: Object,
    default: () => {
      return {}
    }
  })
  readonly bounds!: Record<string, any>

  @Prop({
    type: Boolean,
    default: false
  })
  readonly isClick!: boolean

  @Prop({
    type: Array,
    default: () => {
      return []
    }
  })
  readonly coordinate!: number[]

  @Emit('mapCoordinate')
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  emitMapCoordinate(mapCoordinate: number[]) {}

  private cesiumUtil = cesiumUtilInstance

  private entityNames: string[] = []

  // 底图坐标
  private mapCoordinate = [0, 0]

  private fillOutlineColor = '#484896'

  private fillColor = '#6e599f'

  private markerBlue = MarkerBlue

  private mounted() {
    console.log('mounted')
    this.onGeojsonChanged()
    this.onCoordChanged()
    this.onInteractModeChanged()
  }

  private destroyed() {
    this.clearCoordinate()
  }

  @Watch('coordinate')
  private onCoordChanged() {
    this.mapCoordinate = this.coordinate
  }

  @Watch('isClick')
  private onInteractModeChanged() {
    // 定义当前场景的画布元素的事件处理
    const handler = new this.Cesium.ScreenSpaceEventHandler(
      this.webGlobe.scene._canvas
    )
    // 设置鼠标移动事件的处理函数，这里负责监听x,y坐标值变化
    handler.setInputAction(movement => {
      if (!this.isClick) return
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
        this.mapCoordinate = [lng, lat]
        this.emitMapCoordinate(this.mapCoordinate)
      }
    }, this.Cesium.ScreenSpaceEventType.LEFT_CLICK)
  }

  @Watch('geojson')
  private onGeojsonChanged() {
    this.clearCoordinate()
    if (this.geojson && Object.keys(this.geojson).length > 0) {
      // 行政区划几何类型一般是Polygon
      const { features } = this.geojson
      this.entityNames = []
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
      }
    }
    this.upDateMarker()
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

  @Watch('mapCoordinate')
  upDateMarker() {
    this.cesiumUtil.removeEntityByName('coordinate-marker')
    const marker: any = {
      name: 'coordinate-marker',
      center: this.mapCoordinate,
      img: this.markerBlue,
      mouseOver: () => {
        this.mouseOver()
      },
      mouseOut: () => {
        this.mouseOut()
      }
    }
    this.cesiumUtil.addMarkerByFeature(marker)
  }

  mouseOver() {}

  mouseOut() {
    // console.log(event)
    // this.showMarkerDialog = false
  }

  // 清除
  private clearCoordinate() {
    this.cesiumUtil.removeEntityByName('coordinate-marker')
    for (let i = this.entityNames.length - 1; i >= 0; i -= 1) {
      this.cesiumUtil.removeEntityByName(this.entityNames[i])
      this.entityNames.pop()
    }
  }

  private deactivated() {
    this.clearCoordinate()
  }

  onMapClear() {
    this.clearCoordinate()
  }
}
</script>

<style lang="scss"></style>
