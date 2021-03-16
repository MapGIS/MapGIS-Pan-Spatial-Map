<template>
  <mp-map-widget-button
    class="mp-widget-zoom-in"
    :widget="widget"
    @click="onClickWidget"
  />
</template>

<script>
import { WidgetMixin } from '@mapgis/web-app-framework'

export default {
  name: 'MpZoomIn',
  mixins: [WidgetMixin],
  methods: {
    onClickWidget() {
      if (this.map) {
        this.map.zoomIn()
      }
    }
  }
}
</script>

<style lang="less" scoped></style>
