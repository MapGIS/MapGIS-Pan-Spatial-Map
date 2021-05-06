<template>
  <div class="split-screen-setting">
    <a-row align="middle" :gutter="[12, 0]">
      <a-col span="4">屏数：</a-col>
      <a-col span="20">
        <a-select :value="screenCount" @change="onScreenCountChange">
          <a-select-option v-for="s in screenNums" :key="s">{{
            s
          }}</a-select-option>
        </a-select>
      </a-col>
    </a-row>
    <a-row align="middle" :gutter="[12, 0]" v-show="screenNums.length">
      <a-col span="4">图示：</a-col>
      <a-col span="20">
        <span class="screen-example" v-for="s in screenNums" :key="s" />
      </a-col>
    </a-row>
    <a-row v-for="s in screenNums" :key="s" align="middle" :gutter="[12, 0]">
      <a-col span="6">第{{ s }}屏：</a-col>
      <a-col span="18">
        <a-select>
          <a-select-option v-for="l in layers" :key="l.id">{{
            l.title
          }}</a-select-option>
        </a-select>
      </a-col>
    </a-row>
  </div>
</template>
<script lang="ts">
import { Mixins, Component, Watch, Prop } from 'vue-property-decorator'
import { WidgetMixin, WidgetState, Layer } from '@mapgis/web-app-framework'

interface IMapInfo {
  screenNO: number
  layer: Layer
}

@Component
export default class SplitScreenSetting extends Mixins<{
  [k: string]: any
}>(WidgetMixin) {
  @Prop({ default: () => [] }) layers!: Layer[]

  screenCount: string | number = ''

  screenNums: number[] = []

  mapInfos: IMapInfo[] = []

  // 功能弹框开关
  get isOpen() {
    return [WidgetState.OPENED, WidgetState.ACTIVE].includes(this.widget.state)
  }

  /**
   * 获取选中目录树下的叶子节点图层中的可见图层
   */
  initLayers() {
    this.screenNums = []
    this.mapInfos = []
    this.screenCount = this.layers.length < 7 ? this.layers.length : 6
    for (let i = 1; i <= this.screenCount; i += 1) {
      this.screenNums.push(i)
      this.mapInfos.push({
        screenNO: i,
        layer: this.layers[i - 1]
      })
    }
  }

  /**
   * 屏数变化
   * @param value<number>
   */
  onScreenCountChange(value: number) {
    this.screenCount = value
  }

  @Watch('layers')
  watchLayers() {
    if (this.isOpen) {
      this.initLayers()
    }
  }

  created() {
    if (this.isOpen) {
      this.initLayers()
    }
  }
}
</script>
<style lang="less" scoped>
@import './index.less';
</style>
