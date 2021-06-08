<template>
  <mapgis-3d-compare
    v-if="showCompare"
    :beforeLayers="beforeLayers"
    :afterLayers="afterLayers"
  />
</template>
<script lang="ts">
import { Component, Vue, Prop } from 'vue-property-decorator'

@Component
export default class CesiumCompare extends Vue {
  @Prop({ default: () => ({}) }) readonly aboveLayer!: Layer

  @Prop({ default: () => ({}) }) readonly belowLayer!: Layer

  // 是否展示卷帘
  get showCompare() {
    return this.aboveLayer.id && this.belowLayer.id
  }

  get beforeLayers() {
    return [this.aboveLayer.id]
  }

  get afterLayers() {
    return [this.belowLayer.id]
  }
}
</script>
