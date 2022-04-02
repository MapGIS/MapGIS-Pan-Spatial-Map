<template>
  <div>
    <!-- <mp-draw-pro ref="draw" @finished="onDrawFinished" /> -->
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
import { LayerType, WidgetMixin } from '@mapgis/web-app-framework'

@Component
export default class MapboxLayer extends Mixins(WidgetMixin) {
  @Prop() geoJSONAnalysis: Recod<string, unknown>

  @Prop() geoJSONTarget: Recod<string, unknown>

  // 点集图层ID
  layerTargetId = 'topologyAnalysisTarget'

  // 点集资源ID
  sourceTargetId = 'topology-analysis-target'

  // 点集图层ID
  layerAnalysisId = 'topologyAnalysisAnalysis'

  // 点集资源ID
  sourceAnalysisId = 'topology-analysis-analysis'

  @Watch('geoJSONAnalysis', { deep: true, immediate: true })
  geoJSONAnalysisChange() {
    this.geoJSONChange('Analysis')
  }

  @Watch('geoJSONTarget', { deep: true, immediate: true })
  geoJSONTargetChange() {
    this.geoJSONChange('Target')
  }

  geoJSONChange(val) {
    let geoJSON
    let layerId
    let sourceId
    let color
    if (val === 'Target') {
      this.clearDataTargetArr()
      geoJSON = this.geoJSONTarget
      layerId = this.layerTargetId
      sourceId = this.sourceTargetId
      color = '#FFA500'
    } else {
      this.clearDataAnalysisArr()
      geoJSON = this.geoJSONAnalysis
      layerId = this.layerAnalysisId
      sourceId = this.sourceAnalysisId
      color = '#ff9c6e'
    }

    if (!geoJSON) {
      return
    }
    this.map.addSource(sourceId, {
      type: 'geojson',
      data: geoJSON // 一开始的数据是空的,后面请求到了再更新
    })
    const { features } = geoJSON
    const {
      properties: { bound, center },
      geometry: { type, coordinates }
    } = features[0]
    if (type === 'Point') {
      this.map.addLayer({
        id: layerId,
        type: 'circle',
        source: sourceId,
        paint: {
          'circle-radius': 5, // 半径
          'circle-color': color, // 颜色
          'circle-opacity': 1 // 透明度
        }
      })
      this.map.panTo(center)
    } else if (type === 'LineString') {
      this.map.addLayer({
        id: layerId,
        type: 'line',
        source: sourceId,
        paint: {
          // 设置填充颜色
          'line-color': color,
          'line-opacity': 1,
          'line-width': 3
        }
      })
      this.map.fitBounds(bound, {
        padding: { top: 100, bottom: 100, left: 200, right: 200 }
      })
    } else if (type === 'Polygon') {
      this.map.addLayer({
        id: layerId,
        type: 'fill',
        source: sourceId,
        paint: {
          // 设置填充颜色
          'fill-color': color,
          'fill-outline-color': 'white'
        }
      })
      this.map.fitBounds(bound, {
        padding: { top: 100, bottom: 100, left: 200, right: 200 }
      })
    }
  }

  clearDataTargetArr() {
    if (this.map.getLayer(this.layerTargetId)) {
      this.map.removeLayer(this.layerTargetId)
    }
    if (this.map.getSource(this.sourceTargetId)) {
      this.map.removeSource(this.sourceTargetId)
    }
  }

  clearDataAnalysisArr() {
    if (this.map.getLayer(this.layerAnalysisId)) {
      this.map.removeLayer(this.layerAnalysisId)
    }
    if (this.map.getSource(this.sourceAnalysisId)) {
      this.map.removeSource(this.sourceAnalysisId)
    }
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
