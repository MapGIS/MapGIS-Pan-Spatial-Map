<template>
  <div class="mp-widget-visual-analysis">
    <div class="visual-panel">
      <mp-setting-form v-model="formData">
        <a-form-item label="水平视角">
          <a-input v-model.number="formData.horizontAngle" type="number" />
        </a-form-item>
        <a-form-item label="垂直视角">
          <a-input v-model.number="formData.verticalAngle" type="number" />
        </a-form-item>
        <a-form-item label="不可视区域颜色">
          <mp-color-picker
            :disableAlpha="false"
            :color="formData.unVisibleColor"
            @input="
              val =>
                (formData.unVisibleColor = `rgba(${val.rgba.r}, ${val.rgba.g}, ${val.rgba.b}, ${val.rgba.a})`)
            "
          ></mp-color-picker>
        </a-form-item>
        <a-form-item label="可视区域颜色">
          <mp-color-picker
            :disableAlpha="false"
            :color="formData.visibleColor"
            @input="
              val =>
                (formData.visibleColor = `rgba(${val.rgba.r}, ${val.rgba.g}, ${val.rgba.b}, ${val.rgba.a})`)
            "
          ></mp-color-picker>
        </a-form-item>
        <a-form-item label="可视遮罩颜色">
          <mp-color-picker
            :disableAlpha="false"
            :color="formData.maskColor"
            @input="
              val =>
                (formData.maskColor = `rgba(${val.rgba.r}, ${val.rgba.g}, ${val.rgba.b}, ${val.rgba.a})`)
            "
          ></mp-color-picker>
        </a-form-item>
      </mp-setting-form>
    </div>
    <div class="mp-footer-actions">
      <a-button type="primary" @click="onClickStart">分析</a-button>
      <a-button @click="onClickStop">清除</a-button>
    </div>
  </div>
</template>

<script lang="ts">
import { Mixins, Component, Watch } from 'vue-property-decorator'
import { WidgetMixin } from '@mapgis/web-app-framework'

@Component({
  name: 'MpVisualAnalysis'
})
export default class MpVisualAnalysis extends Mixins(WidgetMixin) {
  // 表单数据
  private formData = {
    horizontAngle: 60,
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

  @Watch('formData', { deep: true })
  onColorChange(newVal) {
    const unVisibleColor = new this.Cesium.Color.fromCssColorString(
      newVal.unVisibleColor
    )
    const visibleColor = new this.Cesium.Color.fromCssColorString(
      newVal.visibleColor
    )
    const maskColor = new this.Cesium.Color.fromCssColorString(newVal.maskColor)
    if (window.VisualAnalysisManage.visualAnalysis) {
      window.VisualAnalysisManage.visualAnalysis._unVisibleColor = unVisibleColor
      window.VisualAnalysisManage.visualAnalysis._visibleColor = visibleColor
      window.VisualAnalysisManage.visualAnalysis._fanColor = maskColor
    }
  }

  created() {
    this.initData()
  }

  onClose() {
    this.onClickStop()
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
    // 开启地形深度测试
    this.webGlobe.viewer.scene.globe.depthTestAgainstTerrain = true
    this.tilesetArray = this.webGlobe._m3dServerLayer
    // 初始化分析工具
    window.VisualAnalysisManage.visualAnalysis = new this.Cesium.ViewshedAnalysis()

    this.addEventListener()

    // 锁定图层帧数,只显示一个可视域结果
    for (let i = 0; i < this.tilesetArray.length; i++) {
      this.tilesetArray[i][0].debugFreezeFrame = true
    }

    // 移除可视域分析结果
    this.webGlobe.viewer.scene.VisualAnalysisManager._visualAnalysisList = []

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

    window.VisualAnalysisManage.visualAnalysis.horizontAngle = this.formData.horizontAngle
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

    for (let i = 0; i < (this.tilesetArray || []).length; i++) {
      this.tilesetArray[i][0].debugFreezeFrame = false
    }

    // 移除可视域分析工具
    window.VisualAnalysisManage.visualAnalysis = null

    // 移除可视域分析结果
    this.webGlobe.viewer.scene.VisualAnalysisManager._visualAnalysisList = []

    this.isAddEventListener = false
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
@import '../index.less';
</style>
