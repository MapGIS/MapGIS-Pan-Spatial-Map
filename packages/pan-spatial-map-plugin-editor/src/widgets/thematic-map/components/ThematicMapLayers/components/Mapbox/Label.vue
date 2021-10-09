<template>
  <!-- 聚合标注专题图 ， 必须有geojson数据才会展示 -->
  <mapgis-mapv-layer
    v-if="geojson && geojson.features && !!geojson.features.length"
    :geojson="geojson"
    :options="options"
    :count-field="field"
  />
</template>
<script lang="ts">
import { Mixins, Component } from 'vue-property-decorator'
import BaseMixin from '../../mixins/base'

@Component
export default class MapboxLabel extends Mixins(BaseMixin) {
  get options() {
    return {
      draw: 'cluster',
      context: '2d',
      ...(this.subjectData?.themeStyle || {})
    }
  }
}
</script>
