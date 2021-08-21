<template>
  <div class="swipe-cesium-compare">
    <!-- 卷帘组件 -->
    <mapgis-3d-compare
      v-if="showCompare && refreshFlag()"
      :before-layers="beforeLayers"
      :after-layers="afterLayers"
    />
    <!-- 空数据提示 -->
    <a-empty
      v-show="!showCompare"
      description="卷帘分析功能至少需要选择2个图层"
    />
    <!-- 图层设置 -->
    <swipe-setting v-show="showCompare" />
  </div>
</template>
<script lang="ts">
import { Component, Vue, Inject } from 'vue-property-decorator'
import { Layer } from '@mapgis/web-app-framework'
import SwipeSetting from './SwipeSetting'

@Component({
  components: {
    SwipeSetting
  }
})
export default class CesiumCompare extends Vue {
  @Inject({
    from: 'swipe',
    default: () => ({})
  })
  readonly swipe!: any

  // 上级(左侧)图层列表
  get beforeLayers() {
    return this.getLayerIds(this.swipe.aboveLayer)
  }

  // 下级(右侧)图层列表
  get afterLayers() {
    return this.getLayerIds(this.swipe.belowLayer)
  }

  // 是否展示卷帘
  get showCompare() {
    return this.beforeLayers.length && this.afterLayers.length
  }

  // 刷新标志
  get refreshFlag() {
    return () => this.swipe.refreshCesiumCompare
  }

  /**
   * 获取图层ID列表
   */
  getLayerIds({ id }: Layer) {
    return id ? [id] : []
  }
}
</script>
<style lang="less" scoped>
.swipe-cesium-compare {
  padding: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>

<style lang="less">
.mp-map-container {
  .cesium-map-wrapper .slider {
    border: 1px solid @primary-color;
    background-color: @border-color;
    width: 3px;
  }
}
</style>
