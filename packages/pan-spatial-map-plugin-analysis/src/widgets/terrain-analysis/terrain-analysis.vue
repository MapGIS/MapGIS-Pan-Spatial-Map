<template>
  <div class="mp-widget-terrain-analysis">
    <a-tabs size="small" :default-active-key="tab">
      <a-tab-pane key="slope" tab="坡度分析">
        <MpSlopeAnalysis />
      </a-tab-pane>
      <a-tab-pane key="aspect" tab="坡向分析">
        <MpAspectAnalysis />
      </a-tab-pane>
      <a-tab-pane key="flooding" tab="洪水淹没">
        <MpFlooding />
      </a-tab-pane>
      <a-tab-pane key="fillAndDig" tab="填挖方分析">
        <MpCutFillAnalysis />
      </a-tab-pane>
    </a-tabs>
  </div>
</template>

<script lang="ts">
import { Mixins, Component } from 'vue-property-decorator'
import { WidgetMixin } from '@mapgis/web-app-framework'
import MpSlopeAnalysis from './slope-analysis.vue'
import MpAspectAnalysis from './aspect-analysis.vue'
import MpFlooding from './flooding.vue'
import MpCutFillAnalysis from './cut-fill-analysis.vue'

@Component({
  name: 'MpTerrainAnalysis',
  components: {
    MpSlopeAnalysis,
    MpAspectAnalysis,
    MpFlooding,
    MpCutFillAnalysis
  }
})
export default class MpTerrainAnalysis extends Mixins(WidgetMixin) {
  private tab = 'slope'
}
</script>

<style lang="less">
.mp-widget-terrain-analysis {
  flex: 1 1 0%;
  max-width: 350px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}
</style>
