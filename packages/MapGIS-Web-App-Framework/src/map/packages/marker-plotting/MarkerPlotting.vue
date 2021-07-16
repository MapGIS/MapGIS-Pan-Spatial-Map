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
import { Feature } from '@mapgis/web-app-framework'
import _last from 'lodash/last'
import MpMarkerSetPro from '../marker-pro/MarkerSetPro.vue'
import MarkerPlottingMixin from './mixins/marker-plotting'
import MarkerStateInstance from './store/marker-state'

@Component({
  name: 'MpMarkerPlotting',
  components: { MpMarkerSetPro }
})
export default class MpMarkerPlotting extends Mixins(MarkerPlottingMixin) {
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
  changeSelectedMarkers(markerIds, prevMarkerIds = []) {
    if (prevMarkerIds.length) {
      prevMarkerIds.forEach(id => {
        const marker = this.getMarker(id)
        this.onClearHighlightFeature(marker)
        if (this.vueKey) {
          this.emitClearHighlightEvent(marker, this.vueKey)
        }
        MarkerStateInstance.removeSelectedIds(id)
      })
    }
    if (markerIds.length) {
      if (this.vueKey) {
        this.emitClearSelectionEvent(this.vueKey)
      }
      const lastMarker = this.getMarker(_last(markerIds))
      this.zoomTo(lastMarker.feature.bound)
      markerIds.forEach(id => {
        const marker = this.getMarker(id)
        this.highlightFeature(marker)
        if (this.vueKey) {
          this.emitHighlightEvent(marker, this.vueKey)
        }
        MarkerStateInstance.setSelectedIds(id)
      })
    }
  }

  @Watch('fitBound', { deep: true })
  changeMapBound(nV) {
    this.zoomTo(nV)
  }

  @Watch('selectionBound', { deep: true })
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

  private zoomTo(bound) {
    if (!bound) return
    this.map.fitBounds([
      [bound.xmin, bound.ymin],
      [bound.xmax, bound.ymax]
    ])
  }

  private zoomOrPanTo(bound) {
    if (!bound) return
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
      this.clearHighlightFeature(marker)
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
    const { line, reg } = this.highlightStyle.feature
    switch (feature.geometry.type) {
      case 'Point':
        // 点要素的高亮符号怎么处理?
        break
      case 'LineString':
        options = {
          type: 'line',
          paint: {
            'line-color': line.color,
            'line-width': parseInt(line.size)
          }
        }
        break
      case 'Polygon':
        options = {
          type: 'fill',
          paint: {
            'fill-color': reg.color,
            'fill-outline-color': line.color
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

  private clearHighlightFeature({ markerId }) {
    const layerId = `highlight-layer-${markerId}`
    const sourceId = `highlight-${markerId}`
    if (this.map.getLayer(layerId)) {
      this.map.removeLayer(layerId)
    }
    if (this.map.getSource(sourceId)) {
      this.map.removeSource(sourceId)
    }
  }

  /**
   * 清除高亮
   */
  private onClearHighlightFeature(marker) {
    this.clearHighlightFeature(marker)
  }

  /**
   * 添加高亮
   */
  private onHighlightFeature(marker) {
    this.zoomTo(marker.feature.bound)
    this.highlightFeature(marker)
  }

  created() {
    this.subscribeHighlight()
  }
}
</script>
<style lang="less" scoped></style>
