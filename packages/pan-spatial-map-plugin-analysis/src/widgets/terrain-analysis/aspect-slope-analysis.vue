<template>
  <mapgis-3d-aspect-slope
    id='aspect-slope-analysis'
    @loaded="load" />
</template>
<script lang="ts">
import { Component, Mixins } from 'vue-property-decorator'
import { WidgetMixin } from '@mapgis/web-app-framework'

@Component({
  name: 'MpAspectSlope'
})
export default class MpAspectSlope extends Mixins(WidgetMixin) {

  load(aspectSlope) {
    this.aspectSlope = aspectSlope
  }

  onActive() {
    this.aspectSlope.mount()
  }

  // 微件失活时
  onDeActive() {
    this.aspectSlope.unmount()
  }

  // 微件窗口模式切换时回调
  onWindowSize(mode) {
    this.isFullScreen = mode === 'max'
    this.$nextTick(() => {
      const el = document.getElementById('aspect-slope-analysis')
      if (el) {
        el.style.width = `${mode === 'max' ? this.$el.clientWidth : 300}px`
      }
    })
  }
}
</script>
<style lang='less'>
#aspect-slope-analysis {
  width: 300px;
  max-width: 100%;
}
</style>
