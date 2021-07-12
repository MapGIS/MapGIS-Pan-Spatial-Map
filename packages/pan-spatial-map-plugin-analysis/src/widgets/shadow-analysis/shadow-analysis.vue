<template>
  <div class="mp-widget-shadow-analysis">阴影分析</div>
</template>

<script lang="ts">
import { Mixins, Component } from 'vue-property-decorator'
import { WidgetMixin } from '@mapgis/web-app-framework'

@Component({
  name: 'MpShadowAnalysis'
})
export default class MpShadowAnalysis extends Mixins(WidgetMixin) {
  // 微件关闭时
  onClose() {}

  // 微件失活时
  onDeActive() {}
}
</script>

<style lang="less">
.mp-widget-shadow-analysis {
  flex: 1 1 0%;
  max-width: 350px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}
</style>
