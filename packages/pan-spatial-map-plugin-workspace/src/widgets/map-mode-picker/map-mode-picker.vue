<template>
  <mp-map-widget-button
    class="mp-widget-map-mode-picker"
    :widget="widget"
    @click="switchMapMode"
  />
</template>

<script lang="ts">
import { Mixins, Component } from 'vue-property-decorator'
import { WidgetMixin } from '@mapgis/web-app-framework'

@Component({ name: 'MpMapModePicker' })
export default class MpMapModePicker extends Mixins(WidgetMixin) {}
</script>

<style lang="less" scoped></style>
