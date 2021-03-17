<template>
  <div class="mp-widget-feature-query">要素查询</div>
</template>

<script lang="ts">
import { Mixins, Component } from 'vue-property-decorator'
import { WidgetMixin } from '@mapgis/web-app-framework'

@Component({ name: 'MpFeatureQuery' })
export default class MpFeatureQuery extends Mixins(WidgetMixin) {}
</script>

<style lang="less" scoped></style>
