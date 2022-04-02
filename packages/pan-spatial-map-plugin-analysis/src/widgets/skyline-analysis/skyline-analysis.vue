<template>
  <div class="mp-widget-skyline-analysis">
    <mapgis-3d-skyline
      :skylineWidth="skylineWidth"
      :skylineColor="skylineColor"
      @load="load"
      @remove="remove"
      @showAnalysis2d="showAnalysis2d"
    >
    </mapgis-3d-skyline>
    <!-- 二维天际线 -->
    <mp-window-wrapper :visible="skyline2dVisible">
      <mapgis-ui-window
        @window-size="onSkyline2dWindowSize"
        :visible.sync="skyline2dVisible"
        :min-width="800"
        :max-height="250"
        anchor="bottom-center"
        title="二维天际线"
        ref="skylineWindow"
      >
        <div ref="skyline2dChart">
          <div id="skyline-2d-chart" />
        </div>
      </mapgis-ui-window>
    </mp-window-wrapper>
  </div>
</template>
<script lang="ts">
import { Component, Mixins } from 'vue-property-decorator'
import { WidgetMixin } from '@mapgis/web-app-framework'
import { Util } from '@mapgis/webclient-vue-ui'

const { ColorUtil } = Util

@Component({
  name: 'MpSkylineAnalysis'
})
export default class MpSkylineAnalysis extends Mixins(WidgetMixin) {
  // 天际线分析结果宽度
  private skylineWidth = 2

  // 天际线分析结果颜色
  private skylineColor = 'rgb(255,0,0)'

  // 二维天际线图表显示
  private skyline2dVisible = false

  // 天际线分析二维图表
  private skyline2dChart = null

  // 天际线分析对象
  private skyLineAnalysis = null

  onClose() {
    this.skyLineAnalysis.unmount()

    this.hideAnalysis2d()
  }

  onOpen() {
    this.skyLineAnalysis.mount()
    this.changeSkylineWindowApha()
  }

  remove() {
    this.hideAnalysis2d()
  }

  load(skyLineAnalysis) {
    this.skyLineAnalysis = skyLineAnalysis
  }

  /**
   * 二维天际线图表弹框size变化
   * @param mode
   */
  onSkyline2dWindowSize(mode?: 'max' | 'normal') {
    this.$nextTick(() => {
      if (this.skyline2dChart) {
        const width =
          mode === 'max' ? this.$refs.skyline2dChart.clientWidth : 800
        this.skyline2dChart.resize({ width })
      }
    })
    this.changeSkylineWindowApha()
  }

  changeSkylineWindowApha() {
    const components = document.getElementsByClassName('mp-window-wrapper')[0]
    const bgColor = document.defaultView.getComputedStyle(components, null)[
      'background-color'
    ]
    const colorObject = ColorUtil.getColorObject(bgColor, 0.6)
    const { r, g, b, a } = colorObject
    const component = this.$refs.skylineWindow

    component.style.background = `rgba(${r},${g},${b},${a})`
  }

  /**
   * 展示二维天际线
   * todo 绘制完成回调添加二维坐标点 #143
   */
  showAnalysis2d(skyline2dChart) {
    this.skyline2dVisible = true
    this.skyline2dChart = skyline2dChart
  }

  /**
   * 隐藏二维天际线
   */
  hideAnalysis2d() {
    this.skyline2dVisible = false
  }
}
</script>

<style lang="less" scoped>
#skyline-2d-chart {
  width: 800px;
  height: 180px;
}
</style>
