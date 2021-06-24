<template>
  <div class="split-screen-setting" :class="{ collapsed: !visible }">
    <div class="setting-handle" @click="onToggle">
      <a-icon :type="handleIcon" />
    </div>
    <div class="setting-content">
      <row-flex label="屏数">
        <a-select :value="screenCount" @change="onScreenCountChange">
          <a-select-option v-for="(s, i) in layers" :key="i" :value="i + 1">{{
            i + 1
          }}</a-select-option>
        </a-select>
      </row-flex>
      <row-flex label="图示" align="top" v-show="screenNums.length">
        <a-row class="grid">
          <a-col v-for="s in screenNums" :key="s" :span="mapSpan" class="col">{{
            s + 1
          }}</a-col>
        </a-row>
      </row-flex>
      <row-flex
        v-for="s in screenNums"
        :label="`第${screenLabel[s]}屏`"
        :key="s"
      >
        <a-select :value="layerIds[s]" @change="onLayerChange($event, s)">
          <a-select-option
            v-for="{ id, title } in layers"
            :key="id"
            :value="id"
            :title="title"
            >{{ title }}</a-select-option
          >
        </a-select>
      </row-flex>
      <div class="btns">
        <a-button type="primary" @click="onFullScreen">全屏展示</a-button>
      </div>
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
  @Prop({ default: 12 }) readonly mapSpan!: number

  @Prop({ default: () => [] }) readonly screenNums!: number[]

  @Prop({ default: () => [] }) readonly layerIds!: string[]

  @Prop({ default: () => [] }) readonly layers!: Layer[]

  /**
   * 监听: 分屏数量变化
   */
  @Watch('screenNums', { immediate: true })
  watchScreenNums(nV: number[]) {
    this.screenCount = nV.length
  }

  visible = true

  screenLabel = ScreenLabel

  screenCount = null

  // 设置面板的收缩开关icon
  get handleIcon() {
    return this.visible ? 'right' : 'left'
  }

  /**
   * 设置面板展开收缩
   */
  onToggle() {
    this.visible = !this.visible
    this.$emit('on-setting-panel-toggle')
  }

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
    this.$emit('on-full-screen')
  }
}
</script>

<style lang="less" scoped>
@import './index.less';
</style>
