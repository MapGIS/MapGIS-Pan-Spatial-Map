<template>
  <mp-map-widget-button
    class="mp-widget-map-mode-picker"
    :widget="widget"
    @click="switchMapMode"
  />
</template>

<script>
import { WidgetMixin } from '@mapgis/web-app-framework'

export default {
  name: 'MpMapModePicker',
  mixins: [WidgetMixin]
}
</script>

<style lang="less" scoped></style>
