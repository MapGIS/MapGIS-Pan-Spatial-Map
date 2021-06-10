<template>
  <div class="mp-widget-visual-analysis">
    <div class="visual-panel">
      <a-form-model v-model="formData">
        <a-form-model-item label="方位角">
          <a-input v-model="formData.azimuthAngle" />
        </a-form-model-item>
        <a-form-model-item label="水平夹角">
          <a-input v-model="formData.horizontAngle" />
        </a-form-model-item>
        <a-form-model-item label="俯仰角">
          <a-input v-model="formData.pitchAngle" />
        </a-form-model-item>
        <a-form-model-item label="垂直夹角">
          <a-input v-model="formData.verticalAngle" />
        </a-form-model-item>
        <a-form-model-item label="不可视区域颜色">
          <ColorPicker :color.sync="formData.unVisibleColor"></ColorPicker>
        </a-form-model-item>
        <a-form-model-item label="可视区域颜色">
          <ColorPicker :color.sync="formData.visibleColor"></ColorPicker>
        </a-form-model-item>
        <a-form-model-item label="可视遮罩颜色">
          <ColorPicker :color.sync="formData.maskColor"></ColorPicker>
        </a-form-model-item>
      </a-form-model>
    </div>
    <div class="visual-footer">
      <a-button type="primary" @click="onClickStart">开始分析</a-button>
      <a-button type="primary" @click="onClickStop">结束分析</a-button>
    </div>
  </div>
</template>

<script lang="ts">
import { Mixins, Component } from 'vue-property-decorator'
import { WidgetMixin } from '@mapgis/web-app-framework'
import ColorPicker from './color-picker'

@Component({
  name: 'MpVisualAnalysis',
  components: { ColorPicker }
})
export default class MpVisualAnalysis extends Mixins(WidgetMixin) {
  // 表单数据
  private formData = {
    azimuthAngle: 0,
    horizontAngle: 60,
    pitchAngle: 0,
    verticalAngle: 60,
    unVisibleColor: '#ff0000',
    visibleColor: '#00ff00',
    maskColor: '#4feed7'
  }

  // 是否为鼠标注册了监听事件
  private isAddEventListener = false

  // 是否已选择观察点位置
  private hasViewPosition = false

  // 是否可以进行可视域分析
  private isAnalyze = false

  created() {
    this.initData()
  }

  // 初始化各项数据
  private initData() {
    window.VisualAnalysisManage = {
      visualAnalysis: null
    }
  }

  // 点击开始分析按钮回调
  private onClickStart() {
    this.isAnalyze = true
    this.webGlobe.viewer.scene.globe.depthTestAgainstTerrain = true
    // 初始化分析工具
    window.VisualAnalysisManage.visualAnalysis = new this.Cesium.ViewshedAnalysis()

    this.addEventListener()

    // 设置可视域分析工具的配置
    const unVisibleColor = new this.Cesium.Color.fromCssColorString(
      this.formData.unVisibleColor
    )
    const visibleColor = new this.Cesium.Color.fromCssColorString(
      this.formData.visibleColor
    )
    const maskColor = new this.Cesium.Color.fromCssColorString(
      this.formData.maskColor
    )

    window.VisualAnalysisManage.visualAnalysis.azimuthAngle = this.formData.azimuthAngle
    window.VisualAnalysisManage.visualAnalysis.horizontAngle = this.formData.horizontAngle
    window.VisualAnalysisManage.visualAnalysis.pitchAngle = this.formData.pitchAngle
    window.VisualAnalysisManage.visualAnalysis.verticalAngle = this.formData.verticalAngle
    window.VisualAnalysisManage.visualAnalysis._unVisibleColor = unVisibleColor
    window.VisualAnalysisManage.visualAnalysis._visibleColor = visibleColor
    window.VisualAnalysisManage.visualAnalysis._fanColor = maskColor
    // 遮罩层透明度特殊些，单独设置为0.2
    window.VisualAnalysisManage.visualAnalysis._fanColor.alpha = 0.2

    // 添加可视域分析结果显示
    this.webGlobe.viewer.scene.VisualAnalysisManager.add(
      window.VisualAnalysisManage.visualAnalysis
    )
  }

  // 点击结束分析按钮回调
  private onClickStop() {
    // 注销鼠标的各项监听事件
    this.webGlobe.unRegisterMouseEvent('MOUSE_MOVE')
    this.webGlobe.unRegisterMouseEvent('LEFT_CLICK')
    this.webGlobe.unRegisterMouseEvent('RIGHT_CLICK')

    // 移除可视域分析工具
    window.VisualAnalysisManage.visualAnalysis = null

    // 移除可视域分析结果
    this.webGlobe.viewer.scene.VisualAnalysisManager._visualAnalysisList = []

    this.isAddEventListener = false
    this.isAnalyze = true
    this.webGlobe.viewer.scene.globe.depthTestAgainstTerrain = false
  }

  // 为鼠标的各种行为注册监听事件
  private addEventListener() {
    if (!this.isAddEventListener) {
      this.webGlobe.registerMouseEvent('MOUSE_MOVE', event => {
        this.registerMouseMoveEvent(event)
      })
      this.webGlobe.registerMouseEvent('LEFT_CLICK', event => {
        this.registerMouseLClickEvent(event)
      })
      this.webGlobe.registerMouseEvent('RIGHT_CLICK', event => {
        this.registerMouseRClickEvent(event)
      })

      this.isAddEventListener = true
    }
  }

  // 注册可视域分析鼠标移动事件
  private registerMouseMoveEvent(event) {
    if (this.hasViewPosition) {
      const cartesian = this.webGlobe.viewer.getCartesian3Position(
        event.endPosition
      )

      if (cartesian) {
        // 设置可视域结束点坐标
        window.VisualAnalysisManage.visualAnalysis.targetPosition = cartesian
      }
    }
  }

  // 注册可视域分析鼠标左键点击事件
  private registerMouseLClickEvent(event) {
    const cartesian = this.webGlobe.viewer.getCartesian3Position(event.position)

    if (this.isAnalyze) {
      if (!this.hasViewPosition && cartesian !== undefined) {
        // 若还未选择观察点
        // 先抬高观察点0.5m
        cartesian.z += 0.5

        // 设置可视域观察点坐标
        window.VisualAnalysisManage.visualAnalysis.viewPosition = cartesian

        this.hasViewPosition = true
      } else {
        // 已经选择了观察点，则这次是选择结束点

        // 设置可视域结束点坐标
        window.VisualAnalysisManage.visualAnalysis.targetPosition = cartesian

        this.hasViewPosition = false
        this.isAnalyze = false
      }
    }
  }

  // 注册可视域分析鼠标右键点击事件
  private registerMouseRClickEvent(event) {
    console.log('R——click')
    const cartesian = this.webGlobe.viewer.getCartesian3Position(event.position)

    if (this.hasViewPosition) {
      // 设置可视域结束点坐标
      window.VisualAnalysisManage.visualAnalysis.targetPosition = cartesian
    }

    this.hasViewPosition = false
    this.isAnalyze = false
  }
}
</script>

<style lang="less" scoped>
.visual-panel {
  .ant-form-item {
    margin-bottom: 8px;
  }

  ::v-deep .ant-form-item-label {
    line-height: 28px;
  }
}

.visual-footer {
  margin-top: 32px;
  display: flex;
  justify-content: space-between;
}
</style>
