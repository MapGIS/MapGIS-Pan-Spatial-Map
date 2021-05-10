<template>
  <div class="split-screen-map">
    <a-empty
      description="请在目录树中勾选需要分屏的专题"
      v-if="!layers.length"
    />
    <a-row v-else :gutter="[5, 8]">
      <a-col
        v-for="(l, i) in layers"
        :key="i"
        :span="mapSpan.span"
        :style="{ height: mapSpan.height }"
      >
        <map-view
          :mapViewId="getMapViewId(i)"
          :mapViewLayer="l"
          :mapFullExtent="mapFullExtent"
          :queryVisible="queryVisible"
          :queryRect="queryRects[getMapViewId(i)]"
          @on-query="onQuery"
        />
      </a-col>
    </a-row>
  </div>
</template>
<script lang="ts">
import { Mixins, Component, Prop } from 'vue-property-decorator'
import { WidgetMixin, Layer } from '@mapgis/web-app-framework'
import { queryLayerInfoInstance } from '@mapgis/pan-spatial-map-store'
import MapView from '../MapView'
import { Rect } from './mixins/map-view-operation-mixin'

interface IExtends {
  [k: string]: any
}

@Component({
  components: {
    MapView
  }
})
export default class SplitScreenMap extends Mixins<IExtends>(WidgetMixin) {
  @Prop({
    default: () => ({
      span: 12,
      height: '100%'
    })
  })
  mapSpan!: object

  @Prop({ default: () => [] }) layers!: Layer[]

  queryVisible = false

  queryRects: IExtends = {}

  // 默认取第一个图层的全图范围
  get mapFullExtent() {
    return this.layers.length ? this.layers[0].fullExtent : null
  }

  /**
   * 获取某屏id
   * @param i<number>
   */
  getMapViewId(i: number) {
    return `split-screen-map-${i + 1}`
  }

  /**
   * 某个地图的查询抛出的事件
   * @param result<object>
   * @param mapViewId<string>
   * @param visible<string>
   */
  onQuery(result: Rect, mapViewId: string, visible: boolean) {
    this.queryVisible = visible
    this.$set(this.queryRects, mapViewId, result)
    console.log('this.queryResults---------', this.queryRects)
  }
}
</script>
<style lang="less" scoped>
@import './index.less';
</style>
