<template>
  <div>
    <!-- <mp-3d-draw-pro ref="draw3d" @finished="onDrawFinished" /> -->
  </div>
</template>

<script lang="ts">
import {
  Component,
  Vue,
  Mixins,
  Emit,
  Prop,
  Watch
} from 'vue-property-decorator'
import { LayerType, WidgetMixin, Overlay } from '@mapgis/web-app-framework'

@Component
export default class CesiumLayer extends Mixins(WidgetMixin) {
  @Prop() dataCoordinateArr: Record<string, any>

  @Prop() dataBarrierArr: Record<string, any>

  @Prop() marker: Record<string, any>

  @Prop() result: Record<string, any>

  @Prop() highResultSource: Record<string, any>

  @Prop() color: Record<string, any>

  entityBarrierArray = []

  entityCoordinateArray = []

  entityHighResultIndex = undefined

  entityPointResultArray = []

  entityLineResultArray = []

  markerEntity = null

  circleColor = {
    'circle-radius': 5, // 半径
    'circle-color': '#FF9933', // 颜色
    'circle-opacity': 1 // 透明度
  }

  mounted() {
    this.sceneOverlays = Overlay.SceneOverlays.getInstance(
      this.Cesium,
      this.vueCesium,
      this.viewer
    )
    this.dataCoordinateArrChange()
    this.dataBarrierArrChange()
    this.resultChange()
    this.highResultSourceChange()
    this.markerChange()
  }

  @Watch('marker', { deep: true })
  markerChange() {
    this.clearMark()
    if (this.marker && this.marker.center && this.marker.center.length > 0) {
      this.markerEntity = this.sceneOverlays.addMarker(this.marker)
    }
  }

  @Watch('result', { deep: true })
  resultChange() {
    this.clearResultLayer()
    const { layerPoint, layerLine } = this.result
    if (
      layerLine.features.length > 0 &&
      layerLine.features[0].geometry.coordinates &&
      layerLine.features[0].geometry.coordinates.length > 0
    ) {
      layerLine.features[0].geometry.coordinates.forEach((item, index) => {
        let lineArr = []
        item.forEach(lines => {
          lineArr = lineArr.concat(lines)
        })
        const fillColor = this.Cesium.Color.fromCssColorString(
          this.circleColor['circle-color']
        )
        const entity = this.sceneOverlays.addLine(
          `entityLineResultArray-${index}`,
          lineArr,
          3,
          fillColor,
          // 是否识别带高度的坐标
          false,
          // 是否贴地形
          true,
          // 附加属性
          {}
        )
        this.entityLineResultArray.push(entity)
      })
    }
    if (
      layerPoint.features.length > 0 &&
      layerPoint.features[0].geometry.coordinates &&
      layerPoint.features[0].geometry.coordinates.length > 0
    ) {
      layerPoint.features[0].geometry.coordinates.forEach((item, index) => {
        const fillColor = this.Cesium.Color.fromCssColorString(
          this.circleColor['circle-color']
        )

        const outLineColor = this.Cesium.Color.WHITE
        const entity = this.sceneOverlays.addPoint(
          item[0],
          item[1],
          0,
          `entityPointResultArray-${index}`,
          9,
          fillColor
        )
        this.entityPointResultArray.push(entity)
      })
    }
  }

