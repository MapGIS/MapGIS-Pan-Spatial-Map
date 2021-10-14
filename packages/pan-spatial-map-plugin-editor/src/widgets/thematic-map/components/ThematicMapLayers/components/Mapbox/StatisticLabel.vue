<template>
  <!-- 等级符号专题图 -->
  <mapgis-theme-layer-custom
    @highlightChanged="emitHighlight"
    :theme-option="themeOptions"
    :show-panel="false"
    :enable-tips="true"
    :layer-id="id"
    :field="field"
    :data-source="geojson"
    :highlight-feature="marker.feature"
    type="symbol"
    ref="customStaticLabelThemeLayer"
  />
</template>
<script lang="ts">
import { Component, Mixins } from 'vue-property-decorator'
import BaseMixin from '../../mixins/base'

@Component
export default class MapboxStatisticLabel extends Mixins(BaseMixin) {
  get themeOptions() {
    return this.subjectData?.themeStyle || {}
  }

  removeLayer() {
    const staticLabelLayer = this.$refs.customStaticLabelThemeLayer
    if (staticLabelLayer) {
      staticLabelLayer.resetLayer(this.id)
    }
  }
}
</script>
<style>
/* .mapboxgl-popup-content{
  padding: 0;
} */
</style>
