<template>
  <div class="mp-widget-comprehensive-query">综合查询</div>
</template>

<script lang="ts">
import { Mixins, Component } from 'vue-property-decorator'
import { WidgetMixin } from '@mapgis/web-app-framework'

@Component({ name: 'MpComprehensiveQuery' })
export default class MpComprehensiveQuery extends Mixins(WidgetMixin) {}
</script>

<style lang="less" scoped></style>