  @Watch('highResultSource', { deep: true })
  highResultSourceChange() {
    const highLine = this.highResultSource.features
    if (highLine.length > 0 && highLine[0].properties) {
      if (
        this.entityHighResultIndex !== undefined &&
        this.entityHighResultIndex !== null
      ) {
        const entityOld = this.entityLineResultArray[this.entityHighResultIndex]
        entityOld.polyline.material.color = this.Cesium.Color.fromCssColorString(
          this.circleColor['circle-color']
        )
        const entityNew = this.entityLineResultArray[highLine[0].properties.id]
        entityNew.polyline.material.color = this.Cesium.Color.BLUE
        this.entityHighResultIndex = highLine[0].properties.id
      } else {
        const entity = this.entityLineResultArray[highLine[0].properties.id]
        console.log(entity)
        entity.polyline.material.color = this.Cesium.Color.BLUE
        this.entityHighResultIndex = highLine[0].properties.id
      }
    }
    // this.clearHighLayer()
    // const highLine = this.highResultSource.features
    // if (
    //   highLine.length > 0 &&
    //   highLine[0].geometry.coordinates &&
    //   highLine[0].geometry.coordinates.length > 0
    // ) {
    //   let arr = []
    //   highLine[0].geometry.coordinates.forEach((item, index) => {
    //     arr = arr.concat(item)
    //   })
    //   const fillColor = this.Cesium.Color.fromCssColorString('#CC01AD')

    // const entity = this.sceneOverlays.addLine(
    //   'entityHighResultArray',
    //   arr,
    //   5,
    //   fillColor,
    //   // 是否识别带高度的坐标
    //   false,
    //   // 是否贴地形
    //   true,
    //   // 附加属性
    //   {}
    // )
    //   this.entityHighResultArray.push(entity)
    // }
  }

  @Watch('dataCoordinateArr', { deep: true })
  dataCoordinateArrChange() {
    this.clearDataCoordinateArr()
    if (this.dataCoordinateArr.features.length > 0) {
      this.dataCoordinateArr.features.forEach(item => {
        const { coordinates } = item.geometry
        const fillColor = this.Cesium.Color.fromCssColorString(
          this.circleColor['circle-color']
        )

        const outLineColor = this.Cesium.Color.WHITE
        const entity = this.sceneOverlays.addPoint(
          coordinates[0],
          coordinates[1],
          0,
          null,
          11,
          fillColor,
          outLineColor,
          1
        )
        this.entityCoordinateArray.push(entity)
      })
    }
  }

  @Watch('dataBarrierArr', { deep: true })
  dataBarrierArrChange() {
    this.clearDataBarrierArr()
    if (this.dataBarrierArr.features.length > 0) {
      this.dataBarrierArr.features.forEach(item => {
        const { coordinates } = item.geometry
        const fillColor = this.Cesium.Color.RED

        const outLineColor = this.Cesium.Color.WHITE
        const entity = this.sceneOverlays.addPoint(
          coordinates[0],
          coordinates[1],
          0,
          null,
          11,
          fillColor,
          outLineColor,
          1
        )
        this.entityBarrierArray.push(entity)
      })
    }
  }

  clearDataBarrierArr() {
    this.entityBarrierArray.forEach(entity => {
      this.sceneOverlays.removeEntity(entity)
    })
    this.entityBarrierArray = []
  }

  clearDataCoordinateArr() {
    this.entityCoordinateArray.forEach(entity => {
      this.sceneOverlays.removeEntity(entity)
    })
    this.entityCoordinateArray = []
  }

  clearResultLayer() {
    this.entityPointResultArray.forEach(entity => {
      this.sceneOverlays.removeEntity(entity)
    })
    this.entityPointResultArray = []
    this.entityLineResultArray.forEach(entity => {
      this.sceneOverlays.removeEntity(entity)
    })
    this.entityLineResultArray = []
  }

  clearHighLayer() {
    // this.entityHighResultArray.forEach(entity => {
    //   this.sceneOverlays.removeEntity(entity)
    // })
    // this.entityHighResultArray = []
    this.entityHighResultIndex = undefined
  }

  flyToHigh(center) {
    if (center && center.length > 0) {
      this.viewer.camera.flyTo({
        destination: this.Cesium.Cartesian3.fromDegrees(
          center[0],
          center[1],
          this.viewer.camera.positionCartographic.height
        )
      })
    }
  }

  clearMark() {
    if (this.markerEntity) {
      this.sceneOverlays.removeEntity(this.markerEntity)
      this.markerEntity = null
    }
  }

  beforeDestroy() {
    this.clearDataBarrierArr()
    this.clearDataCoordinateArr()
    this.clearResultLayer()
    this.clearHighLayer()
    this.clearMark()
  }
}
</script>

<style scoped></style>
