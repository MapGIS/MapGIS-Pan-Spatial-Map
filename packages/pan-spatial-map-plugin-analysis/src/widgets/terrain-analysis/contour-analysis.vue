<template>
  <mapgis-3d-analysis-contour
    id='contour-analysis'
    :contourSpacing="contourSpacing"
    :contourWidth="contourWidth"
    :contourColor="contourColor"
    @load="load"
  />
</template>
<script lang="ts">
import { Component, Mixins } from 'vue-property-decorator'
import { WidgetMixin } from '@mapgis/web-app-framework'

@Component({
  name: 'MpContourAnalysis'
})
export default class MpContourAnalysis extends Mixins(WidgetMixin) {
  private contourSpacing = 150

  private contourWidth = 2

  private contourColor = 'rgb(255,0,0)'

  private contourAnalysis = null

  load(contourAnalysis) {
    this.contourAnalysis = contourAnalysis
  }

  onActive() {
    this.contourAnalysis.mount()
  }

  // 微件失活时
  onDeActive() {
    this.contourAnalysis.unmount()
  }

  // 微件窗口模式切换时回调
  onWindowSize(mode) {
    this.isFullScreen = mode === 'max'
    this.$nextTick(() => {
      const el = document.getElementById('contour-analysis')
      if (el) {
        el.style.width = `${mode === 'max' ? this.$el.clientWidth : 300}px`
      }
    })
  }
}
</script>
<style lang='less'>
#contour-analysis {
  width: 300px;
  max-width: 100%;
}
</style>
