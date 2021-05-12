<template>
  <div class="split-screen-map">
    <a-empty
      description="请在目录树中勾选需要分屏的专题"
      v-if="!screenNums.length"
    />
    <a-row :gutter="[5, 8]" v-else>
      <a-col
        v-for="s in screenNums"
        :key="s"
        :span="mapSpan"
        :style="mapSpanStyle"
      >
        <map-view
          v-model="queryVisible"
          :mapViewId="`split-screen-map-${s}`"
          :mapViewLayer="layers.find(({ id }) => layerIds[s] === id)"
          :queryRect="queryRect"
          @on-query="onQuery"
        />
      </a-col>
    </a-row>
  </div>
</template>
<script lang="ts">
import { Mixins, Component, Prop, Watch } from 'vue-property-decorator'
import {
  WidgetMixin,
  WidgetState,
  Document,
  Layer
} from '@mapgis/web-app-framework'
import {
  queryLayerInfoInstance,
  dataCatalogManagerInstance
} from '@mapgis/pan-spatial-map-store'
import mapViewStateInstance, { Rect } from '../../mixins/map-view-state'
import MapView from '../MapView'

@Component({
  components: {
    MapView
  }
})
export default class SplitScreenMap extends Mixins<Record<string, any>>(
  WidgetMixin
) {
  @Prop({ default: 12 }) mapSpan!: number

  @Prop({ default: () => [] }) screenNums!: number[]

  @Prop({ default: () => [] }) layerIds!: string[]

  @Prop({ default: () => [] }) layers!: Layer[]

  queryVisible = false

  queryRect: Rect = {}

  get mapSpanStyle() {
    const height = this.screenNums.length > 2 ? '50%' : '100%'
    return { height }
  }

  /**
   * 某个地图的查询抛出的事件
   * @param result<object>
   * @param mapViewId<string>
   */
  onQuery(result: Rect, mapViewId: string) {
    if (!this.queryVisible) {
      this.queryVisible = true
    }
    this.queryRect = result
  }

  /**
   * 监听: 分屏数量变化
   */
  @Watch('screenNums')
  watchScreenNums(nV) {
    this.queryVisible = false
    if (nV.length) {
      // 保存初始复位范围, 默认取第一个图层的全图范围, 只取一次
      mapViewStateInstance.initDisplayRect = this.layers[nV[0]].fullExtent
    }
  }
}
</script>
<style lang="less" scoped>
@import './index.less';
</style>
