<template>
  <div class="mp-widget-func-warehouse">功能仓库</div>
</template>

<script lang="ts">
import { Mixins, Component } from 'vue-property-decorator'
import { WidgetMixin } from '@mapgis/web-app-framework'

@Component({ name: 'MpFuncWarehouse' })
export default class MpFuncWarehouse extends Mixins(WidgetMixin) {}
</script>

<style lang="less" scoped></style>
