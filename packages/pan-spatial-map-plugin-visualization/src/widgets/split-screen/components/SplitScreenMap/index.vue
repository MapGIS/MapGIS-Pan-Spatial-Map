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
import { Layer } from '@mapgis/web-app-framework'
import mStateInstance from '../../mixins/map-view-state'
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
  @Watch('screenNums')
  watchScreenNums(nV) {
    if (nV.length) {
      // 保存初始复位范围, 默认取第一个图层的全图范围, 只取一次
      mStateInstance.initView = this.layers[nV[0]].fullExtent
    }
  }

  opera: Opera = 'null'

  queryVisible = false

  queryRect: Rect = {}

  // 每个屏的高度
  get mapSpanStyle() {
    const height = this.screenNums.length > 2 ? '50%' : '100%'
    return { height }
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
   * 全屏
   */
  onFullScreen() {
    const element = this.$el
    const exploreType = [
      'requestFullscreen',
      'mozRequestFullScreen',
      'webkitRequestFullscreen',
      'msRequestFullscreen'
    ]
    const classList = element.classList
    const hasScrollCls = classList.contains('beauty-scroll')
    if (exploreType.every(v => !(v in element))) {
      this.$message.warn('对不起，您的浏览器不支持全屏模式')
      if (hasScrollCls) {
        classList.remove('beauty-scroll')
      }
    } else {
      this.opera = 'openFullScreen'
      if (!hasScrollCls) {
        classList.add('beauty-scroll')
      }
      // eslint-disable-next-line prefer-const
      for (let v of exploreType) {
        if (v in element) {
          element[v]()
          break
        }
      }
    }
  }

  mounted() {
    window.onresize = () => {
      if (this.refresh) {
        this.refresh(this.opera)
      }

      if (this.opera === 'openFullScreen') {
        this.opera = 'closeFullScreen'
      }
    }
  }
}
</script>
<style lang="less" scoped>
@import './index.less';
</style>
