<template>
  <div class="mp-widget-visual-analysis">可视域分析</div>
</template>

<script lang="ts">
import { Mixins, Component } from 'vue-property-decorator'
import { WidgetMixin } from '@mapgis/web-app-framework'

@Component({ name: 'MpVisualAnalysis' })
export default class MpVisualAnalysis extends Mixins(WidgetMixin) {}
</script>

<style lang="less" scoped></style>
