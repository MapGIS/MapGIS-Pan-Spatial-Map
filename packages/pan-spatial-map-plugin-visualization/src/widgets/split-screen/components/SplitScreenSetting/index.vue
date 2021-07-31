<template>
  <div class="split-screen-setting">
    <mp-group-tab size="small" title="设置" :has-top-margin="false">
      <mp-toolbar slot="handle" :bordered="false">
        <mp-toolbar-command
          title="全屏"
          :icon="fullScreen ? 'fullscreen-exit' : 'fullscreen'"
          @click="onToggleScreen"
        />
      </mp-toolbar>
    </mp-group-tab>
    <mp-setting-form layout="vertical" size="small">
      <a-form-item label="屏数">
        <a-select :value="screenCount" @change="onScreenCountChange">
          <a-select-option v-for="(s, i) in layers" :key="i" :value="i + 1">
            {{ i + 1 }}
          </a-select-option>
        </a-select>
      </a-form-item>
      <a-form-item v-show="screenNums.length" label="图示">
        <a-row class="diagram-grid">
          <a-col
            v-for="s in screenNums"
            :key="s"
            :span="mapSpan"
            class="diagram-col"
          >
            {{ s + 1 }}
          </a-col>
        </a-row>
      </a-form-item>
      <a-form-item
        v-for="s in screenNums"
        :key="s"
        :label="`第${screenLabel[s]}屏`"
      >
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
      </a-form-item>
    </mp-setting-form>
  </div>
</template>

<script lang="ts">
import { Vue, Component, Watch, Prop } from 'vue-property-decorator'
import { DomUtil, Layer } from '@mapgis/web-app-framework'

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
    DomUtil.addFullScreenListener(this.fullScreenListener)
  }

  beforeDestroy() {
    DomUtil.removeFullScreenListener(this.fullScreenListener)
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
