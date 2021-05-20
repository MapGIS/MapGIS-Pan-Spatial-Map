<template>
  <div class="split-screen-setting">
    <row-flex label="屏数">
      <a-select :value="screenCount" @change="onScreenCountChange">
        <a-select-option v-for="(s, i) in layers" :key="i" :value="i + 1">{{
          i + 1
        }}</a-select-option>
      </a-select>
    </row-flex>
    <row-flex label="图示" align="top" v-show="screenNums.length">
      <a-row class="split-screen-grid">
        <a-col
          v-for="s in screenNums"
          :key="s"
          :span="mapSpan"
          class="split-screen-grid-col"
          >{{ s + 1 }}</a-col
        >
      </a-row>
    </row-flex>
    <row-flex v-for="s in screenNums" :label="`第${screenLabel[s]}屏`" :key="s">
      <a-select :value="layerIds[s]" @change="onLayerChange($event, s)">
        <a-select-option v-for="l in layers" :key="l.id" :value="l.id">{{
          l.title
        }}</a-select-option>
      </a-select>
    </row-flex>
    <div class="split-screen-btns">
      <a-button type="primary" @click="onFullScreen">全屏展示</a-button>
      <a-button @click="onCancel">取消</a-button>
    </div>
  </div>
</template>
<script lang="ts">
import { Vue, Component, Watch, Prop } from 'vue-property-decorator'
import { Layer } from '@mapgis/web-app-framework'
import RowFlex from '../RowFlex'

type Opera = 'openFullScreen' | 'closeFullScreen' | 'null'

enum ScreenLabel {
  '一' = 0,
  '二',
  '三',
  '四',
  '五',
  '六'
}
@Component({
  components: {
    RowFlex
  }
})
export default class SplitScreenSetting extends Vue {
  @Prop({ default: 12 }) mapSpan!: number

  @Prop({ default: () => [] }) screenNums!: number[]

  @Prop({ default: () => [] }) layerIds!: string[]

  @Prop({ default: () => [] }) layers!: Layer[]

  opera: Opera = 'null'

  screenLabel = ScreenLabel

  screenCount = null

  /**
   * 屏数变化
   * @param screenCount<number>
   */
  onScreenCountChange(screenCount: number) {
    this.screenCount = screenCount
    this.$emit('on-screen-count-change', screenCount)
  }

  /**
   * 图层选择变化
   * @param layerId
   * @param index
   */
  onLayerChange(layerId: string, index: number) {
    this.$emit('on-layer-change', layerId, index)
  }

  /**
   * 全屏
   */
  onFullScreen() {
    const element = document.getElementsByClassName('split-screen-map')[0]
    if (element.requestFullscreen) {
      element.requestFullscreen()
    } else if (element.mozRequestFullScreen) {
      element.mozRequestFullScreen()
    } else if (element.webkitRequestFullscreen) {
      element.webkitRequestFullscreen()
    } else if (element.msRequestFullscreen) {
      element.msRequestFullscreen()
    }
    this.opera = 'openFullScreen'
  }

  /**
   * 取消
   */
  onCancel() {
    // todo 手动调用弹框关闭事件
  }

  /**
   * 监听: 分屏数量变化
   */
  @Watch('screenNums')
  watchScreenNums(nV: number[]) {
    this.screenCount = nV.length
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
