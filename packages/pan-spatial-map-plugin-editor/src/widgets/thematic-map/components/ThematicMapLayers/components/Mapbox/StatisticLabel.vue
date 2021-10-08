<template>
  <!-- 等级符号专题图 -->
  <mapgis-theme-layer-custom
    @highlightChanged="emitHighlight"
    v-bind="themeOptions"
    :show-panel="false"
    :is-hover-able="true"
    :is-pop-up-able="true"
    :layer-id="id"
    :field="field"
    :data-source="geojson"
    :fid="marker.fid"
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
    const { labelStyle, themeStyle = {} } = this.subjectData
    return themeStyle
  }

  removeLayer() {
    const staticLabelLayer = this.$refs.customStaticLabelThemeLayer
    if (staticLabelLayer) {
      staticLabelLayer.resetLayer(this.id)
    }
  }
}
</script>
