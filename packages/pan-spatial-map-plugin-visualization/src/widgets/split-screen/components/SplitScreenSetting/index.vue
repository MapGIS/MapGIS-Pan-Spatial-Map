<template>
  <a-space class="split-screen-setting" direction="vertical" style="flex: 1;">
    <a-row>
      <mp-toolbar>
        <mp-toolbar-title>设置</mp-toolbar-title>
        <mp-toolbar-command-group>
          <mp-toolbar-command
            title="全屏"
            :icon="fullScreen ? 'fullscreen-exit' : 'fullscreen'"
            @click="onToggleScreen"
          />
        </mp-toolbar-command-group>
      </mp-toolbar>
    </a-row>
    <a-row>
      <a-col>屏数</a-col>
    </a-row>
    <a-row>
      <a-select :value="screenCount" @change="onScreenCountChange">
        <a-select-option v-for="(s, i) in layers" :key="i" :value="i + 1">
          {{ i + 1 }}
        </a-select-option>
      </a-select>
    </a-row>
    <a-row v-show="screenNums.length">
      <a-col>图示</a-col>
    </a-row>
    <a-row class="diagram-grid" v-show="screenNums.length">
      <a-col
        v-for="s in screenNums"
        :key="s"
        :span="mapSpan"
        class="diagram-col"
        >{{ s + 1 }}</a-col
      >
    </a-row>
    <template v-for="s in screenNums">
      <a-row :key="s">
        <a-col>{{ `第${screenLabel[s]}屏` }}</a-col>
      </a-row>
      <a-row :key="s">
        <a-select :value="layerIds[s]" @change="onLayerChange($event, s)">
          <a-select-option
            v-for="{ id, title } in layers"
            :key="id"
            :value="id"
            :title="title"
          >
            {{ title }}
          </a-select-option>
        </a-select>
      </a-row>
    </template>
  </a-space>
</template>

<script lang="ts">
import { Vue, Component, Watch, Prop } from 'vue-property-decorator'
import { Layer } from '@mapgis/web-app-framework'

enum ScreenLabel {
  '一' = 0,
  '二',
  '三',
  '四',
  '五',
  '六'
}
@Component({})
export default class SplitScreenSetting extends Vue {
  @Prop({ default: 12 }) readonly mapSpan!: number

  @Prop({ default: () => [] }) readonly screenNums!: number[]

  @Prop({ default: () => [] }) readonly layerIds!: string[]

  @Prop({ default: () => [] }) readonly layers!: Layer[]

  private visible = true

  private screenLabel = ScreenLabel

  private screenCount = null

  private fullScreen = false

  // 设置面板的收缩开关icon
  get handleIcon() {
    return this.visible ? 'right' : 'left'
  }

  /**
   * 监听: 分屏数量变化
   */
  @Watch('screenNums', { immediate: true })
  watchScreenNums(nV: number[]) {
    this.screenCount = nV.length
  }

  created() {
    this.addListener()
  }

  beforeDestroy() {
    this.removeListener()
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
  onToggleScreen() {
    if (this.fullScreen) {
      this.$emit('out-full-screen')
    } else {
      this.$emit('in-full-screen')
    }
  }

  private addListener() {
    document.addEventListener('fullscreenchange', this.fullScreenListener)
    document.addEventListener('webkitfullscreenchange', this.fullScreenListener)
    document.addEventListener('mozfullscreenchange', this.fullScreenListener)
    document.addEventListener('msfullscreenchange', this.fullScreenListener)
  }

  private removeListener() {
    document.removeEventListener('fullscreenchange', this.fullScreenListener)
    document.removeEventListener(
      'webkitfullscreenchange',
      this.fullScreenListener
    )
    document.removeEventListener('mozfullscreenchange', this.fullScreenListener)
    document.removeEventListener('msfullscreenchange', this.fullScreenListener)
  }

  private fullScreenListener(e) {
    if (e.target.id === this.id) {
      this.fullScreen = !this.fullScreen
    }
  }
}
</script>

<style lang="less" scoped>
@import './index.less';
</style>
