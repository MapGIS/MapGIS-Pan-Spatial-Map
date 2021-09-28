<template>
  <!-- 等级符号专题图 -->
  <mapgis-igs-theme-layer-custom
    :showPanel="false"
    :dataSource="geojson"
    :themeProps="themeProps"
    :theme-options="themeOptions"
    ref="customThemeLayer"
  />
</template>
<script lang="ts">
import { Component, Mixins } from 'vue-property-decorator'
import BaseMixin from '../../mixins/base'

@Component
export default class MapboxStatisticLabel extends Mixins(BaseMixin) {
  get themeProps() {
    return {
      layerId: this.id,
      themeField: this.subjectData.field,
      themeType: 'symbol'
    }
  }

  get themeOptions() {
    return this.subjectData?.labelStyle || []
  }
}
</script>
