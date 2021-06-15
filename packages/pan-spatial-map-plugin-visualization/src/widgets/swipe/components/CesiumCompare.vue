<template>
  <div class="swipe-cesium-compare">
    <mapgis-3d-compare
      v-if="showCompare"
      :beforeLayers="beforeLayers"
      :afterLayers="afterLayers"
    />
    <swipe-setting
      :is-open="isOpen"
      @on-above-layer-change="onAboveLayerChange"
      @on-below-layer-change="onBelowLayerChange"
    />
  </div>
</template>
<script lang="ts">
import { Component, Vue, Prop } from 'vue-property-decorator'
import { Layer } from '@mapgis/web-app-framework'
import SwipeSetting from './SwipeSetting'

@Component({
  components: {
    SwipeSetting
  }
})
export default class CesiumCompare extends Vue {
  @Prop() readonly isOpen!: boolean
  // 上级(左侧)图层列表
  beforeLayers: string[] = []

  // 下级(右侧)图层列表
  afterLayers: string[] = []

  // 是否展示卷帘
  get showCompare() {
    return this.beforeLayers.length && this.afterLayers.length
  }

  onAboveLayerChange({ id }) {
    this.beforeLayers = [id]
  }

  onBelowLayerChange({ id }) {
    this.afterLayers = [id]
  }
}
</script>
