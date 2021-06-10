<template>
  <div class="mp-widget-terrain-analysis">
    <a-tabs size="small" :default-active-key="tab" @change="changeTab">
      <a-tab-pane key="slope" tab="坡度分析">
        <MpSlopeAnalysis ref="slopeAnalysis" />
      </a-tab-pane>
      <a-tab-pane key="aspect" tab="坡向分析">
        <MpAspectAnalysis ref="aspectAnalysis" />
      </a-tab-pane>
      <a-tab-pane key="flooding" tab="洪水淹没">
        <MpFlooding ref="flooding" />
      </a-tab-pane>
      <a-tab-pane key="fillAndDig" tab="填挖方分析">
        <MpCutFillAnalysis ref="cutFillAnalysis" />
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

  private preTab = 'slope'

  // 获取当前面板对应的组件
  get currentAnalysisComponent() {
    return this.getAnalysisComponent(this.tab)
  }

  getAnalysisComponent(tab: string) {
    if (tab == 'slope') {
      return this.$refs.slopeAnalysis
    } else if (tab == 'aspect') {
      return this.$refs.aspectAnalysis
    } else if (tab == 'flooding') {
      return this.$refs.flooding
    } else if (tab == 'fillAndDig') {
      return this.$refs.cutFillAnalysis
    }
    return null
  }

  // 切换面板
  changeTab(activeKey: string) {
    this.tab = activeKey
    if (this.preTab !== this.tab) {
      const preAnalysisComponent = this.getAnalysisComponent(this.preTab)
      preAnalysisComponent.onDeActive()
      this.preTab = this.tab
    }
  }

  // 微件关闭时
  onClose() {
    this.currentAnalysisComponent.onDeActive()
  }

  // 微件失活时
  onDeActive() {
    this.currentAnalysisComponent.onDeActive()
  }
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
