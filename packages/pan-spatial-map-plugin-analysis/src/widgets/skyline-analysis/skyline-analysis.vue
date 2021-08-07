<template>
  <div class="mp-widget-skyline-analysis">
    <mp-row-flex :span="[24, 24]" :colon="false" label="观察者信息">
      <a-input
        :value="centerPosition"
        :disabled="true"
        placeholder="经度，纬度，线高程"
      />
    </mp-row-flex>
    <mp-setting-form :label-width="44" wrapper-width="auto">
      <a-form-item label="线宽度">
        <a-input-number v-model="formData.skylineWidth" :min="0" />
      </a-form-item>
      <a-form-item label="线颜色">
        <MpColorPicker
          :color.sync="formData.skylineColor"
          :disableAlpha="true"
        ></MpColorPicker>
      </a-form-item>
    </mp-setting-form>
    <div class="mp-footer-actions center">
      <a-button type="primary" @click="add">
        天际线
      </a-button>
      <a-button @click="showAnalysis2d">
        二维天际线
      </a-button>
      <a-button @click="remove">
        清除
      </a-button>
    </div>
    <!-- 二维天际线 -->
    <mp-window-wrapper :visible="skyline2dVisible">
      <mp-window
        @window-size="onSkyline2dWindowSize"
        :visible.sync="skyline2dVisible"
        :horizontalOffset="12"
        :verticalOffset="50"
        :min-width="300"
        :max-height="300"
        title="二维天际线"
      >
        <a-empty v-show="!positions2D.length" />
        <div id="skyline-2d-chart" v-show="positions2D.length" />
      </mp-window>
    </mp-window-wrapper>
  </div>
</template>
<script lang="ts">
import { Vue, Component, Mixins } from 'vue-property-decorator'
import { WidgetMixin, Objects } from '@mapgis/web-app-framework'
import * as echarts from 'echarts'
import chartOptions from './config/skyline2dChartOptions'

@Component({
  name: 'MpSkylineAnalysis'
})
export default class MpSkylineAnalysis extends Mixins(WidgetMixin) {
  private formData = {
    skylineWidth: 2,
    skylineColor: 'rgb(255,0,0)'
  }

  private loadingPortal = null

  private centerPosition = ''

  private skyline2dVisible = false

  private skyline2dChart = null

  get sceneControllerInstance() {
    return Objects.SceneController.getInstance(
      this.Cesium,
      this.CesiumZondy,
      this.webGlobe
    )
  }

  get edgeColor() {
    return this.sceneControllerInstance.colorToCesiumColor(
      this.formData.skylineColor
    )
  }

  get positions2D(): Array<{ x: number; y: number }> {
    return window.skylineAnalysis?.positions2D || []
  }

  created() {
    window.skylineAnalysis = null
  }

  // 微件关闭时
  onClose() {
    this.remove()
  }

  // 微件失活时
  onDeActive() {
    this.remove()
  }

  /**
   * 二维天际线图表弹框size变化
   * @param mode
   */
  onSkyline2dWindowSize(mode?: 'max' | 'normal') {
    this.$nextTick(() => {
      if (this.chart) {
        const width =
          mode === 'max' ? this.$refs.statisticGraph.clientWidth : 500
        this.chart.resize({ width })
      }
    })
  }

  /**
   * 设置观察者位置
   */
  setCenterPosition() {
    const position = this.sceneControllerInstance.getCenterPosition()
    if (position) {
      const { lng, lat, height } = position
      const lngStr = `${lng.toFixed(4)}°`
      const latStr = `${lat.toFixed(4)}°`
      const heightStr = `${height.toFixed(2)}m`
      this.centerPosition = `${lngStr}，${latStr}，${heightStr}`
    }
  }

  /**
   * 获取二维天际线图表的xy轴信息
   */
  getChartOptions() {
    return this.positions2D.reduce(
      ({ x, y }, v) => {
        x.push(v.x)
        y.push(v.y)
        return {
          x,
          y
        }
      },
      {
        x: [],
        y: []
      }
    )
  }

  /**
   * 展示二维天际线
   */
  showAnalysis2d() {
    if (!this.positions2D.length) {
      this.$message.warning('请先进行天际线分析')
    } else {
      this.skyline2dVisible = true
      this.skyline2dChart.clear()
      this.skyline2dChart.showLoading()
      this.skyline2dChart.setOption(chartOptions(this.getChartOptions()))
      this.skyline2dChart.resize()
      this.skyline2dChart.hideLoading()
    }
  }

  /**
   * 隐藏二维天际线
   */
  hideAnalysis2d() {
    this.skyline2dVisible = false
  }

  /**
   * 展示加载遮罩层
   */
  showLoadingPortal() {
    if (!this.loadingPortal) {
      this.loadingPortal = this.$portal.show(
        {
          tip: '正在分析中，请稍等'
        },
        document.querySelector('.mp-map-container')
      )
    }
  }

  /**
   * 隐藏加载遮罩层
   */
  hideLoadingPortal() {
    if (this.loadingPortal) {
      this.loadingPortal.remove()
      this.loadingPortal = null
    }
  }

  add() {
    try {
      this.remove()
      // this.showLoadingPortal()
      // 初始化高级分析功能管理类
      const advancedAnalysisManager = new this.CesiumZondy.Manager.AdvancedAnalysisManager(
        {
          viewer: this.webGlobe.viewer
        }
      )
      // 创建天际线实例
      const skylineAnalysis = advancedAnalysisManager.createSkyLine({})
      skylineAnalysis.color = this.edgeColor
      skylineAnalysis.lineWidth = this.formData.skylineWidth
      window.skylineAnalysis = skylineAnalysis
      this.setCenterPosition()
    } catch (e) {
      console.error(e)
    } finally {
      // this.hideLoadingPortal()
    }
  }

  remove() {
    // 判断是否已有天际线分析结果
    if (window.skylineAnalysis) {
      // 移除天际线分析显示结果
      window.skylineAnalysis.destroy()
      window.skylineAnalysis = null
      this.centerPosition = ''
      this.hideAnalysis2d()
      // this.hideLoadingPortal()
    }
  }

  mounted() {
    this.skyline2dChart = echarts.init(
      document.getElementById('skyline-2d-chart')
    )
  }
}
</script>

<style lang="less" scoped>
@import '../index.less';

::v-deep {
  .ant-row-flex {
    margin-bottom: 12px;
    .row-flex-col-left {
      margin-bottom: 2px;
    }
  }
  .ant-input-number {
    width: 100%;
  }
  .ant-input-disabled {
    color: fade(@text-color, 40%);
    background: transparent;
  }
}

.mp-widget-skyline-analysis {
  display: flex;
  flex-direction: column;
}
</style>
