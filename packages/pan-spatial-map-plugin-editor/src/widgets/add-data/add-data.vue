<template>
  <div class="mp-widget-add-data">添加数据</div>
</template>

<script lang="ts">
import { Mixins, Component } from 'vue-property-decorator'
import { WidgetMixin } from '@mapgis/web-app-framework'

@Component({ name: 'MpAddData' })
export default class MpAddData extends Mixins(WidgetMixin) {}
</script>

<style lang="less" scoped></style>
