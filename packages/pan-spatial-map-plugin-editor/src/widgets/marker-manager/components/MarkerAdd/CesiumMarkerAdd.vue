<template>
  <div class="add-marker-wrapper"></div>
</template>

<script lang="ts">
import {
  Component,
  Provide,
  Emit,
  Prop,
  Watch,
  Mixins
} from 'vue-property-decorator'
import { WidgetMixin, UUID } from '@mapgis/web-app-framework'
import { baseConfigInstance } from '@mapgis/pan-spatial-map-store'
import MarkerCommonMixin from '../../mixins/marker-common'
import CesiumMarkerMixin from '../../mixins/cesium-marker.ts'

@Component({
  components: {}
})
export default class MapboxMarkerAdd extends Mixins(
  WidgetMixin,
  MarkerCommonMixin,
  CesiumMarkerMixin
) {
  private handler: any = undefined

  private drawing = false

  @Emit('addMarker')
  emitAddMarker(marker: any) {}

  created() {
    if (this.Cesium) {
      this.handler = new this.Cesium.ScreenSpaceEventHandler(
        this.webGlobe.viewer.scene._canvas
      ) // 定义当前场景的画布元素的事件处理
      this.cesiumUtil.setCesiumGlobe(this.Cesium, this.webGlobe)
    }
  }

  // 开始标注
  openMarker(mode) {
    let array: any[] = []
    let positions: any[] = []
    let centerCoordinates: any
    if (mode === 'point') {
      // 设置鼠标移动事件的处理函数，这里负责监听x,y坐标值变化
      this.handler.setInputAction((movement: any) => {
        const currentCoor = this.coordinateConvert(movement) // 将笛卡尔坐标转换为二维经纬度
        const geojsonFeature = {
          geometry: {
            coordinates: currentCoor,
            type: 'Point'
          },
          id: UUID.uuid(),
          properties: {},
          type: 'Feature'
        }
        const marker = {
          id: UUID.uuid(),
          title: '',
          description: '',
          iconImg: `${this.baseUrl}${baseConfigInstance.config.colorConfig.label.image.defaultImg}`,
          edit: true,
          features: [geojsonFeature],
          coordinates: currentCoor,
          center: currentCoor,
          type: 'Point'
        }
        this.emitAddMarker(marker)
      }, this.Cesium.ScreenSpaceEventType.LEFT_CLICK)
    } else if (mode === 'line') {
      this.drawing = true
      positions = []
      this.handler.setInputAction((movement: any) => {
        if (this.drawing) {
          const currentCoor = this.coordinateConvert(movement) // 将笛卡尔坐标转换为二维经纬度
          positions.push(currentCoor)
        }
      }, this.Cesium.ScreenSpaceEventType.LEFT_CLICK)

      this.handler.setInputAction((movement: any) => {
        if (this.drawing) {
          const currentCoor = this.coordinateConvert(movement) // 将笛卡尔坐标转换为二维经纬度
          if (positions.length >= 1) {
            this.removeAllPolygonLine() // 删除线、区。。。
            array = []
            for (let i = 0; i < positions.length; i += 1) {
              array.push(positions[i])
            }
            array.push(currentCoor) // 添加鼠标位置
            centerCoordinates = this.appendLine(array) // 绘制线求中心点
          }
        }
      }, this.Cesium.ScreenSpaceEventType.MOUSE_MOVE)

      this.handler.setInputAction(() => {
        this.removeAllPolygonLine() // 删除线、区
        if (this.drawing) {
          centerCoordinates = this.appendLine(array) // 绘制线求中心点
          const geojsonFeature = {
            geometry: {
              coordinates: array,
              type: 'LineString'
            },
            id: UUID.uuid(),
            properties: {},
            type: 'Feature'
          }
          const marker = {
            id: UUID.uuid(),
            title: '',
            description: '',
            iconImg: `${this.baseUrl}${baseConfigInstance.config.colorConfig.label.image.defaultImg}`,
            edit: true,
            features: [geojsonFeature],
            coordinates: array,
            center: centerCoordinates,
            type: 'LineString'
          }
          this.emitAddMarker(marker)
        }
        this.drawing = false
      }, this.Cesium.ScreenSpaceEventType.LEFT_DOUBLE_CLICK)
    } else if (mode === 'polygon') {
      this.drawing = true
      positions = []
      this.handler.setInputAction((movement: any) => {
        if (this.drawing) {
          const currentCoor = this.coordinateConvert(movement) // 将笛卡尔坐标转换为二维经纬度
          positions.push(currentCoor)
        }
      }, this.Cesium.ScreenSpaceEventType.LEFT_CLICK)

      this.handler.setInputAction((movement: any) => {
        if (this.drawing) {
          const currentCoor = this.coordinateConvert(movement) // 将笛卡尔坐标转换为二维经纬度
          if (positions.length >= 1) {
            this.removeAllPolygonLine() // 删除线、区。
            array = []
            for (let i = 0; i < positions.length; i += 1) {
              array.push(positions[i])
            }
            array.push(currentCoor) // 填加鼠标位置
            array.push(array[0]) // 保证区坐标首尾一致
            centerCoordinates = this.appendPolygon(array) // 绘制简单区求中心点
          }
        }
      }, this.Cesium.ScreenSpaceEventType.MOUSE_MOVE)

      this.handler.setInputAction(() => {
        this.removeAllPolygonLine() // 删除线、区
        if (this.drawing) {
          centerCoordinates = this.appendPolygon(array) // 绘制简单区求中心点
          const geojsonFeature = {
            geometry: {
              coordinates: [array],
              type: 'Polygon'
            },
            id: UUID.uuid(),
            properties: {},
            type: 'Feature'
          }
          const marker = {
            id: UUID.uuid(),
            title: '',
            description: '',
            iconImg: `${this.baseUrl}${baseConfigInstance.config.colorConfig.label.image.defaultImg}`,
            edit: true,
            features: [geojsonFeature],
            coordinates: [array],
            center: centerCoordinates,
            type: 'Polygon'
          }
          this.emitAddMarker(marker)
        }
        this.drawing = false
      }, this.Cesium.ScreenSpaceEventType.LEFT_DOUBLE_CLICK)
    }
  }

  // 标注点坐标转换
  coordinateConvert(mousePoint: any) {
    // 通过指定的椭球或者地图对应的坐标系，将鼠标的二维坐标转换为对应椭球体三维坐标
    const { ellipsoid } = this.webGlobe.scene.globe
    let cartesian: any
    if (mousePoint.position) {
      // 拿到屏幕坐标  【屏幕坐标转笛卡尔坐标】
      cartesian = this.webGlobe.viewer.camera.pickEllipsoid(
        mousePoint.position,
        ellipsoid
      )
    } else {
      cartesian = this.webGlobe.viewer.camera.pickEllipsoid(
        mousePoint.endPosition,
        ellipsoid
      )
    }
    if (cartesian) {
      // 将笛卡尔坐标转换为地理坐标
      const cartographic = ellipsoid.cartesianToCartographic(cartesian)
      // 将弧度转为度的十进制度表示
      const longitudeString = this.Cesium.Math.toDegrees(cartographic.longitude) // 转换后的经度
      const latitudeString = this.Cesium.Math.toDegrees(cartographic.latitude) // 转换后的纬度
      const currentCoor = [longitudeString, latitudeString]
      return currentCoor
    }
    return null
  }
}
</script>

<style lang="less" scoped></style>
