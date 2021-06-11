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
          @on-query="onQuery"
          :map-view-id="`split-screen-map-${s}`"
          :map-view-layer="layers.find(({ id }) => layerIds[s] === id)"
          :queryVisible.sync="queryVisible"
          :query-rect="queryRect"
        />
      </a-col>
    </a-row>
  </div>
</template>
<script lang="ts">
import { Vue, Component, Prop, Watch } from 'vue-property-decorator'
import { Layer } from '@mapgis/web-app-framework'
import mStateInstance from '../../mixins/map-view-state'
import MapView from '../MapView'

@Component({
  components: {
    MapView
  }
})
export default class SplitScreenMap extends Vue {
  @Prop({ default: 12 }) mapSpan!: number

  @Prop({ default: () => [] }) screenNums!: number[]

  @Prop({ default: () => [] }) layerIds!: string[]

  @Prop({ default: () => [] }) layers!: Layer[]

  /**
   * 监听: 分屏数量变化
   */
  @Watch('screenNums')
  watchScreenNums(nV) {
    if (nV.length) {
      // 保存初始复位范围, 默认取第一个图层的全图范围, 只取一次
      mStateInstance.initView = this.layers[nV[0]].fullExtent
    }
  }

  queryVisible = false

  queryRect: Rect = {}

  // 每个屏的高度
  get mapSpanStyle() {
    const height = this.screenNums.length > 2 ? '50%' : '100%'
    return { height }
  }

  /**
   * 某个地图的查询抛出的事件
   * @param result<object>
   */
  onQuery(result: Rect) {
    this.queryVisible = true
    this.queryRect = result
  }
}
</script>
<style lang="less" scoped>
@import './index.less';
</style>
