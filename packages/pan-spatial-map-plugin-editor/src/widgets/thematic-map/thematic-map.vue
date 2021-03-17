<template>
  <div class="mp-widget-thematic-map">专题地图</div>
</template>

<script lang="ts">
import { Mixins, Component } from 'vue-property-decorator'
import { WidgetMixin } from '@mapgis/web-app-framework'

@Component({ name: 'MpThematicMap' })
export default class MpThematicMap extends Mixins(WidgetMixin) {}
</script>

<style lang="less" scoped></style>
