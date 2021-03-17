<template>
  <div class="mp-widget-topology-analysis">拓扑分析</div>
</template>

<script lang="ts">
import { Mixins, Component } from 'vue-property-decorator'
import { WidgetMixin } from '@mapgis/web-app-framework'

@Component({ name: 'MpTopologyAnalysis' })
export default class MpTopologyAnalysis extends Mixins(WidgetMixin) {}
</script>

<style lang="less" scoped></style>
