<template>
  <mapgis-3d-analysis-slope
    id='slope-analysis'
    :rampColors="rampColors"
    @load="load" />
</template>
<script lang="ts">
import { Component, Mixins } from 'vue-property-decorator'
import { WidgetMixin } from '@mapgis/web-app-framework'

@Component({
  name: 'MpSlopeAnalysis'
})
export default class MpSlopeAnalysis extends Mixins(WidgetMixin) {
  private rampColors = [
    { min: 0, max: 15, color: 'rgba(244, 67, 54, 0.5)' },
    { min: 15, max: 30, color: 'rgba(233, 30, 99, 0.5)' },
    { min: 30, max: 45, color: 'rgba(156, 39, 176, 0.5)' },
    { min: 45, max: 60, color: 'rgba(255, 235, 59, 0.5)' },
    { min: 60, max: 75, color: 'rgba(96, 125, 139, 0.5)' },
    { min: 75, max: 90, color: 'rgba(76, 175, 80, 0.5)' }
  ]

  private slopeAnalysis = null

  load(slopeAnalysis) {
    this.slopeAnalysis = slopeAnalysis
  }

  onActive() {
    this.slopeAnalysis.mount()
  }

  // 微件失活时
  onDeActive() {
    this.slopeAnalysis.unmount()
  }

  // 微件窗口模式切换时回调
  onWindowSize(mode) {
    this.isFullScreen = mode === 'max'
    this.$nextTick(() => {
      const el = document.getElementById('slope-analysis')
      if (el) {
        el.style.width = `${mode === 'max' ? this.$el.clientWidth : 300}px`
      }
    })
  }
}
</script>
<style lang='less'>
#slope-analysis {
  width: 300px;
  max-width: 100%;
}
</style>
