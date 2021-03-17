<template>
  <div class="mp-widget-layer-list">图层列表</div>
</template>

<script lang="ts">
import { Mixins, Component } from 'vue-property-decorator'
import { WidgetMixin } from '@mapgis/web-app-framework'

@Component({ name: 'MpLayerList' })
export default class MpLayerList extends Mixins(WidgetMixin) {}
</script>

<style lang="less" scoped></style>
