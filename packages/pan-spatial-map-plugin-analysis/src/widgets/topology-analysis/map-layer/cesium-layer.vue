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
  @Prop() geoJSONAnalysis: Recod<string, unknown>

  @Prop() geoJSONTarget: Recod<string, unknown>

  // 点集资源ID
  sourceTargetArr = []

  // 点集资源ID
  sourceAnalysisArr = []

  mounted() {
    this.sceneOverlays = Overlay.SceneOverlays.getInstance(
      this.Cesium,
      this.vueCesium,
      this.viewer
    )
    this.geoJSONChange('Analysis')
    this.geoJSONChange('Target')
  }

  @Watch('geoJSONAnalysis', { deep: true })
  geoJSONAnalysisChange() {
    this.geoJSONChange('Analysis')
  }

  @Watch('geoJSONTarget', { deep: true })
  geoJSONTargetChange() {
    this.geoJSONChange('Target')
  }

  geoJSONChange(val) {
    let geoJSON
    let sourceArr
    let color
    if (val === 'Target') {
      this.clearDataTargetArr()
      geoJSON = this.geoJSONTarget
      sourceArr = this.sourceTargetArr
      color = '#FFA500'
    } else {
      this.clearDataAnalysisArr()
      geoJSON = this.geoJSONAnalysis
      sourceArr = this.sourceAnalysisArr
      color = '#ff9c6e'
    }

    if (!geoJSON) {
      return
    }

    const { features } = geoJSON
    const {
      properties: { bound, center },
      geometry: { type, coordinates }
    } = features[0]
    if (type === 'Point') {
      const fillColor = this.Cesium.Color.fromCssColorString(color)
      const outLineColor = this.Cesium.Color.WHITE
      const entity = this.sceneOverlays.addPoint(
        coordinates[0],
        coordinates[1],
        0,
        'source-point',
        6,
        fillColor,
        outLineColor
      )
      this.viewer.camera.flyTo({
        destination: this.Cesium.Cartesian3.fromDegrees(
          center[0],
          center[1],
          this.viewer.camera.positionCartographic.height
        )
      })
      sourceArr.push(entity)
    } else if (type === 'LineString') {
      coordinates.forEach((item, index) => {
        let lineArr = []
        item.forEach(lines => {
          lineArr = lineArr.concat(lines)
        })
        const fillColor = this.Cesium.Color.fromCssColorString(color)
        const entity = this.sceneOverlays.addLine(
          `sourceArr-${index}`,
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
        this.viewer.camera.flyTo({
          destination: this.Cesium.Rectangle.fromDegrees(
            bound[0][0],
            bound[0][1],
            bound[1][0],
            bound[1][1]
          )
        })
        sourceArr.push(entity)
      })
    } else if (type === 'Polygon') {
      coordinates.forEach((item, index) => {
        let lineArr = []
        item.forEach(lines => {
          lineArr = lineArr.concat(lines)
        })
        const fillColor = this.Cesium.Color.fromCssColorString(color)
        const outlineColor = this.Cesium.Color.WHITE
        const entity = this.sceneOverlays.addPolygon(
          `sourceArr-${index}`,
          lineArr,
          fillColor,
          outlineColor
        )
        this.viewer.camera.flyTo({
          destination: this.Cesium.Rectangle.fromDegrees(
            bound[0][0],
            bound[0][1],
            bound[1][0],
            bound[1][1]
          )
        })
        sourceArr.push(entity)
      })
    }
  }

  clearDataTargetArr() {
    this.sourceTargetArr.forEach(entity => {
      this.sceneOverlays.removeEntity(entity)
    })
  }

  clearDataAnalysisArr() {
    this.sourceAnalysisArr.forEach(entity => {
      this.sceneOverlays.removeEntity(entity)
    })
  }

  clear() {
    this.clearDataTargetArr()
    this.clearDataAnalysisArr()
  }

  beforeDestroy() {
    this.clear()
  }
}
</script>

<style scoped></style>
