<template>
  <div class="mp-widget-zoom">
    <a-tooltip title="放大" placement="right" :overlay-style="{ zIndex: 1000 }">
      <div class="zoom-in button" @click="onZoomIn">
        <a-icon type="plus" />
      </div>
    </a-tooltip>
    <a-tooltip title="缩小" placement="right" :overlay-style="{ zIndex: 1000 }">
      <div class="zoom-out button" @click="onZoomOut">
        <a-icon type="minus" />
      </div>
    </a-tooltip>
  </div>
</template>

<script lang="ts">
import { Mixins, Component } from 'vue-property-decorator'
import { WidgetMixin } from '@mapgis/web-app-framework'

@Component({ name: 'MpZoom' })
export default class MpZoom extends Mixins(WidgetMixin) {
  onZoomIn() {
    if (this.map) {
      this.map.zoomIn()
    }
  }

  onZoomOut() {
    if (this.map) {
      this.map.zoomOut()
    }
  }
}
</script>

<style lang="less" scoped>
.mp-widget-zoom {
  background: @base-bg-color;
  border-radius: 2px;
  line-height: 32px;
  font-size: 16px;
  box-shadow: 0px 1px 2px 0px @shadow-color;
  color: @text-color;
  text-align: center;
  .button {
    width: 32px;
    height: 32px;
    cursor: pointer;
    &:hover {
      color: @primary-color;
    }
  }
  .zoom-in {
    border-bottom: 1px solid @border-color;
  }
}
</style>
