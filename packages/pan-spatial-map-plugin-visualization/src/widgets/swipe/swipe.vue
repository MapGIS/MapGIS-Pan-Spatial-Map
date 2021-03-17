<template>
  <div class="mp-widget-swipe">卷帘</div>
</template>

<script lang="ts">
import { Mixins, Component } from 'vue-property-decorator'
import { WidgetMixin } from '@mapgis/web-app-framework'

@Component({ name: 'MpSwipe' })
export default class MpSwipe extends Mixins(WidgetMixin) {}
</script>

<style lang="less" scoped></style>
