<template>
  <div class="mp-widget-basemap-manager">地图管理</div>
</template>

<script lang="ts">
import { Mixins, Component } from 'vue-property-decorator'
import { WidgetMixin } from '@mapgis/web-app-framework'

@Component({ name: 'MpBasemapManager' })
export default class MpBasemapManager extends Mixins(WidgetMixin) {}
</script>

<style lang="less" scoped></style>
