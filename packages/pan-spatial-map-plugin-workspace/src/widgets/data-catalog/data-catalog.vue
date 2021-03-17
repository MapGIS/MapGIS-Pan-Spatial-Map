<template>
  <div class="mp-widget-data-catalog">数据目录</div>
</template>

<script lang="ts">
import { Mixins, Component } from 'vue-property-decorator'
import { WidgetMixin } from '@mapgis/web-app-framework'

@Component({ name: 'MpDataCatalog' })
export default class MpDataCatalog extends Mixins(WidgetMixin) {}
</script>

<style lang="less" scoped></style>
