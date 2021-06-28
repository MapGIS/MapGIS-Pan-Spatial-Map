<template>
  <div class="split-screen-map">
    <a-empty
      description="请在数据目录中选择需要分屏的数据"
      v-if="!screenNums.length"
    />
    <a-row :gutter="[5, 5]" v-else>
      <a-col
        v-for="s in screenNums"
        :key="s"
        :span="mapSpan"
        :style="mapSpanStyle"
      >
        <map-view
          @on-query="onQuery"
          :queryVisible.sync="queryVisible"
          :query-rect="queryRect"
          :map-view-id="`split-screen-map-${s}`"
          :map-view-layer="layers.find(({ id }) => layerIds[s] === id)"
          :resize="resize"
        />
      </a-col>
    </a-row>
  </div>
</template>
<script lang="ts">
import { Component, Prop, Watch, Vue } from 'vue-property-decorator'
import { Layer } from '@mapgis/web-app-framework'
import mapViewStateInstance, { Rect } from '../../mixins/map-view-state'
import MapView from '../MapView'

@Component({
  components: {
    MapView
  }
})
export default class SplitScreenMap extends Vue {
  @Prop() readonly resize!: string

  @Prop({ default: 12 }) readonly mapSpan!: number

  @Prop({ default: () => [] }) readonly screenNums!: number[]

  @Prop({ default: () => [] }) readonly layerIds!: string[]

  @Prop({ default: () => [] }) readonly layers!: Layer[]

  queryVisible = false

  queryRect: Rect = {}

  // 每个屏的高度
  get mapSpanStyle() {
    const height = this.screenNums.length > 2 ? '50%' : '100%'
    return { height }
  }

  // 获取初始地图视图的复位范围
  get initView() {
    return mapViewStateInstance.initView
  }

  // 设置初始地图视图的复位范围
  set initView(view: Rect) {
    mapViewStateInstance.initView = view
  }

  /**
   * 某个地图的查询抛出的事件
   * @param result 查询结果
   */
  onQuery(result: Rect) {
    this.queryVisible = true
    this.queryRect = result
  }

  /**
   * 监听: 分屏数量变化
   */
  @Watch('screenNums', { immediate: true })
  watchScreenNums(nV) {
    if (nV.length) {
      this.initView = this.layers[0].fullExtent
    }
  }

  beforeDestroyed() {
    this.queryVisible = false
    this.queryRect = {}
  }
}
</script>
<style lang="less" scoped>
@import './index.less';
</style>
