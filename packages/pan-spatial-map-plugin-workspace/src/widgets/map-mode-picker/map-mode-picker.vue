<template>
  <div
    class="mp-widget-map-mode-picker"
    :widget="widget"
    @click="switchMapMode"
  >
    二三维模式切换
  </div>
</template>

<script>
import { WidgetMixin } from '@mapgis/web-app-framework'

export default {
  name: 'MpMapModePicker',
  mixins: [WidgetMixin]
}
</script>

<style lang="less"></style>
