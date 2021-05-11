<template>
  <div class="split-screen-map">
    <a-empty
      description="请在目录树中勾选需要分屏的专题"
      v-if="!layers.length"
    />
    <a-row :gutter="[5, 8]" v-else>
      <a-col
        v-for="(l, i) in layers"
        :key="i"
        :span="mapSpan.span"
        :style="{ height: mapSpan.height }"
      >
        <map-view
          v-model="queryVisible"
          :mapViewId="`split-screen-map-${i + 1}`"
          :mapViewLayer="l"
          :queryRect="queryRect"
          @on-query="onQuery"
          v-if="l"
        />
      </a-col>
    </a-row>
  </div>
</template>
<script lang="ts">
import { Mixins, Component, Prop, Watch } from 'vue-property-decorator'
import { WidgetMixin, Layer } from '@mapgis/web-app-framework'
import { queryLayerInfoInstance } from '@mapgis/pan-spatial-map-store'
import mapViewStateInstance, { Rect } from '../../mixins/map-view-state'
import MapView from '../MapView'

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

  queryRect: Rect = {}

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

  @Watch('layers', { deep: true })
  watchLayersLength(nV, oV) {
    if (nV.length) {
      // 保存初始复位范围, 默认取第一个图层的全图范围
      mapViewStateInstance.initDisplayRect = nV[0].fullExtent
    }
    if (nV.length !== oV.length) {
      // 重置查询弹框开关
      this.queryVisible = false
    }
  }
}
</script>
<style lang="less" scoped>
@import './index.less';
</style>
