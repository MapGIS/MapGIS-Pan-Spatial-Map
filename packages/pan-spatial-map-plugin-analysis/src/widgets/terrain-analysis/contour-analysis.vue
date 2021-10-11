<template>
  <mapgis-3d-analysis-contour
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
}
</script>
