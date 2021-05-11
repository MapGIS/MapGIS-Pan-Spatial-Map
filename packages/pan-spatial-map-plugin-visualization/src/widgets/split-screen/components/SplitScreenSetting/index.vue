<template>
  <div class="split-screen-setting">
    <row-flex label="屏数">
      <a-select :value="screenCount" @change="onScreenCountChange">
        <a-select-option
          v-for="(l, i) in layersOrigin"
          :key="i"
          :value="i + 1"
          >{{ i + 1 }}</a-select-option
        >
      </a-select>
    </row-flex>
    <row-flex label="图示" align="top" v-show="layers.length">
      <a-row class="split-screen-grid">
        <a-col
          v-for="(l, i) in layers"
          :key="i"
          :span="mapSpan.span"
          class="split-screen-grid-col"
          >{{ i + 1 }}</a-col
        >
      </a-row>
    </row-flex>
    <row-flex
      v-for="(l, i) in layers"
      :label="`第${screenLabel[i + 1]}屏`"
      :key="i"
    >
      <a-select :value="l.id" @change="onLayerChange($event, i)">
        <a-select-option v-for="l in layersOrigin" :key="l.id" :value="l.id">{{
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
import { Mixins, Component, Watch, Prop } from 'vue-property-decorator'
import { WidgetMixin, WidgetState, Layer } from '@mapgis/web-app-framework'
import RowFlex from '../RowFlex'

enum ScreenLabel {
  '一' = 1,
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
export default class SplitScreenSetting extends Mixins<{
  [k: string]: any
}>(WidgetMixin) {
  @Prop({
    default: () => ({
      span: 12,
      height: '100%'
    })
  })
  mapSpan!: object

  @Prop({ default: () => [] }) layers!: Layer[]

  @Prop({ default: () => [] }) layersOrigin!: Layer[]

  // openFullScreen | closeFullScreen|null
  opera = 'null'

  screenLabel = ScreenLabel

  screenCount: number | null = null

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
   * @param newLayerId<string>
   * @param oldLayerIndex<number>
   */
  onLayerChange(newLayerId, oldLayerIndex) {
    this.$emit(
      'on-layer-change',
      oldLayerIndex,
      this.layersOrigin.find(({ id }) => id === newLayerId)
    )
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
   * 监听: 图层列表变化
   */
  @Watch('layers')
  watchLayers(nV: ILayer[]) {
    this.screenCount = nV.length || null
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
