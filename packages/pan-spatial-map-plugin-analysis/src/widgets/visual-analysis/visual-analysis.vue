<template>
  <div class="mp-widget-visual-analysis">
    <div class="visual-panel">
      <mp-setting-form v-model="formData" :wrapper-width="240">
        <a-form-item label="水平视角">
          <a-input
            v-model.number="formData.horizontAngle"
            :min="1"
            type="number"
          />
        </a-form-item>
        <a-form-item label="垂直视角">
          <a-input
            v-model.number="formData.verticalAngle"
            :min="1"
            type="number"
          />
        </a-form-item>
        <a-form-item label="附加高度(米)">
          <a-input
            v-model.number="formData.exHeight"
            type="number"
            :min="0"
            :step="0.1"
          />
        </a-form-item>
        <a-form-item label="方向角">
          <a-input v-model.number="heading" :min="0" :max="360" type="number" />
        </a-form-item>
        <a-form-item label="俯仰角">
          <a-input v-model.number="pitch" :min="-90" :max="90" type="number" />
        </a-form-item>
        <a-form-item label="可视距离(米)">
          <a-input v-model.number="viewRadius" :min="0" type="number" />
        </a-form-item>
        <a-form-item label="观察点坐标">
          <a-row>
            <a-col v-if="posData.viewPositionX !== ''" :span="8">
              <a-popover>
                <template slot="content">
                  <p>{{ posData.viewPositionX }}</p>
                </template>
                <a-input
                  v-model.number="posData.viewPositionX"
                  :step="0.0001"
                  type="number"
                />
              </a-popover>
            </a-col>
            <a-col v-else :span="8">
              <a-input v-model.number="posData.viewPositionX" type="number" />
            </a-col>
            <a-col v-if="posData.viewPositionY !== ''" :span="8">
              <a-popover>
                <template slot="content">
                  <p>{{ posData.viewPositionY }}</p>
                </template>
                <a-input
                  v-model.number="posData.viewPositionY"
                  :step="0.0001"
                  type="number"
                />
              </a-popover>
            </a-col>
            <a-col v-else :span="8">
              <a-input v-model.number="posData.viewPositionY" type="number" />
            </a-col>
            <a-col v-if="posData.viewPositionZ !== ''" :span="8">
              <a-popover>
                <template slot="content">
                  <p>{{ posData.viewPositionZ }}</p>
                </template>
                <a-input v-model.number="posData.viewPositionZ" type="number" />
              </a-popover>
            </a-col>
            <a-col v-else :span="8">
              <a-input v-model.number="posData.viewPositionZ" type="number" />
            </a-col>
          </a-row>
        </a-form-item>
        <a-form-item label="目标点坐标">
          <a-row>
            <a-col v-if="posData.targetPositionX !== ''" :span="8">
              <a-popover>
                <template slot="content">
                  <p>{{ posData.targetPositionX }}</p>
                </template>
                <a-input
                  v-model.number="posData.targetPositionX"
                  :step="0.0001"
                  type="number"
                />
              </a-popover>
            </a-col>
            <a-col v-else :span="8">
              <a-input v-model.number="posData.targetPositionX" type="number" />
            </a-col>
            <a-col v-if="posData.targetPositionY !== ''" :span="8">
              <a-popover>
                <template slot="content">
                  <p>{{ posData.targetPositionY }}</p>
                </template>
                <a-input
                  v-model.number="posData.targetPositionY"
                  :step="0.0001"
                  type="number"
                />
              </a-popover>
            </a-col>
            <a-col v-else :span="8">
              <a-input v-model.number="posData.targetPositionY" type="number" />
            </a-col>
            <a-col v-if="posData.targetPositionZ !== ''" :span="8">
              <a-popover>
                <template slot="content">
                  <p>{{ posData.targetPositionZ }}</p>
                </template>
                <a-input
                  v-model.number="posData.targetPositionZ"
                  type="number"
                />
              </a-popover>
            </a-col>
            <a-col v-else :span="8">
              <a-input v-model.number="posData.targetPositionZ" type="number" />
            </a-col>
          </a-row>
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
import {
  WidgetMixin,
  LayerType,
  IGSSceneSublayerRenderType
} from '@mapgis/web-app-framework'

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
    maskColor: 'rgba(37, 218, 169, 0.2)',
    exHeight: 1.85
  }

  // 方向角
  private heading = 0

  // 俯仰角
  private pitch = 0

  // 可视距离
  private viewRadius = 0

  // 坐标数据
  private posData = {
    viewPositionX: '',
    viewPositionY: '',
    viewPositionZ: '',
    targetPositionX: '',
    targetPositionY: '',
    targetPositionZ: ''
  }

  // 是否为鼠标注册了监听事件
  private isAddEventListener = false

  // 是否已选择观察点位置
  private hasViewPosition = false

  // 是否可以进行可视域分析
  private isAnalyze = false

  // 是否具有初始目标点
  private isHasTargetPos = false

  // 观察点
  private viewPoint

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
    const maskColor = new this.Cesium.Color.fromCssColorString(newVal.maskColor)

    if (window.VisualAnalysisManage.visualAnalysis) {
      window.VisualAnalysisManage.visualAnalysis.unVisibleColor = unVisibleColor
      window.VisualAnalysisManage.visualAnalysis.visibleColor = visibleColor
      window.VisualAnalysisManage.visualAnalysis._fanColor = maskColor
      window.VisualAnalysisManage.visualAnalysis.horizontAngle =
        newVal.horizontAngle
      window.VisualAnalysisManage.visualAnalysis.verticalAngle =
        newVal.verticalAngle

      if (newVal.exHeight !== oldVal.exHeight) {
        let cartesian = window.VisualAnalysisManage.visualAnalysis.viewPosition
        // 获取当前坐标系标准
        const ellipsoid = this.webGlobe.viewer.scene.globe.ellipsoid
        // 根据坐标系标准，将笛卡尔坐标转换为地理坐标
        const cartographic = ellipsoid.cartesianToCartographic(cartesian)
        cartographic.height += newVal.exHeight - oldVal.exHeight

        cartesian = this.Cesium.Cartographic.toCartesian(cartographic)
        window.VisualAnalysisManage.visualAnalysis.viewPosition = cartesian
        // 改变观察点坐标
        this.viewPoint.position._value = cartesian
      }
    }
  }

  @Watch('heading')
  onHeadingChange(newVal) {
    if (window.VisualAnalysisManage.visualAnalysis) {
      window.VisualAnalysisManage.visualAnalysis.heading = newVal
      this.updateTargetPosition(
        window.VisualAnalysisManage.visualAnalysis.targetPosition
      )
    }
  }

  @Watch('pitch')
  onPitchChange(newVal) {
    if (window.VisualAnalysisManage.visualAnalysis) {
      window.VisualAnalysisManage.visualAnalysis.pitch = newVal
      this.updateTargetPosition(
        window.VisualAnalysisManage.visualAnalysis.targetPosition
      )
    }
  }

  @Watch('viewRadius')
  onViewRadiusChange(newVal) {
    if (window.VisualAnalysisManage.visualAnalysis) {
      window.VisualAnalysisManage.visualAnalysis.viewRadius = newVal
      this.updateTargetPosition(
        window.VisualAnalysisManage.visualAnalysis.targetPosition
      )
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

  // 通过输入坐标开始分析按钮回调
  private onInputStart() {
    let viewCartesian = this.Cesium.Cartesian3.fromDegrees(
      this.posData.viewPositionX,
      this.posData.viewPositionY,
      this.posData.viewPositionZ
    )

    const cartographic = this.updateExheight(viewCartesian)
    viewCartesian = this.Cesium.Cartographic.toCartesian(cartographic)

    const targetCartesian = this.Cesium.Cartesian3.fromDegrees(
      this.posData.targetPositionX,
      this.posData.targetPositionY,
      this.posData.targetPositionZ
    )

    window.VisualAnalysisManage.visualAnalysis.viewPosition = viewCartesian
    window.VisualAnalysisManage.visualAnalysis.targetPosition = targetCartesian

    this.setVisualAttrs()

    // 添加观察点到地图
    this.addViewPoint(viewCartesian)
  }

  // 点击开始分析按钮回调
  private onClickStart() {
    this.startVisualAnalysis()

    if (
      this.posData.viewPositionX !== '' &&
      this.posData.viewPositionY !== '' &&
      this.posData.viewPositionZ !== '' &&
      this.posData.targetPositionX !== '' &&
      this.posData.targetPositionY !== '' &&
      this.posData.targetPositionZ !== ''
    ) {
      this.isHasTargetPos = false
      // 注销鼠标的各项监听事件
      this.webGlobe.unRegisterMouseEvent('MOUSE_MOVE')
      this.webGlobe.unRegisterMouseEvent('LEFT_CLICK')
      this.webGlobe.unRegisterMouseEvent('RIGHT_CLICK')
      this.isAddEventListener = false

      this.onInputStart()
    } else if (
      this.posData.viewPositionX === '' &&
      this.posData.viewPositionY === '' &&
      this.posData.viewPositionZ === '' &&
      this.posData.targetPositionX === '' &&
      this.posData.targetPositionY === '' &&
      this.posData.targetPositionZ === ''
    ) {
      this.isHasTargetPos = false
      this.addEventListener()
    } else if (
      this.posData.viewPositionX !== '' &&
      this.posData.viewPositionY !== '' &&
      this.posData.viewPositionZ !== '' &&
      this.posData.targetPositionX === '' &&
      this.posData.targetPositionY === '' &&
      this.posData.targetPositionZ === ''
    ) {
      this.isHasTargetPos = false
      let viewCartesian = this.Cesium.Cartesian3.fromDegrees(
        this.posData.viewPositionX,
        this.posData.viewPositionY,
        this.posData.viewPositionZ
      )

      const cartographic = this.updateExheight(viewCartesian)
      viewCartesian = this.Cesium.Cartographic.toCartesian(cartographic)

      window.VisualAnalysisManage.visualAnalysis.viewPosition = viewCartesian
      this.convertPosition(viewCartesian, 'view')
      // 添加观察点到地图
      this.addViewPoint(viewCartesian)
      this.hasViewPosition = true

      this.addEventListener()
    } else if (
      this.posData.viewPositionX === '' &&
      this.posData.viewPositionY === '' &&
      this.posData.viewPositionZ === '' &&
      this.posData.targetPositionX !== '' &&
      this.posData.targetPositionY !== '' &&
      this.posData.targetPositionZ !== ''
    ) {
      this.isHasTargetPos = true
      this.addEventListener()
    } else {
      this.isHasTargetPos = false
      this.addEventListener()
    }
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

  // 开启可视域分析工具
  private startVisualAnalysis() {
    this.isAnalyze = true
    this.tilesetArray = this.webGlobe._m3dServerLayer
    this.isOpenDepthTest()

    // 初始化分析工具
    window.VisualAnalysisManage.visualAnalysis = new this.Cesium.ViewshedAnalysis()

    // 锁定图层帧数,只显示一个可视域结果
    for (let i = 0; i < this.tilesetArray.length; i++) {
      this.tilesetArray[i][0].debugFreezeFrame = true
    }

    // 移除可视域分析结果
    this.webGlobe.viewer.scene.VisualAnalysisManager._visualAnalysisList = []

    // 移除所有观察点
    this.webGlobe.viewer.entities.removeAll()

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

    // 清空观察点与目标点坐标
    this.posData.viewPositionX = ''
    this.posData.viewPositionY = ''
    this.posData.viewPositionZ = ''
    this.posData.targetPositionX = ''
    this.posData.targetPositionY = ''
    this.posData.targetPositionZ = ''

    // 清空方向角、俯仰角、可视距离
    this.heading = 0
    this.pitch = 0
    this.viewRadius = 0

    // 移除所有观察点
    this.webGlobe.viewer.entities.removeAll()

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
    let cartesian = this.webGlobe.viewer.getCartesian3Position(event.position)

    if (this.isAnalyze) {
      if (!this.hasViewPosition && cartesian !== undefined) {
        // 若还未选择观察点
        const cartographic = this.updateExheight(cartesian)
        cartesian = this.Cesium.Cartographic.toCartesian(cartographic)

        // 设置可视域观察点坐标
        window.VisualAnalysisManage.visualAnalysis.viewPosition = cartesian
        this.convertPosition(cartesian, 'view')

        // 添加观察点到地图
        this.addViewPoint(cartesian)
        this.hasViewPosition = true

        // 如果拥有初始目标点，则相当于在选择观察点后，又自动点击了鼠标左键一次来选择目标点
        if (this.isHasTargetPos) {
          const targetCartesian = this.Cesium.Cartesian3.fromDegrees(
            this.posData.targetPositionX,
            this.posData.targetPositionY,
            this.posData.targetPositionZ
          )
          window.VisualAnalysisManage.visualAnalysis.targetPosition = targetCartesian

          this.setVisualAttrs()
          this.convertPosition(targetCartesian, 'target')

          this.hasViewPosition = false
          this.isAnalyze = false
        }
      } else {
        // 已经选择了观察点，则这次是选择结束点

        // 设置可视域结束点坐标
        window.VisualAnalysisManage.visualAnalysis.targetPosition = cartesian

        this.setVisualAttrs()
        this.convertPosition(cartesian, 'target')

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

      this.setVisualAttrs()
      this.convertPosition(cartesian, 'target')
    }

    this.hasViewPosition = false
    this.isAnalyze = false
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

  // 从地图上移除观察点
  private removeViewPoint() {
    if (this.viewPoint) this.webGlobe.viewer.entities.remove(this.viewPoint)
  }

  // 将三维笛卡尔坐标转换为经纬度坐标
  private convertPosition(position, type) {
    // 获取当前坐标系标准
    const ellipsoid = this.webGlobe.viewer.scene.globe.ellipsoid
    // 根据坐标系标准，将笛卡尔坐标转换为地理坐标
    const cartographic = ellipsoid.cartesianToCartographic(position)
    // 获取高度
    const height = cartographic.height.toFixed(8)

    // 获取该位置的经纬度坐标
    const centerLon = parseFloat(
      this.Cesium.Math.toDegrees(cartographic.longitude).toFixed(8)
    )
    const centerLat = parseFloat(
      this.Cesium.Math.toDegrees(cartographic.latitude).toFixed(8)
    )

    if (type === 'view') {
      this.posData.viewPositionX = centerLon
      this.posData.viewPositionY = centerLat
      this.posData.viewPositionZ = height
    } else {
      this.posData.targetPositionX = centerLon
      this.posData.targetPositionY = centerLat
      this.posData.targetPositionZ = height
    }
  }

  // 获取更新附加高度后的地理坐标
  private updateExheight(cartesian) {
    // 获取当前坐标系标准
    const ellipsoid = this.webGlobe.viewer.scene.globe.ellipsoid
    // 根据坐标系标准，将笛卡尔坐标转换为地理坐标
    const cartographic = ellipsoid.cartesianToCartographic(cartesian)
    // 抬高观察点
    cartographic.height += this.formData.exHeight

    return cartographic
  }

  // 分析完成时显示方向角、俯仰角、可视距离三种属性
  private setVisualAttrs() {
    const {
      heading,
      pitch,
      viewRadius
    } = window.VisualAnalysisManage.visualAnalysis

    this.heading = heading.toFixed(2)
    this.pitch = pitch.toFixed(2)
    this.viewRadius = parseInt(viewRadius)
  }

  // 若分析完成后，当方向角、俯仰角、可视距离变化时，更新目标点坐标
  private updateTargetPosition(cartesian) {
    this.convertPosition(cartesian, 'target')
  }
}
</script>

<style lang="less" scoped>
@import '../index.less';
</style>
