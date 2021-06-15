<template>
  <div class="swipe-cesium-compare">
    <mapgis-3d-compare
      v-if="showCompare"
      :before-layers="aboveLayers"
      :after-layers="belowLayers"
    />
    <swipe-setting
      @on-above-change="onChange"
      @on-below-change="onChange"
      :is-open="isOpen"
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
  aboveLayers: string[] = []

  // 下级(右侧)图层列表
  belowLayers: string[] = []

  // 是否展示卷帘
  get showCompare() {
    return this.aboveLayers.length && this.belowLayers.length
  }

  onChange({ id }, type) {
    this[`${type}Layers`] = id ? [id] : []
  }
}
</script>
<style lang="less" scoped>
.swipe-cesium-compare {
  padding: 0 12px;
  min-height: 600px;
}
</style>
