<template>
  <div class="mp-widget-skyline-analysis">天际线分析</div>
</template>

<script lang="ts">
import { Mixins, Component } from 'vue-property-decorator'
import { WidgetMixin } from '@mapgis/web-app-framework'

@Component({
  name: 'MpSkylineAnalysis'
})
export default class MpSkylineAnalysis extends Mixins(WidgetMixin) {
  // 微件关闭时
  onClose() {}

  // 微件失活时
  onDeActive() {}
}
</script>

<style lang="less">
.mp-widget-terrain-analysis {
  flex: 1 1 0%;
  max-width: 350px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}
</style>
