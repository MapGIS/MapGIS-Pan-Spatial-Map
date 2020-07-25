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
import { UUID } from '@mapgis/webclient-store/src/utils'
import { MapDocumentMixin } from '@mapgis/pan-spatial-map-store'
import markerBlue from '../../../assets/images/markerBlue.png'
import cesiumMarkerMixin from './cesiumMarkerMixin'

@Component({
  components: {}
})
export default class CesiumAddMarker extends Mixins(
  MapDocumentMixin,
  cesiumMarkerMixin
) {
  @Provide()
  get webGlobe() {
    return this.map
  }

  @Provide()
  get Cesium() {
    return this.mapLib
  }

  @Prop({ type: Object, default: '' }) drawMode!: Record<string, any>

  @Emit('addMarkers')
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  emitTodo(markers: any) {}

  private handler: any = undefined

  private markerImgSrc = markerBlue

  private markers: any[] = []

  private popupShowFlag = true

  private jhFlag = true

  private drawModes = {
    point: 'point',
    line: 'line',
    polygon: 'polygon'
  }

  onMapLoad(map: any) {
    if (map.crs) {
      return
    }
    this.handler = new this.Cesium.ScreenSpaceEventHandler(
      // eslint-disable-next-line no-underscore-dangle
      this.webGlobe.viewer.scene._canvas
    ) // 定义当前场景的画布元素的事件处理
    this.cesiumUtil.setCesiumGlobe(this.Cesium, this.webGlobe)
  }

  mounted() {
    if (this.Cesium) {
      this.handler = new this.Cesium.ScreenSpaceEventHandler(
        // eslint-disable-next-line no-underscore-dangle
        this.webGlobe.viewer.scene._canvas
      ) // 定义当前场景的画布元素的事件处理
      this.cesiumUtil.setCesiumGlobe(this.Cesium, this.webGlobe)
    }
  }

  @Watch('drawMode', { deep: true })
  changeDrawMode() {
    let array: any[] = []
    this.popupShowFlag = true
    let positions: any[] = []
    let centerCoordinates: any
    if (this.drawMode.mode === this.drawModes.point) {
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
        if (this.popupShowFlag) {
          const marker = {
            id: UUID.uuid(),
            title: '',
            description: '',
            img: this.markerImgSrc,
            edit: true,
            features: [geojsonFeature],
            coordinates: currentCoor,
            center: currentCoor,
            type: 'Point'
          }
          this.markers = []
          this.markers.push(marker)
          this.emitTodo(this.markers)
        }
      }, this.Cesium.ScreenSpaceEventType.LEFT_CLICK)
    } else if (this.drawMode.mode === this.drawModes.line) {
      this.jhFlag = true
      positions = []
      this.handler.setInputAction((movement: any) => {
        if (this.jhFlag) {
          const currentCoor = this.coordinateConvert(movement) // 将笛卡尔坐标转换为二维经纬度
          positions.push(currentCoor)
        }
      }, this.Cesium.ScreenSpaceEventType.LEFT_CLICK)

      this.handler.setInputAction((movement: any) => {
        if (this.jhFlag) {
          const currentCoor = this.coordinateConvert(movement) // 将笛卡尔坐标转换为二维经纬度
          if (positions.length >= 1) {
            this.removeAllPolygonLine() // 删除线、区。。。
            array = []
            for (let i = 0; i < positions.length; i += 1) {
              array.push(positions[i])
            }
            array.push(currentCoor) // 填加鼠标位置
            centerCoordinates = this.appendLine(array) // 绘制线求中心点
          }
        }
      }, this.Cesium.ScreenSpaceEventType.MOUSE_MOVE)

      this.handler.setInputAction(() => {
        this.removeAllPolygonLine() // 删除线、区
        if (this.jhFlag) {
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
            img: this.markerImgSrc,
            edit: true,
            features: [geojsonFeature],
            coordinates: array,
            center: centerCoordinates,
            type: 'LineString'
          }
          this.markers = []
          this.markers.push(marker)
          this.emitTodo(this.markers)
        }
        this.jhFlag = false
      }, this.Cesium.ScreenSpaceEventType.LEFT_DOUBLE_CLICK)
    } else if (this.drawMode.mode === this.drawModes.polygon) {
      this.jhFlag = true
      positions = []
      this.handler.setInputAction((movement: any) => {
        if (this.jhFlag) {
          const currentCoor = this.coordinateConvert(movement) // 将笛卡尔坐标转换为二维经纬度
          positions.push(currentCoor)
        }
      }, this.Cesium.ScreenSpaceEventType.LEFT_CLICK)

      this.handler.setInputAction((movement: any) => {
        if (this.jhFlag) {
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
        if (this.jhFlag) {
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
            img: this.markerImgSrc,
            edit: true,
            features: [geojsonFeature],
            coordinates: [array],
            center: centerCoordinates,
            type: 'Polygon'
          }
          this.markers = []
          this.markers.push(marker)
          this.emitTodo(this.markers)
        }
        this.jhFlag = false
      }, this.Cesium.ScreenSpaceEventType.LEFT_DOUBLE_CLICK)
    }
  }

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

<style scoped>
.add-marker-wrapper {
  margin: 1em;
  max-height: 45em;
  overflow: auto;
}
</style>
