<template>
  <!-- 分段专题图 -->
  <mapgis-theme-layer-custom
    @highlightChanged="emitHighlight"
    :theme-options="themeOptions"
    :show-panel="false"
    :enable-tips="true"
    :tips-options="tipsOptions"
    :layer-id="id"
    :field="field"
    :data-source="geojson"
    :highlight-feature="marker.feature"
    type="range"
    ref="customRangeThemeLayer"
  />
</template>
<script lang="ts">
import { Mixins, Component } from 'vue-property-decorator'
import BaseMixin from '../../mixins/base'

@Component
export default class MapboxSubSectionMap extends Mixins(BaseMixin) {
  private tipsOptions = {
    enableHighlight: true,
    type: 'point'
  }

  get themeOptions() {
    if (!this.subjectData) {
      return {}
    } else {
      const { color, themeStyle } = this.subjectData
      // 兼容旧配置
      return color && color.length
        ? {
            styleGroups: color.map(({ min, max, sectionColor }) => ({
              start: min,
              end: max,
              style: {
                color: sectionColor
              }
            }))
          }
        : themeStyle || {}
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
<style>
/* .mapboxgl-popup-content{
  padding: 0;
} */
</style>
