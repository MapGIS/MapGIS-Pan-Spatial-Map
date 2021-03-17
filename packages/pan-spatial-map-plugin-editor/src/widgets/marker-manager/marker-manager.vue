<template>
  <div class="mp-widget-marker-manager">标注管理</div>
</template>

<script lang="ts">
import { Mixins, Component } from 'vue-property-decorator'
import { WidgetMixin } from '@mapgis/web-app-framework'

@Component({ name: 'MpMarkerManager' })
export default class MpMarkerManager extends Mixins(WidgetMixin) {}
</script>

<style lang="less" scoped></style>
