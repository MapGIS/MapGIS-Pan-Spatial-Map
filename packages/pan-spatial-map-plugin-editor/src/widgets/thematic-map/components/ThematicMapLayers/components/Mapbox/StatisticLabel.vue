<template>
  <!-- 等级符号专题图 -->
  <mapgis-igs-theme-layer-custom
    @highlightChanged="emitHighlight"
    :showPanel="false"
    :layer-id="id"
    :data-source="geojson"
    v-bind="themeOptions"
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
    return {
      type: 'symbol',
      field: this.field,
      ...themeStyle
    }
  }

  removeLayer() {
    const staticLabelLayer = this.$refs.customStaticLabelThemeLayer
    if (staticLabelLayer) {
      staticLabelLayer.resetLayer(this.id)
    }
  }
}
</script>
