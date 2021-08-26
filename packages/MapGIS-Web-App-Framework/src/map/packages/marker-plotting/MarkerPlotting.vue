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

<script>
import _last from 'lodash/last'
import MpMarkerSetPro from '../marker-pro/MarkerSetPro.vue'
import MarkerPlottingMixin from './mixins/marker-plotting'
import MarkerStateInstance from './store/marker-state'

export default {
  name: 'MpMarkerPlotting',
  components: { MpMarkerSetPro },
  inject: ['map'],
  mixins: [MarkerPlottingMixin],
  props: {
    vueKey: String,
    filterWithMap: {
      type: Boolean,
      default: false
    },
    selectedMarkers: {
      default: () => []
    },
    markers: {
      type: Array,
      required: true
    },
    fitBound: {
      type: Object,
      default: () => {
        return {}
      }
    },
    selectionBound: {
      type: Object,
      default: () => {
        return {}
      }
    },
    center: {
      type: Array,
      default: () => {
        return [0, 0]
      }
    },
    highlightStyle: {
      type: Object,
      default: () => {
        return {}
      }
    }
  },
  computed: {
    move() {
      let timeout
      return event => {
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
          this.$emit('map-bound-change', bound)
        }, 1000)
      }
    },
    storeSelectedIds() {
      return MarkerStateInstance.getSelectedIds()
    }
  },
  watch: {
    selectedMarkers: {
      immediate: true,
      handler(markerIds, prevMarkerIds = []) {
        this.clearAllHighlight()
        if (markerIds.length) {
          if (this.vueKey) {
            this.emitClearSelectionEvent(this.vueKey)
          }
          const lastMarker = this.getMarker(_last(markerIds))
          this.zoomOrPanTo(lastMarker.feature.bound)
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
    },
    fitBound: {
      deep: true,
      handler(nV) {
        this.zoomTo(nV)
      }
    },
    selectionBound: {
      deep: true,
      handler(nV) {
        this.zoomOrPanTo(nV)
      }
    },
    filterWithMap(val) {
      if (val) {
        this.map.on('move', this.move)
      } else {
        this.map.off('move', this.move)
      }
    },
    center: {
      deep: true,
      handler() {
        this.map.panTo(this.center)
      }
    }
  },
  created() {
    this.subscribeHighlight()
  },
  beforeDestroy() {
    this.clearAllHighlight()
  },
  methods: {
    getMarker(markerId) {
      return this.markers.find(marker => marker.markerId === markerId)
    },
    zoomTo(bound) {
      if (!bound) return
      this.map.fitBounds([
        [bound.xmin, bound.ymin],
        [bound.xmax, bound.ymax]
      ])
    },
    zoomOrPanTo(bound) {
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
    },
    mouseEnterEvent(e, id) {
      const marker = this.getMarker(id)
      if (marker && !this.storeSelectedIds.has(id)) {
        this.highlightFeature(marker)
      }
    },
    mouseLeaveEvent(e, id) {
      const marker = this.getMarker(id)
      if (marker && !this.storeSelectedIds.has(id)) {
        this.clearHighlightFeature(marker)
      }
    },
    highlightFeature({ markerId, feature }) {
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
      let options = {}
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
    },
    clearHighlightFeature({ markerId }) {
      const layerId = `highlight-layer-${markerId}`
      const sourceId = `highlight-${markerId}`
      if (this.map.getLayer(layerId)) {
        this.map.removeLayer(layerId)
      }
      if (this.map.getSource(sourceId)) {
        this.map.removeSource(sourceId)
      }
    },
    /**
     * 清除所有高亮
     */
    clearAllHighlight() {
      this.markers.forEach(marker => {
        this.onClearHighlightFeature(marker)
        if (this.vueKey) {
          this.emitClearHighlightEvent(marker, this.vueKey)
        }
        MarkerStateInstance.removeSelectedIds(marker.id)
      })
    },
    /**
     * 清除高亮
     */
    onClearHighlightFeature(marker) {
      this.clearHighlightFeature(marker)
    },
    /**
     * 添加高亮
     */
    onHighlightFeature(marker) {
      this.zoomOrPanTo(marker.feature.bound)
      this.highlightFeature(marker)
    }
  }
}
</script>
<style lang="less" scoped></style>
