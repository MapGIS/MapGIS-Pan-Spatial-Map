<template>
  <div class="mp-widget-about">关于</div>
</template>

<script lang="ts">
import { Mixins, Component } from 'vue-property-decorator'
import { WidgetMixin } from '@mapgis/web-app-framework'

@Component({ name: 'MpAbout' })
export default class MpAbout extends Mixins(WidgetMixin) {}
</script>

<style lang="less" scoped></style>
