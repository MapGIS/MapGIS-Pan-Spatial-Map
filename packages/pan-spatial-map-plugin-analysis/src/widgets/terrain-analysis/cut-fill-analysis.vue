<template>
  <mapgis-3d-analysis-cut-fill
    :xPaneNum="xPaneNum"
    :yPaneNum="yPaneNum"
    :height="height"
    :lineColor="lineColor"
    :fillColor="fillColor"
    :dataType="dataType"
    @load="load"
  />
</template>
<script lang="ts">
import { Component, Mixins } from 'vue-property-decorator'
import { WidgetMixin } from '@mapgis/web-app-framework'

@Component({
  name: 'MpCutFillAnalysis',
  components: {}
})
export default class MpCutFillAnalysis extends Mixins(WidgetMixin) {
  private xPaneNum = 16

  private yPaneNum = 16

  private height = 2000

  private lineColor = 'rgba(0,255,0,1)'

  private fillColor = 'rgba(0,0,255,0.3)'

  private dataType = 2.0

  private cutFillAnalysis = null

  load(cutFillAnalysis) {
    this.cutFillAnalysis = cutFillAnalysis
  }

  onActive() {
    this.cutFillAnalysis.mount()
  }

  // 微件失活时
  onDeActive() {
    this.cutFillAnalysis.unmount()
  }
}
</script>
