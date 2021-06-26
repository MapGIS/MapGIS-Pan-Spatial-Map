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
import { Vue, Component, Prop, Watch } from 'vue-property-decorator'
import { Layer, Layer3D, Objects } from '@mapgis/web-app-framework'
import mapViewStateInstance from '../../mixins/map-view-state'
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

  /**
   * 监听: 分屏数量变化
   */
  @Watch('screenNums', { immediate: true })
  watchScreenNums(nV) {
    if (nV.length) {
      mapViewStateInstance.initView = this.getInitView()
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
   * 格式化初始视角范围数据
   * 默认取第一个图层的全图范围
   */
  getInitView() {
    const layer = this.layers[0]
    // eslint-disable-next-line prefer-const
    let initView: Rect = layer.fullExtent
    if (layer instanceof Layer3D) {
      // todo 三维图层fullExtent转范围
      // initView = Objects.SceneController.layerLocalExtentToGlobelExtent(layer)
    }
    return initView
  }

  /**
   * 某个地图的查询抛出的事件
   * @param result 查询结果
   */
  onQuery(result: Rect) {
    this.queryVisible = true
    this.queryRect = result
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
