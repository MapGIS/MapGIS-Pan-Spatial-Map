<template>
  <div class="mp-widget-split-screen">分屏</div>
</template>

<script lang="ts">
import { Mixins, Component } from 'vue-property-decorator'
import { WidgetMixin } from '@mapgis/web-app-framework'

@Component({ name: 'MpSplitScreen' })
export default class MpSplitScreen extends Mixins(WidgetMixin) {}
</script>

<style lang="less" scoped></style>
