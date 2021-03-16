<template>
  <mp-map-widget-button
    class="mp-widget-zoom-out"
    :widget="widget"
    @click="onClickWidget"
  />
</template>

<script>
import { WidgetMixin } from '@mapgis/web-app-framework'

export default {
  name: 'MpZoomOut',
  mixins: [WidgetMixin],
  methods: {
    onClickWidget() {
      if (this.map) {
        this.map.zoomOut()
      }
    }
  }
}
</script>

<style lang="less" scoped></style>
