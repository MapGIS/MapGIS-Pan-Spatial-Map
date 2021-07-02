<template>
  <div>
    <mp-marker-set-pro
      :markers="markers"
      @mouseenter="mouseEnterEvent"
      @mouseleave="mouseLeaveEvent"
    >
      <template slot="popup" slot-scope="slotProps">
        <slot name="popup" v-bind="slotProps"></slot>
      </template>
    </mp-marker-set-pro>
  </div>
</template>

<script lang="ts">
import {
  Component,
  Prop,
  Watch,
  Inject,
  Emit,
  Mixins
} from 'vue-property-decorator'
import { Feature, CommonUtil } from '@mapgis/web-app-framework'
import _last from 'lodash/last'
import MpMarkerSetPro from '../marker-pro/MarkerSetPro.vue'
import HighlightEventsMixin from './mixins/highlight-events'
import MarkerStateInstance from './store/marker-state'

@Component({
  name: 'MpMarkerPlotting',
  components: { MpMarkerSetPro }
})
export default class MpMarkerPlotting extends Mixins(HighlightEventsMixin) {
  @Inject('map') map

  @Prop() readonly vueKey!: string

  @Prop({
    type: Boolean,
    default: false
  })
  readonly filterWithMap!: boolean

  @Prop({ default: () => [] }) readonly selectedMarkers!: string[]

  @Prop({
    type: Array,
    required: true
  })
  readonly markers!: Record<string, any>[]

  @Prop({
    type: Object,
    default: () => {
      return {}
    }
  })
  readonly fitBound!: Record<string, any>

  @Prop({
    type: Object,
    default: () => {
      return {}
    }
  })
  readonly selectionBound!: Record<string, any>

  @Prop({
    type: Array,
    default: () => {
      return [0, 0]
    }
  })
  readonly center!: number[]

  @Prop({
    type: Object,
    default: () => {
      return {}
    }
  })
  readonly highlightStyle!: Record<string, any>

  private get move() {
    let timeout: NodeJS.Timeout
    return (event: any) => {
      if (timeout) clearTimeout(timeout)
      timeout = setTimeout(() => {
        // 根据范围过滤回调
        const { target } = event
        const { _ne, _sw } = target.getBounds()
        const { lng: xmax, lat: ymax } = _ne
        const { lng: xmin, lat: ymin } = _sw
        const bound = {
          xmin,
          ymin,
          xmax,
          ymax
        }
        this.emitMapBoundChange(bound)
      }, 1000)
    }
  }

  private get storeSelectedIds() {
    return MarkerStateInstance.getSelectedIds()
  }

  @Watch('selectedMarkers', { immediate: true })
  changeSelectedMarkers(markerIds) {
    this.clearAllHighlight()
    if (markerIds.length) {
      markerIds.forEach(id => {
        const marker = this.getMarker(id)
        this.addHighlight(marker)
        this.emitHighlight(marker, this.vueKey)
        MarkerStateInstance.setSelectedIds(id)
      })
    }
  }

  @Watch('fitBound', { deep: true })
  changeMapBound(nV) {
    this.zoomTo(nV)
  }

  @Watch('selectionBound', { immediate: true, deep: true })
  changeSelectionBound(nV) {
    this.zoomOrPanTo(nV)
  }

  @Watch('filterWithMap')
  changeFilterWithMap(val: boolean) {
    if (val) {
      this.map.on('move', this.move)
    } else {
      this.map.off('move', this.move)
    }
  }

  @Watch('center', { deep: true })
  changeCenter() {
    this.map.panTo(this.center)
  }

  @Emit('map-bound-change')
  emitMapBoundChange(bound: Record<string, any>) {}

  private getMarker(markerId: string) {
    return this.markers.find(marker => marker.markerId === markerId)
  }

  private isValidBound(bound) {
    if (!CommonUtil.isEmpty(bound)) {
      const boundKeys = ['xmin', 'xmax', 'ymin', 'ymax']
      const hasBoundKeys = boundKeys.every(v => v in bound)
      return (
        hasBoundKeys && bound.xmin <= bound.xmax && bound.ymin <= bound.ymax
      )
    }
    return !0
  }

