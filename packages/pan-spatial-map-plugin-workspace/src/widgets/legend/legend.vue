<template>
  <div class="mp-widget-legend">图例</div>
</template>

<script lang="ts">
import { Mixins, Component } from 'vue-property-decorator'
import { WidgetMixin } from '@mapgis/web-app-framework'

@Component({ name: 'MpLegend' })
export default class MpLegend extends Mixins(WidgetMixin) {}
</script>

<style lang="less" scoped></style>
