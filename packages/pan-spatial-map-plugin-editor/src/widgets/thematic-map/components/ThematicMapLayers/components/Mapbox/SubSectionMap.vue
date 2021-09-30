<template>
  <!-- 分段专题图图层 -->
  <mapgis-igs-theme-layer-custom
    @highlightChanged="emitHighlight"
    :showPanel="false"
    :layer-id="id"
    :data-source="geojson"
    v-bind="themeOptions"
    ref="customRangeThemeLayer"
  />
</template>
<script lang="ts">
import { Mixins, Component } from 'vue-property-decorator'
import BaseMixin from '../../mixins/base'

@Component
export default class MapboxSubSectionMap extends Mixins(BaseMixin) {
  get themeOptions() {
    const { color, themeStyle = {} } = this.subjectData
    // 兼容旧配置
    const _themeStyle = color
      ? {
          styleGroups: color.map(({ min, max, color }) => ({
            start: min,
            end: max,
            style: {
              color
            }
          }))
        }
      : themeStyle
    return {
      type: 'range',
      field: this.field,
      ..._themeStyle
    }
  }

  removeLayer() {
    const rangeLayer = this.$refs.customRangeThemeLayer
    if (rangeLayer) {
      rangeLayer.resetLayer(this.id)
    }
  }
}
</script>
