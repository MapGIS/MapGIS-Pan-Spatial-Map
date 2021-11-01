<template>
  <div class="mp-widget-skyline-analysis">
    <mp-setting-form :wrapper-width="200">
      <a-form-item label="观察者信息">
        <a-input
          :value="centerPosition"
          :disabled="true"
          placeholder="经度，纬度，高程"
        />
      </a-form-item>
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
      <a-button type="primary" @click="add">天际线</a-button>
      <a-button @click="showAnalysis2d">二维天际线</a-button>
      <a-button @click="remove">清除</a-button>
    </div>
    <div class="skyline-analysis-mask" v-show="!!loading" />
    <!-- 二维天际线 -->
    <mp-window-wrapper :visible="skyline2dVisible">
      <mp-window
        @window-size="onSkyline2dWindowSize"
        :visible.sync="skyline2dVisible"
        :min-width="800"
        :max-height="250"
        anchor="bottom-center"
        title="二维天际线"
        :style="{ background: `${skylineWindowBackground}` }"
      >
        <div ref="skyline2dChart">
          <div id="skyline-2d-chart" />
        </div>
      </mp-window>
    </mp-window-wrapper>
  </div>
</template>
<script lang="ts">
import { Vue, Component, Mixins, Watch } from 'vue-property-decorator'
import { WidgetMixin, Objects, ColorUtil } from '@mapgis/web-app-framework'
import * as echarts from 'echarts'
import _cloneDeep from 'lodash/cloneDeep'
import chartOptions from './config/skyline2dChartOptions'

@Component({
  name: 'MpSkylineAnalysis'
})
export default class MpSkylineAnalysis extends Mixins(WidgetMixin) {
  private formData = {
    skylineWidth: 2,
    skylineColor: 'rgb(255,0,0)'
  }

  private loading = null

  private centerPosition = ''

  private skyline2dVisible = false

  private skyline2dChart = null

  private positions2D: Array<{ x: number; y: number }> = []

  private isLogarithmicDepthBufferEnable = false

  private skylineWindowBackground = 'rgba(20,20,20,0.6)'

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

  created() {
    window.skylineAnalysis = null
  }

  mounted() {
    this.skyline2dChart = echarts.init(
      document.getElementById('skyline-2d-chart')
    )
  }

  // 微件关闭时
  onClose() {
    this.remove()

    if (
      this.isLogarithmicDepthBufferEnable !==
      this.sceneControllerInstance.isLogarithmicDepthBufferEnable()
    ) {
      this.sceneControllerInstance.setLogarithmicDepthBufferEnable(
        this.isLogarithmicDepthBufferEnable
      )
    }
  }

  onOpen() {
    // 修改说明：在鲲鹏机器，UOS系统的firefox浏览器，使用天际线分析功能，点击后直接报错。三维部门建议在鲲鹏机器上关闭该缓存区。
    // 修改人：马原野 2021年8月21日
    this.isLogarithmicDepthBufferEnable = this.sceneControllerInstance.isLogarithmicDepthBufferEnable()
    if (
      navigator.userAgent.indexOf('Linux') > 0 &&
      navigator.userAgent.indexOf('Firefox') > 0
    ) {
      this.sceneControllerInstance.setLogarithmicDepthBufferEnable(false)
    } else {
      // 其他浏览器还是设置为true，不然会导致分析结果不正确，cesium1.8版本已不需要再额外设置
      this.sceneControllerInstance.setLogarithmicDepthBufferEnable(true)
    }
    this.changeSkylineWindowApha()
  }

  // 微件失活时
  // onDeActive() {
  // this.remove()
  // }

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
  }

  changeSkylineWindowApha() {
    const components = document.getElementsByClassName('mp-window-wrapper')[0]
    const bgColor = document.defaultView.getComputedStyle(components, null)[
      'background-color'
    ]
    const colorObject = ColorUtil.getColorObject(bgColor, 0.6)
    const { r, g, b, a } = colorObject

    this.skylineWindowBackground = `rgba(${r},${g},${b},${a})`
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
    const { w, h } = this.sceneControllerInstance.getWebGlobeCanvasSize()
    return this.positions2D.reduce(
      ({ x, y }, v) => {
        x.push((1 - v.x / w).toFixed(8))
        y.push((1 - v.y / h).toFixed(8))
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
   * todo 绘制完成回调添加二维坐标点 #143
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
    this.positions2D = []
  }

  /**
   * 打开分析提示遮罩层
   */
  showLoading() {
    if (!this.loading) {
      this.loading = this.$portal.show(
        {
          tip: '正在分析中，请稍等'
        },
        document.querySelector('.mp-map-container')
      )
    }
  }

  /**
   * 移除分析提示遮罩层
   */
  removeLoading() {
    if (this.loading) {
      this.loading = null
      this.$portal.remove()
    }
  }

  /**
   * 分析结束
   * @param positions2D 二维坐标点
   * @param positions3D 三维坐标点
   */
  analysisEndCallBack({ positions2D = [], positions3D }) {
    this.positions2D = positions2D.length ? _cloneDeep(positions2D) : []
    this.removeLoading()
  }

  add() {
    try {
      this.remove()
      this.showLoading()
      // 初始化高级分析功能管理类
      const advancedAnalysisManager = new this.CesiumZondy.Manager.AdvancedAnalysisManager(
        {
          viewer: this.webGlobe.viewer
        }
      )
      // 创建天际线实例
      const skylineAnalysis = advancedAnalysisManager.createSkyLine()
      skylineAnalysis._analysisEndCallBack = this.analysisEndCallBack
      skylineAnalysis.color = this.edgeColor
      skylineAnalysis.lineWidth = this.formData.skylineWidth
      window.skylineAnalysis = skylineAnalysis
      this.setCenterPosition()
    } catch (e) {
      console.error(e)
      this.removeLoading()
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
    }
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

#skyline-2d-chart {
  width: 800px;
  height: 180px;
}

.mp-widget-skyline-analysis {
  display: flex;
  flex-direction: column;
  position: relative;

  .skyline-analysis-mask {
    position: absolute;
    left: 0;
    top: 0;
    width: 100%;
    height: 100%;
    background: fade(@white, 40%);
    z-index: 2;
  }
}
</style>