  private getFitBound({ feature }: any) {
    // fixme feature.bound = feature.properties.specialLayerBound
    const bound = feature.bound || Feature.getGeoJsonFeatureBound(feature)
    if (!this.isValidBound(bound)) return
    const { xmin, xmax, ymin, ymax } = bound
    const _xmin = (3 * xmin - xmax) / 2
    const _ymin = (3 * ymin - ymax) / 2
    const _xmax = (3 * xmax - xmin) / 2
    const _ymax = (3 * ymax - ymin) / 2
    return {
      xmin: _xmin,
      ymin: _ymin,
      xmax: _xmax,
      ymax: _ymax
    }
  }

  private zoomTo(bound) {
    if (!this.isValidBound(bound)) return
    this.map.fitBounds([
      [bound.xmin, bound.ymin],
      [bound.xmax, bound.ymax]
    ])
  }

  private zoomOrPanTo(bound) {
    if (!this.isValidBound(bound)) return
    const mapBoundArray = this.map.getBounds().toArray()
    const mapBound = {
      xmin: mapBoundArray[0][0],
      ymin: mapBoundArray[0][1],
      xmax: mapBoundArray[1][0],
      ymax: mapBoundArray[1][1]
    }
    // 先查看是否在地图范围内
    if (
      bound.xmin > mapBound.xmin &&
      bound.ymin > mapBound.ymin &&
      bound.xmax < mapBound.xmax &&
      bound.ymax < mapBound.ymax
    ) {
      return
    }
    // 然后查看两个矩形的范围大小，如果选择集的范围较当前大，需要做缩放
    if (
      bound.xmax - bound.xmin > mapBound.xmax - mapBound.xmin ||
      bound.ymax - bound.ymin > mapBound.ymax - mapBound.ymin
    ) {
      this.zoomTo(bound)
    } else {
      this.map.panTo([
        (bound.xmin + bound.xmax) / 2,
        (bound.ymin + bound.ymax) / 2
      ])
    }
  }

  private mouseEnterEvent(e: any, id) {
    const marker = this.getMarker(id)
    if (marker && !this.storeSelectedIds.has(id)) {
      this.highlightFeature(marker)
    }
  }

  private mouseLeaveEvent(e: any, id) {
    const marker = this.getMarker(id)
    if (marker && !this.storeSelectedIds.has(id)) {
      this.clearHighlight(marker)
    }
  }

  private highlightFeature({ markerId, feature }) {
    const layerId = `highlight-layer-${markerId}`
    const sourceId = `highlight-${markerId}`
    if (!this.map.getSource(sourceId)) {
      this.map.addSource(sourceId, {
        type: 'geojson',
        data: {
          features: [feature],
          type: 'FeatureCollection'
        }
      })
    }
    let options: any = {}
    switch (feature.geometry.type) {
      case 'Point':
        // 点要素的高亮符号怎么处理?
        break
      case 'LineString':
        options = {
          type: 'line',
          paint: {
            'line-color': this.highlightStyle.feature.line.color,
            'line-width': parseInt(this.highlightStyle.feature.line.size)
          }
        }
        break
      case 'Polygon':
        options = {
          type: 'fill',
          paint: {
            'fill-color': this.highlightStyle.feature.reg.color,
            'fill-outline-color': this.highlightStyle.feature.line.color
          }
        }
        break
      default:
        break
    }
    if (!this.map.getLayer(layerId)) {
      this.map.addLayer({
        id: layerId,
        source: sourceId,
        ...options
      })
    }
  }

  private clearHighlight({ markerId }) {
    const layerId = `highlight-layer-${markerId}`
    const sourceId = `highlight-${markerId}`
    if (this.map.getLayer(layerId)) {
      this.map.removeLayer(layerId)
    }
    if (this.map.getSource(sourceId)) {
      this.map.removeSource(sourceId)
    }
  }

  private clearAllHighlight() {
    this.markers.forEach(marker => {
      this.clearHighlight(marker)
      this.emitClearHighlight(marker, this.vueKey)
      MarkerStateInstance.removeSelectedIds(marker.markerId)
    })
  }

  private addHighlight(marker) {
    this.zoomTo(this.getFitBound(marker))
    this.highlightFeature(marker)
  }

  beforeDestroy() {
    this.clearAllHighlight()
  }
}
</script>
<style lang="less" scoped></style>
