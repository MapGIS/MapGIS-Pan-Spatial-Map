<template>
  <div class="mp-widget-measurement">测量</div>
</template>

<script lang="ts">
import { Mixins, Component } from 'vue-property-decorator'
import { WidgetMixin } from '@mapgis/web-app-framework'

@Component({ name: 'MpMeasurement' })
export default class MpMeasurement extends Mixins(WidgetMixin) {}
</script>

<style lang="less" scoped></style>
