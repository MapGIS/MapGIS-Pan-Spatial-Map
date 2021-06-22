<template>
  <a-space class="swipe-setting" direction="vertical" style="flex: 1;">
    <!-- 上图层 -->
    <a-row>
      <a-col> {{ directionLayerTitle.aboveTitle }}图层： </a-col>
      <a-col>
        <a-select :value="aboveLayer.id" @change="onAboveChange">
          <a-select-option
            v-for="p in aboveLayers"
            :key="p.id"
            :value="p.id"
            :title="p.title"
            >{{ p.title }}</a-select-option
          ></a-select
        >
      </a-col>
    </a-row>
    <!-- 下图层 -->
    <a-row>
      <a-col> {{ directionLayerTitle.belowTitle }}图层： </a-col>
      <a-col>
        <a-select :value="belowLayer.id" @change="onBelowChange">
          <a-select-option
            v-for="p in belowLayers"
            :key="p.id"
            :value="p.id"
            :title="p.title"
            >{{ p.title }}</a-select-option
          >
        </a-select>
      </a-col>
    </a-row>
    <!-- 方向 -->
    <a-radio-group :value="direction" @change="onDirectionChange">
      <a-radio value="vertical"> 垂直 </a-radio>
      <a-radio value="horizontal" v-show="swipe.is2DMapMode"> 水平 </a-radio>
    </a-radio-group>
  </a-space>
</template>
<script lang="ts">
import { Vue, Watch, Component, InjectReactive } from 'vue-property-decorator'

@Component
export default class SwipeSetting extends Vue {
  @InjectReactive({
    from: 'swipe',
    default: () => ({})
  })
  swipe: any

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
      aboveTitle = '上级'
      belowTitle = '下级'
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
  /deep/ .ant-select {
    width: 100%;
  }
}
</style>
