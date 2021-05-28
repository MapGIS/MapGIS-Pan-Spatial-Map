<template>
  <div>
    <mp-marker-set-pro
      :markers="markers"
      @mouseenter="mouseEnterEvent"
      @mouseleave="mouseLeaveEvent"
    >
    </mp-marker-set-pro>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Watch, Mixins, Emit } from 'vue-property-decorator'
import { utilInstance } from '@mapgis/pan-spatial-map-store'
import { MapMixin } from '@mapgis/web-app-framework'
import MpMarkerSetPro from '../MarkerPro/MarkerSetPro.vue'

@Component({
  name: 'MpAttributeTablePlotting',
  components: { MpMarkerSetPro }
})
export default class MpAttributeTablePlotting extends Mixins(MapMixin) {
  @Prop({
    type: Boolean,
    default: false
  })
  readonly filterWithMap!: boolean

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

  @Watch('fitBound')
  changeMapBound() {
    if (this.fitBound) {
      const { xmin, ymin, xmax, ymax } = this.fitBound
      this.map.fitBounds([
        [xmin, ymin],
        [xmax, ymax]
      ])
    }
  }

  @Watch('selectionBound')
  changeSelectionBound() {
    this.zoomOrPanTo(this.selectionBound)
  }

  @Watch('filterWithMap')
  changeFilterWithMap(val: boolean) {
    if (val) {
      this.map.on('move', this.move)
    } else {
      this.map.off('move', this.move)
    }
  }

  @Emit('map-bound-change')
  emitMapBoundChange(bound: Record<string, any>) {}

  private zoomTo(bound) {
    this.map.fitBounds([
      [bound.xmin, bound.ymin],
      [bound.xmax, bound.ymax]
    ])
  }

  private zoomOrPanTo(bound) {
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
      this.map.fitBounds([
        [bound.xmin, bound.ymin],
        [bound.xmax, bound.ymax]
      ])
    } else {
      this.map.panTo([
        (bound.xmin + bound.xmax) / 2,
        (bound.ymin + bound.ymax) / 2
      ])
    }
  }

  private mouseEnterEvent(e: any, id) {
    // 高亮要素
    const marker = this.markers.find(marker => marker.markerId == id)

    if (marker) {
      this.highlightFeature({
        features: [marker.feature],
        type: 'FeatureCollection'
      })
    }
  }

  private mouseLeaveEvent(e: any, id) {
    this.clearHighlight()
  }

  private highlightFeature(featureGeoJson) {
    this.map.addSource('highlight', {
      type: 'geojson',
      data: featureGeoJson
    })
    // 需要根据要素类型来使用不同的type
    if (featureGeoJson.features[0].geometry.type === 'Point') {
      // 点要素的高亮符号怎么处理?
    } else if (featureGeoJson.features[0].geometry.type === 'LineString') {
      this.map.addLayer({
        id: 'highlight-layer',
        type: 'line',
        source: 'highlight',
        paint: {
          'line-color': this.highlightStyle.feature.line.color,
          'line-width': parseInt(this.highlightStyle.feature.line.size)
        }
      })
    } else if (featureGeoJson.features[0].geometry.type === 'Polygon') {
      this.map.addLayer({
        id: 'highlight-layer',
        type: 'fill',
        source: 'highlight',
        paint: {
          'fill-color': this.highlightStyle.feature.reg.color,
          'fill-outline-color': this.highlightStyle.feature.line.color
        }
      })
    }
  }

  private clearHighlight() {
    if (this.map.getLayer('highlight-layer')) {
      this.map.removeLayer('highlight-layer')
    }
    if (this.map.getSource('highlight')) {
      this.map.removeSource('highlight')
    }
  }
}
</script>
<style lang="less" scoped></style>
