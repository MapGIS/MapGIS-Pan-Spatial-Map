<template>
  <div class="mp-widget-dynamic-section-analysis">动态剖切分析</div>
</template>

<script lang="ts">
import { Mixins, Component } from 'vue-property-decorator'
import { WidgetMixin } from '@mapgis/web-app-framework'

@Component({ name: 'MpDynamicSectionAnalysis' })
export default class MpDynamicSectionAnalysis extends Mixins(WidgetMixin) {}
</script>

<style lang="less" scoped></style>
