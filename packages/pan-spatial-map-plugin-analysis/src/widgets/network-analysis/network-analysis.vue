<template>
  <div class="mp-widget-network-analysis">网络分析</div>
</template>

<script lang="ts">
import { Mixins, Component } from 'vue-property-decorator'
import { WidgetMixin } from '@mapgis/web-app-framework'

@Component({ name: 'MpNetworkAnalysis' })
export default class MpNetworkAnalysis extends Mixins(WidgetMixin) {}
</script>

<style lang="less" scoped></style>
