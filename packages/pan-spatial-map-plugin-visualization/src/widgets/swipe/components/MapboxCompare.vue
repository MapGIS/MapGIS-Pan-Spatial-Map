<template>
  <div class="swipe-mapbox-compare">
    <!-- 空数据提示 -->
    <div class="swipe-no-data-tip" v-if="!showCompare">
      <a-empty description="卷帘分析功能至少需要选择2个图层" />
    </div>
    <!-- 卷帘组件 -->
    <mapgis-compare :orientation="direction" v-else>
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
  </div>
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
    sources: {},
    layers: [],
    glyphs:
      'http://develop.smaryun.com:6163/igs/rest/mrms/vtiles/fonts/{fontstack}/{range}.pbf'
  }

  // 是否展示卷帘
  get showCompare() {
    return this.aboveLayer.id && this.belowLayer.id
  }

  update(nV: Layer, type: 'above' | 'below') {
    const defaultMap = this[`${type}Document`].defaultMap
    defaultMap.removeAll()
    if (nV) {
      defaultMap.add(nV)
    }
  }
}
</script>
<style lang="less" scoped>
.swipe-mapbox-compare {
  width: 1600px;
  height: 100%;
  overflow: auto;
  position: relative;
}
.swipe-no-data-tip {
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>
