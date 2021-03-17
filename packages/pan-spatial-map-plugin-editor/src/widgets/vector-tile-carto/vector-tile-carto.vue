<template>
  <div class="mp-widget-vector-tile-carto">矢量瓦片制图</div>
</template>

<script lang="ts">
import { Mixins, Component } from 'vue-property-decorator'
import { WidgetMixin } from '@mapgis/web-app-framework'

@Component({ name: 'MpVectorTileCarto' })
export default class MpVectorTileCarto extends Mixins(WidgetMixin) {}
</script>

<style lang="less" scoped></style>
