<template>
  <mp-setting-form class="swipe-setting" layout="vertical" size="small">
    <a-form-item :label="`${directionLayerTitle.aboveTitle}图层`">
      <a-select :value="aboveLayer.id" @change="onAboveChange">
        <a-select-option
          v-for="p in aboveLayers"
          :key="p.id"
          :value="p.id"
          :title="p.title"
          >{{ p.title }}</a-select-option
        >
      </a-select>
    </a-form-item>
    <a-form-item :label="`${directionLayerTitle.belowTitle}图层`">
      <a-select :value="belowLayer.id" @change="onBelowChange">
        <a-select-option
          v-for="p in belowLayers"
          :key="p.id"
          :value="p.id"
          :title="p.title"
          >{{ p.title }}</a-select-option
        >
      </a-select>
    </a-form-item>
    <a-form-item label="类型">
      <a-radio-group :value="direction" @change="onDirectionChange">
        <a-radio value="vertical"> 垂直 </a-radio>
        <a-radio value="horizontal" v-show="swipe.is2DMapMode"> 水平 </a-radio>
      </a-radio-group>
    </a-form-item>
  </mp-setting-form>
</template>

<script lang="ts">
import { Vue, Watch, Component, Inject } from 'vue-property-decorator'

@Component
export default class SwipeSetting extends Vue {
  @Inject({
    from: 'swipe',
    default: () => ({})
  })
  readonly swipe!: any

  // 卷帘方向
  get direction() {
    return this.swipe.is2DMapMode ? this.swipe.direction : 'vertical'
  }

  // 卷帘方向变化，同步更改图层选择框的标题
  get directionLayerTitle(): {
    aboveTitle: string
    belowTitle: string
  } {
    let aboveTitle = '左侧'
    let belowTitle = '右侧'
    if (this.direction !== 'vertical') {
      aboveTitle = '上层'
      belowTitle = '下层'
    }
    return {
      aboveTitle,
      belowTitle
    }
  }

  // 上级(左侧)图层
  get aboveLayer() {
    return this.swipe.aboveLayer || {}
  }

  // 下级(右侧)图层
  get belowLayer() {
    return this.swipe.belowLayer || {}
  }

  // 上级(左侧)图层列表
  get aboveLayers() {
    return this.swipe.aboveLayers || []
  }

  // 下级(右侧)图层列表
  get belowLayers() {
    return this.swipe.belowLayers || []
  }

  /**
   * 上层(左侧)图层变化
   */
  onAboveChange(value: string) {
    this.swipe.onAboveChange(value)
  }

  /**
   * 下层(右侧)图层变化
   */
  onBelowChange(value: string) {
    this.swipe.onBelowChange(value)
  }

  /**
   * 卷帘方向变化
   */
  onDirectionChange(e) {
    this.swipe.onDirectChange(e.target.value)
  }
}
</script>
<style lang="less" scoped>
.swipe-setting {
  width: 100%;
  height: 100%;
}
</style>
