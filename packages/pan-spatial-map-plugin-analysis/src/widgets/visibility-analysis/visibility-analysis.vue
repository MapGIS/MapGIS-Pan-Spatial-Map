<template>
  <div class="mp-widget-visibility-analysis">
    <div class="visibility-title">
      <span>图例</span>
    </div>
    <div class="visibility-panel">
      <a-form-model v-model="formData">
        <a-form-model-item label="不可视区域颜色:">
          <div class="red-item"></div>
        </a-form-model-item>
        <a-form-model-item label="可视区域颜色:">
          <div class="green-item"></div>
        </a-form-model-item>
      </a-form-model>
    </div>
    <div class="visibility-footer">
      <a-button type="primary" size="small" @click="onClickView">视点</a-button>
      <a-button type="primary" size="small" @click="onClickTarget"
        >目标点</a-button
      >
      <a-button type="primary" size="small" @click="onClickStop"
        >结束分析</a-button
      >
    </div>
  </div>
</template>

<script lang="ts">
import { Mixins, Component } from 'vue-property-decorator'
import { WidgetMixin } from '@mapgis/web-app-framework'

@Component({ name: 'MpVisibilityAnalysis' })
export default class MpVisibilityAnalysis extends Mixins(WidgetMixin) {
  private formData = {}

  // 是否为鼠标注册了监听事件
  private isAddEventListener = false

  // 是否已选择观察点位置
  private hasViewPosition = false

  // 观察点
  private viewPoint

  // 目标点
  private targetPoint

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

    // 移除通视分析结果
    this.webGlobe.viewer.scene.VisualAnalysisManager.remove(
      window.VisibilityAnalysisManage.visibility
    )

    // 销毁通视分析类
    window.VisibilityAnalysisManage.visibility.destroy()

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
.visibility-title {
  display: flex;
  justify-content: center;
  align-items: center;
  margin-bottom: 8px;

  span {
    font-size: 24px;
    font-weight: bold;
  }
}

.visibility-panel {
  .ant-form-item {
    margin-bottom: 8px;
  }

  ::v-deep .ant-form-item-label {
    line-height: 28px;
  }

  .red-item {
    background: red;
    height: 28px;
    border-radius: 4px;
  }

  .green-item {
    background: green;
    height: 28px;
    border-radius: 4px;
  }
}

.visibility-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 16px;
}
</style>
