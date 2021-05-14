<template>
  <div class="map-box-thematic-map-layers">
    <template v-for="t in subjectLayers">
      <component :is="t" :key="t" />
    </template>
  </div>
</template>
<script lang="ts">
import { Vue, Component, Prop } from 'vue-property-decorator'
import { subjectTypes } from '@mapgis/pan-spatial-map-store'
import SubSectionMapLayer from './SubSectionMapLayer.vue' // 分段专题图

@Component({
  components: {
    SubSectionMapLayer
  }
})
export default class MapBoxThematicMapLayers extends Vue {
  // 获取渲染的子专题图层组件name集合
  get subjectLayers() {
    return subjectTypes.map(v => `${v.value}Layer`)
  }
}
</script>
<style lang="less" scoped></style>
