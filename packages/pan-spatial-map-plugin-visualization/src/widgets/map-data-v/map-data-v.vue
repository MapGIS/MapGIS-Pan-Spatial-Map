<template>
  <div class="mp-widget-map-data-v">MapDataV</div>
</template>

<script lang="ts">
import { Mixins, Component } from 'vue-property-decorator'
import { WidgetMixin } from '@mapgis/web-app-framework'

@Component({ name: 'MpMapDataV' })
export default class MpMapDataV extends Mixins(WidgetMixin) {}
</script>

<style lang="less" scoped></style>
