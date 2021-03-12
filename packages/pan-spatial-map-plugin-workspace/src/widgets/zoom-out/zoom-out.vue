<template>
  <div class="mp-widget-zoom-out" :widget="widget" @click="onClickWidget">
    放大
  </div>
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

<style lang="less"></style>
