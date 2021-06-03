<template>
  <mapgis-3d-compare :beforeLayers="[aboveLayer]" :afterLayers="[belowLayer]" />
</template>
<script lang="ts">
import { Component, Vue, Prop } from 'vue-property-decorator'

@Component
export default class CesiumCompare extends Vue {
  @Prop({ default: () => ({}) }) readonly aboveLayer!: Layer

  @Prop({ default: () => ({}) }) readonly belowLayer!: Layer

  @Prop({ default: 'vertical' }) readonly direction!: Direction
}
</script>
