<template>
  <!-- 二维卷帘 -->
  <mapgis-compare :orientation="direction">
    <mp-mapbox-view
      slot="beforeMap"
      :document="aboveDocument"
      :mapStyle="mapStyle"
    />
    <mp-mapbox-view
      slot="afterMap"
      :document="belowDocument"
      :mapStyle="mapStyle"
    />
  </mapgis-compare>
</template>
<script lang="ts">
import { Vue, Component, Prop, Watch } from 'vue-property-decorator'
import { Document, MpMapboxView, Layer } from '@mapgis/web-app-framework'

export type Direction = 'vertical' | 'horizontal'

@Component({
  components: {
    MpMapboxView
  }
})
export default class MapboxCompare extends Vue {
  @Prop({ default: () => ({}) }) readonly aboveLayer!: Layer

  @Prop({ default: () => ({}) }) readonly belowLayer!: Layer

  @Prop({ default: 'vertical' }) readonly direction!: Direction

  @Watch('aboveLayer', { deep: true })
  watchAbove(nV: Layer) {
    this.update(nV, 'above')
  }

  @Watch('belowLayer', { deep: true })
  watchBelow(nV: Layer) {
    this.update(nV, 'below')
  }

  // 上级(左侧)地图Document
  aboveDocument = new Document()

  // 下级(右侧)地图Document
  belowDocument = new Document()

  // 图层样式
  mapStyle: any = {
    version: 8,
    name: '空样式',
    sources: {
      Default: {
        type: 'vector',
        tiles: [
          'http://localhost:6163/igs/rest/mrms/tile/IGServer/{z}/{y}/{x}?type=cpbf'
        ],
        minZoom: 0,
        maxZoom: 15
      }
    },
    sprite: 'http://localhost:6163/igs/rest/mrms/vtiles/sprite',
    glyphs:
      'http://localhost:6163/igs/rest/mrms/vtiles/fonts/{fontstack}/{range}.pbf',
    layers: [
      {
        id: '背景',
        type: 'background',
        paint: {
          'background-color': {
            stops: [
              [6, '#4a5768'],
              [8, '#424d5c']
            ]
          }
        }
      }
    ]
  }

  update(nV: Layer, type: 'above' | 'below') {
    const _defaultMap = this[`${type}Document`].defaultMap
    _defaultMap.remove(nV)
    console.log('nV', nV)
    if (nV) {
      _defaultMap.add(nV)
    }
  }

  created() {
    this.update(this.aboveLayer, 'above')
    this.update(this.belowLayer, 'below')
  }
}
</script>
<style lang="less" scoped></style>
