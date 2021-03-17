<template>
  <div class="mp-widget-visibility-analysis">通视分析</div>
</template>

<script lang="ts">
import { Mixins, Component } from 'vue-property-decorator'
import { WidgetMixin } from '@mapgis/web-app-framework'

@Component({ name: 'MpVisibilityAnalysis' })
export default class MpVisibilityAnalysis extends Mixins(WidgetMixin) {}
</script>

<style lang="less" scoped></style>
