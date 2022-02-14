<template>
  <div class="mp-widget-terrain-analysis">
    <div class="terrain-analysis-types">
      <div v-for="type in analysis" :key="type.key" class="analysis-type">
        <img
          :src="typeImage(type.image)"
          :class="['analysis-type-img', type.key === tab ? 'active-type' : '']"
          @click="changeTab(type.key)"
        />
        <div class="analysis-type-text">{{ type.title }}</div>
      </div>
    </div>
    <MpAspectSlope v-show="tab === 'aspectSlope'" ref="aspectSlopeAnalysis" />
    <MpContourAnalysis v-show="tab === 'contour'" ref="contourAnalysis" />
    <MpFlooding v-show="tab === 'flooding'" ref="floodingAnalysis" />
    <MpCutFillAnalysis v-show="tab === 'cut-fill'" ref="cutFillAnalysis" />
  </div>
</template>

<script lang="ts">
import { Mixins, Component } from 'vue-property-decorator'
import { WidgetMixin } from '@mapgis/web-app-framework'
import MpAspectSlope from './aspect-slope-analysis.vue'
import MpFlooding from './flooding.vue'
import MpCutFillAnalysis from './cut-fill-analysis.vue'
import MpContourAnalysis from './contour-analysis.vue'

@Component({
  name: 'MpTerrainAnalysis',
  components: {
    MpAspectSlope,
    MpFlooding,
    MpCutFillAnalysis,
    MpContourAnalysis
  }
})
export default class MpTerrainAnalysis extends Mixins(WidgetMixin) {
  private tab = 'aspectSlope'

  private preTab = 'aspectSlope'

  private analysis = [
    {
      title: '坡向坡度',
      key: 'aspectSlope',
      image: 'aspect.png'
    },
    {
      title: '等值线',
      key: 'contour',
      image: 'contour.png'
    },
    {
      title: '淹没',
      key: 'flooding',
      image: 'flooding.png'
    },
    {
      title: '填挖方',
      key: 'cut-fill',
      image: 'cut-fill.png'
    }
  ]

  // 获取当前面板对应的组件
  get currentAnalysisComponent() {
    return this.getAnalysisComponent(this.tab)
  }

  get typeImage() {
    return function(image) {
      return `${this.appAssetsUrl}${this.widgetInfo.uri}/images/${image}`
    }
  }

  getAnalysisComponent(tab: string) {
    if (tab == 'aspectSlope') {
      return this.$refs.aspectSlopeAnalysis
    } else if (tab == 'contour') {
      return this.$refs.contourAnalysis
    } else if (tab == 'flooding') {
      return this.$refs.floodingAnalysis
    } else if (tab == 'cut-fill') {
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
    if (this.currentAnalysisComponent) {
      this.currentAnalysisComponent.onActive()
    }
  }

  // 微件打开时
  onOpen() {
    this.currentAnalysisComponent.onActive()
  }

  // 微件激活时
  onActive() {
    this.currentAnalysisComponent.onActive()
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
  .terrain-analysis-types {
    display: flex;
    flex-wrap: wrap;
    justify-content: space-between;
    .analysis-type {
      .analysis-type-img {
        height: 48px;
        width: 48px;
        border-radius: 4px;
        padding: 6px;
        cursor: pointer;
        &.active-type,
        &:hover {
          box-shadow: 0 0 0 2px @primary-color;
        }
      }
      .analysis-type-text {
        width: 100%;
        margin-top: 4px;
        font-size: 12px;
        line-height: 18px;
        color: @text-color;
        text-align: center;
      }
    }
  }
}
</style>
