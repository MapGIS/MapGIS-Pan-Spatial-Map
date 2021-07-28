<template>
  <div class="mp-widget-visibility-analysis">
    <div class="visibility-panel">
      <mp-setting-form v-model="formData">
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
      </mp-setting-form>
    </div>
    <div class="mp-footer-actions">
      <a-button type="primary" @click="onClickView">视点</a-button>
      <a-button type="primary" @click="onClickTarget">
        目标点
      </a-button>
      <a-button @click="onClickStop">清除</a-button>
    </div>
  </div>
</template>

<script lang="ts">
import { Mixins, Component, Watch } from 'vue-property-decorator'
import { WidgetMixin } from '@mapgis/web-app-framework'

@Component({ name: 'MpVisibilityAnalysis' })
export default class MpVisibilityAnalysis extends Mixins(WidgetMixin) {
  private formData = {
    visibleColor: '#008000',
    unVisibleColor: '#ff0000'
  }

  // 是否为鼠标注册了监听事件
  private isAddEventListener = false

  // 是否已选择观察点位置
  private hasViewPosition = false

  // 观察点
  private viewPoint

  // 目标点
  private targetPoint

  @Watch('formData', { deep: true })
  onColorChange(newVal) {
    const unVisibleColor = new this.Cesium.Color.fromCssColorString(
      newVal.unVisibleColor
    )
    const visibleColor = new this.Cesium.Color.fromCssColorString(
      newVal.visibleColor
    )
    if (window.VisibilityAnalysisManage.visibility) {
      window.VisibilityAnalysisManage.visibility._unvisibleColor = unVisibleColor
      window.VisibilityAnalysisManage.visibility._visibleColor = visibleColor
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
    window.VisibilityAnalysisManage = {
      visibility: null
    }
  }

  // 点击“视点”按钮回调
  private onClickView() {
    this.hasViewPosition = false

    const unVisibleColor = new this.Cesium.Color.fromCssColorString(
      this.formData.unVisibleColor
    )
    const visibleColor = new this.Cesium.Color.fromCssColorString(
      this.formData.visibleColor
    )

    if (window.VisibilityAnalysisManage.visibility) {
      // 移除通视分析结果
      this.webGlobe.viewer.scene.VisualAnalysisManager.remove(
        window.VisibilityAnalysisManage.visibility
      )

      // 销毁通视分析类
      window.VisibilityAnalysisManage.visibility.destroy()
    }

    // 移除所有添加的观察点或目标点
    this.webGlobe.viewer.entities.removeAll()

    // 初始化高级分析功能管理类
    const advancedAnalysisManager = new window.CesiumZondy.Manager.AdvancedAnalysisManager(
      {
        viewer: this.webGlobe.viewer
      }
    )

    // 初始化通视分析类
    window.VisibilityAnalysisManage.visibility = advancedAnalysisManager.createVisibilityAnalysis()
    window.VisibilityAnalysisManage.visibility._unvisibleColor = unVisibleColor
    window.VisibilityAnalysisManage.visibility._visibleColor = visibleColor

    this.addEventListener()
  }

  // 点击“目标点”按钮回调
  private onClickTarget() {
    this.hasViewPosition = true
  }

  // 点击“结束分析”按钮回调
  private onClickStop() {
    // 注销鼠标的各项监听事件
    this.webGlobe.unRegisterMouseEvent('LEFT_CLICK')
    this.webGlobe.unRegisterMouseEvent('RIGHT_CLICK')

    this.webGlobe.viewer.entities.removeAll()

    if (window.VisibilityAnalysisManage.visibility) {
      // 移除通视分析结果
      this.webGlobe.viewer.scene.VisualAnalysisManager.remove(
        window.VisibilityAnalysisManage.visibility
      )

      // 销毁通视分析类
      window.VisibilityAnalysisManage.visibility.destroy()
    }

    this.isAddEventListener = false
  }

  // 为鼠标的各种行为注册监听事件
  private addEventListener() {
    if (!this.isAddEventListener) {
      this.webGlobe.registerMouseEvent('LEFT_CLICK', event => {
        this.registerMouseLClickEvent(event)
      })
      this.webGlobe.registerMouseEvent('RIGHT_CLICK', event => {
        this.registerMouseRClickEvent(event)
      })

      this.isAddEventListener = true
    }
  }

  // 注册通视分析鼠标左键点击事件
  private registerMouseLClickEvent(event) {
    const cartesian = this.webGlobe.viewer.getCartesian3Position(event.position)

    if (!this.hasViewPosition && cartesian !== undefined) {
      // 若还未选择观察点

      // 设置通视分析观察点坐标
      window.VisibilityAnalysisManage.visibility.viewPosition = cartesian

      // 添加观察点到地图
      this.addViewPoint(cartesian)
    } else {
      // 已经选择了观察点，则这次是选择结束点

      // 设置通视分析结束点坐标
      window.VisibilityAnalysisManage.visibility.targetPosition = cartesian

      // 添加目标点到地图
      this.addTargetPoint(cartesian)
    }
  }

  // 注册通视分析鼠标右键点击事件
  private registerMouseRClickEvent(event) {
    const cartesian = this.webGlobe.viewer.getCartesian3Position(event.position)

    if (this.hasViewPosition) {
      // 设置通视分析结束点坐标
      window.VisibilityAnalysisManage.visibility.targetPosition = cartesian

      // 添加目标点到地图
      this.addTargetPoint(cartesian)
    }
  }

  // 添加观察点到地图上
  private addViewPoint(cartesian) {
    this.removeViewPoint()

    this.viewPoint = this.webGlobe.viewer.entities.add({
      position: cartesian,
      point: {
        color: this.Cesium.Color.BLUE,
        pixelSize: 10
      }
    })
  }

  // 添加目标点到地图上
  private addTargetPoint(cartesian) {
    this.removeTargetPoint()

    this.targetPoint = this.webGlobe.viewer.entities.add({
      position: cartesian,
      point: {
        color: this.Cesium.Color.RED,
        pixelSize: 10
      }
    })
  }

  // 从地图上移除观察点
  private removeViewPoint() {
    if (this.viewPoint) this.webGlobe.viewer.entities.remove(this.viewPoint)
  }

  // 从地图上移除目标点
  private removeTargetPoint() {
    if (this.targetPoint) this.webGlobe.viewer.entities.remove(this.targetPoint)
  }
}
</script>

<style lang="less" scoped>
@import '../index.less';
</style>
