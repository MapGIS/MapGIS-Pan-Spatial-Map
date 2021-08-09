<template>
  <div class="mp-widget-visibility-analysis">
    <div class="visibility-panel">
      <mp-setting-form v-model="formData">
        <a-form-item label="附加高度(米)">
          <a-input
            v-model.number="formData.exHeight"
            type="number"
            :min="0"
            :step="0.1"
          />
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
import {
  WidgetMixin,
  LayerType,
  IGSSceneSublayerRenderType
} from '@mapgis/web-app-framework'

@Component({ name: 'MpVisibilityAnalysis' })
export default class MpVisibilityAnalysis extends Mixins(WidgetMixin) {
  private formData = {
    exHeight: 1.85,
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

  // 观察点坐标
  private viewPosition

  // 通视分析结果集
  private visibilityArr = []

  get formDataClone() {
    return JSON.parse(JSON.stringify(this.formData))
  }

  @Watch('formDataClone', { deep: true })
  onColorChange(newVal, oldVal) {
    const unVisibleColor = new this.Cesium.Color.fromCssColorString(
      newVal.unVisibleColor
    )
    const visibleColor = new this.Cesium.Color.fromCssColorString(
      newVal.visibleColor
    )
    if (this.visibilityArr.length > 0) {
      this.visibilityArr.forEach(item => {
        item._unvisibleColor = unVisibleColor
        item._visibleColor = visibleColor
        if (newVal.exHeight !== oldVal.exHeight) {
          // 改变通视分析工具的附加高度(分析工具的观察点坐标也会同时更新)
          item.exHeight = newVal.exHeight - oldVal.exHeight

          // 改变观察点坐标
          this.viewPoint.position._value = item.viewPosition
          // 记录新的观察点坐标
          this.viewPosition = item.viewPosition
        }
      })
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

  // 创建通视分析工具
  private createVisibility() {
    const unVisibleColor = new this.Cesium.Color.fromCssColorString(
      this.formData.unVisibleColor
    )
    const visibleColor = new this.Cesium.Color.fromCssColorString(
      this.formData.visibleColor
    )

    // 初始化高级分析功能管理类
    const advancedAnalysisManager = new window.CesiumZondy.Manager.AdvancedAnalysisManager(
      {
        viewer: this.webGlobe.viewer
      }
    )

    // 初始化通视分析类
    const visibility = advancedAnalysisManager.createVisibilityAnalysis()
    visibility._unvisibleColor = unVisibleColor
    visibility._visibleColor = visibleColor

    this.visibilityArr.push(visibility)

    return visibility
  }

  // 是否开启地形深度检测
  private isOpenDepthTest() {
    // 若分析的模型是三维地形，则开启地形深度检测,否则关闭深度检测。若未选择任何模型，则默认开启深度检测
    const doc: Document = this.document
    if (doc.defaultMap && doc.defaultMap.allLayers.length > 0) {
      const analysisLry =
        doc.defaultMap.allLayers[doc.defaultMap.allLayers.length - 1]

      // 首先判断勾选的是否是三维图层
      if (analysisLry.type === LayerType.IGSScene) {
        // 然后判断是否是三维地形
        if (
          analysisLry.activeScene.sublayers.some(item => {
            return item.renderType === IGSSceneSublayerRenderType.elevation
          })
        ) {
          // 开启地形深度测试
          this.webGlobe.viewer.scene.globe.depthTestAgainstTerrain = true
        } else {
          this.webGlobe.viewer.scene.globe.depthTestAgainstTerrain = false
        }
      } else {
        this.webGlobe.viewer.scene.globe.depthTestAgainstTerrain = true
      }
    } else {
      this.webGlobe.viewer.scene.globe.depthTestAgainstTerrain = true
    }
  }

  // 点击“分析”按钮回调
  private onClickStart() {
    this.onClickStop()

    this.isOpenDepthTest()

    this.addEventListener()
  }

  // 点击“结束分析”按钮回调
  private onClickStop() {
    // 注销鼠标的各项监听事件
    this.webGlobe.unRegisterMouseEvent('LEFT_CLICK')
    this.webGlobe.unRegisterMouseEvent('RIGHT_CLICK')

    this.webGlobe.viewer.entities.removeAll()

    if (this.visibilityArr.length > 0) {
      this.visibilityArr.forEach(item => {
        // 移除通视分析结果
        this.webGlobe.viewer.scene.VisualAnalysisManager.remove(item)
        // 销毁通视分析类
        item.destroy()
      })
    }

    this.webGlobe.viewer.scene.globe.depthTestAgainstTerrain = false
    this.hasViewPosition = false
    this.isAddEventListener = false
    this.visibilityArr = []
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
    let cartesian = this.webGlobe.viewer.getCartesian3Position(event.position)

    if (!this.hasViewPosition && cartesian !== undefined) {
      // 若还未选择观察点,则记录下观察点坐标

      // 获取当前坐标系标准
      const ellipsoid = this.webGlobe.viewer.scene.globe.ellipsoid
      // 根据坐标系标准，将笛卡尔坐标转换为地理坐标
      const cartographic = ellipsoid.cartesianToCartographic(cartesian)
      // 抬高观察点
      cartographic.height += this.formData.exHeight

      cartesian = this.Cesium.Cartographic.toCartesian(cartographic)
      this.viewPosition = cartesian

      // 添加观察点到地图
      this.addViewPoint(cartesian)
      this.hasViewPosition = true
    } else {
      const visibility = this.createVisibility()

      // 设置通视分析观察点坐标
      visibility.viewPosition = this.viewPosition

      // 设置通视分析结束点坐标
      visibility.targetPosition = cartesian

      // 添加目标点到地图
      this.addTargetPoint(cartesian)
    }
  }

  // 注册通视分析鼠标右键点击事件
  private registerMouseRClickEvent(event) {
    // 注销鼠标的各项监听事件
    this.webGlobe.unRegisterMouseEvent('LEFT_CLICK')
    this.webGlobe.unRegisterMouseEvent('RIGHT_CLICK')
    this.isAddEventListener = false
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
