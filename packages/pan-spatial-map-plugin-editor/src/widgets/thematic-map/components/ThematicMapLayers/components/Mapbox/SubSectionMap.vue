<template>
  <!-- 分段专题图 -->
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
    type="range"
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
    return color
      ? {
          styleGroups: color.map(({ min, max, sectionColor }) => ({
            start: min,
            end: max,
            style: {
              color: sectionColor
            }
          }))
        }
      : themeStyle
  }

  removeLayer() {
    const rangeLayer = this.$refs.customRangeThemeLayer
    if (rangeLayer) {
      rangeLayer.resetLayer(this.id)
    }
  }
}
</script>
