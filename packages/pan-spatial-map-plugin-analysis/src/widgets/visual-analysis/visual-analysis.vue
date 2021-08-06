<template>
  <div class="mp-widget-visual-analysis">
    <div class="visual-panel">
      <mp-setting-form v-model="formData" class="visual-form">
        <a-form-item label="水平视角">
          <a-input v-model.number="formData.horizontAngle" type="number" />
        </a-form-item>
        <a-form-item label="垂直视角">
          <a-input v-model.number="formData.verticalAngle" type="number" />
        </a-form-item>
        <a-form-item label="附加高度(米)">
          <a-input
            v-model.number="formData.exHeight"
            type="number"
            :min="0"
            :step="0.1"
          />
        </a-form-item>
        <a-form-item label="观察点坐标">
          <a-row>
            <a-col v-if="formData.viewPositionX !== ''" :span="8">
              <a-popover>
                <template slot="content">
                  <p>{{ formData.viewPositionX }}</p>
                </template>
                <a-input
                  v-model.number="formData.viewPositionX"
                  type="number"
                />
              </a-popover>
            </a-col>
            <a-col v-else :span="8">
              <a-input v-model.number="formData.viewPositionX" type="number" />
            </a-col>
            <a-col v-if="formData.viewPositionY !== ''" :span="8">
              <a-popover>
                <template slot="content">
                  <p>{{ formData.viewPositionY }}</p>
                </template>
                <a-input
                  v-model.number="formData.viewPositionY"
                  type="number"
                />
              </a-popover>
            </a-col>
            <a-col v-else :span="8">
              <a-input v-model.number="formData.viewPositionY" type="number" />
            </a-col>
            <a-col v-if="formData.viewPositionZ !== ''" :span="8">
              <a-popover>
                <template slot="content">
                  <p>{{ formData.viewPositionZ }}</p>
                </template>
                <a-input
                  v-model.number="formData.viewPositionZ"
                  type="number"
                />
              </a-popover>
            </a-col>
            <a-col v-else :span="8">
              <a-input v-model.number="formData.viewPositionZ" type="number" />
            </a-col>
          </a-row>
        </a-form-item>
        <a-form-item label="目标点坐标">
          <a-row>
            <a-col v-if="formData.targetPositionX !== ''" :span="8">
              <a-popover>
                <template slot="content">
                  <p>{{ formData.targetPositionX }}</p>
                </template>
                <a-input
                  v-model.number="formData.targetPositionX"
                  type="number"
                />
              </a-popover>
            </a-col>
            <a-col v-else :span="8">
              <a-input
                v-model.number="formData.targetPositionX"
                type="number"
              />
            </a-col>
            <a-col v-if="formData.targetPositionY !== ''" :span="8">
              <a-popover>
                <template slot="content">
                  <p>{{ formData.targetPositionY }}</p>
                </template>
                <a-input
                  v-model.number="formData.targetPositionY"
                  type="number"
                />
              </a-popover>
            </a-col>
            <a-col v-else :span="8">
              <a-input
                v-model.number="formData.targetPositionY"
                type="number"
              />
            </a-col>
            <a-col v-if="formData.targetPositionZ !== ''" :span="8">
              <a-popover>
                <template slot="content">
                  <p>{{ formData.targetPositionZ }}</p>
                </template>
                <a-input
                  v-model.number="formData.targetPositionZ"
                  type="number"
                />
              </a-popover>
            </a-col>
            <a-col v-else :span="8">
              <a-input
                v-model.number="formData.targetPositionZ"
                type="number"
              />
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
    maskColor: 'rgba(37, 218, 169, 0.2)',
    exHeight: 1.85,
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
      window.VisualAnalysisManage.visualAnalysis._unVisibleColor = unVisibleColor
      window.VisualAnalysisManage.visualAnalysis._visibleColor = visibleColor
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
      }
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
      this.formData.viewPositionX,
      this.formData.viewPositionY,
      this.formData.viewPositionZ
    )

    const cartographic = this.updateExheight(viewCartesian)
    viewCartesian = this.Cesium.Cartographic.toCartesian(cartographic)

    const targetCartesian = this.Cesium.Cartesian3.fromDegrees(
      this.formData.targetPositionX,
      this.formData.targetPositionY,
      this.formData.targetPositionZ
    )

    window.VisualAnalysisManage.visualAnalysis.viewPosition = viewCartesian
    window.VisualAnalysisManage.visualAnalysis.targetPosition = targetCartesian
  }

  // 点击开始分析按钮回调
  private onClickStart() {
    this.startVisualAnalysis()

    if (
      this.formData.viewPositionX !== '' &&
      this.formData.viewPositionY !== '' &&
      this.formData.viewPositionZ !== '' &&
      this.formData.targetPositionX !== '' &&
      this.formData.targetPositionY !== '' &&
      this.formData.targetPositionZ !== ''
    ) {
      this.isHasTargetPos = false
      // 注销鼠标的各项监听事件
      this.webGlobe.unRegisterMouseEvent('MOUSE_MOVE')
      this.webGlobe.unRegisterMouseEvent('LEFT_CLICK')
      this.webGlobe.unRegisterMouseEvent('RIGHT_CLICK')
      this.isAddEventListener = false

      this.onInputStart()
    } else if (
      this.formData.viewPositionX === '' &&
      this.formData.viewPositionY === '' &&
      this.formData.viewPositionZ === '' &&
      this.formData.targetPositionX === '' &&
      this.formData.targetPositionY === '' &&
      this.formData.targetPositionZ === ''
    ) {
      this.isHasTargetPos = false
      this.addEventListener()
    } else if (
      this.formData.viewPositionX !== '' &&
      this.formData.viewPositionY !== '' &&
      this.formData.viewPositionZ !== '' &&
      this.formData.targetPositionX === '' &&
      this.formData.targetPositionY === '' &&
      this.formData.targetPositionZ === ''
    ) {
      this.isHasTargetPos = false
      let viewCartesian = this.Cesium.Cartesian3.fromDegrees(
        this.formData.viewPositionX,
        this.formData.viewPositionY,
        this.formData.viewPositionZ
      )

      const cartographic = this.updateExheight(viewCartesian)
      viewCartesian = this.Cesium.Cartographic.toCartesian(cartographic)

      window.VisualAnalysisManage.visualAnalysis.viewPosition = viewCartesian
      this.convertPosition(viewCartesian, 'view')
      this.hasViewPosition = true

      this.addEventListener()
    } else if (
      this.formData.viewPositionX === '' &&
      this.formData.viewPositionY === '' &&
      this.formData.viewPositionZ === '' &&
      this.formData.targetPositionX !== '' &&
      this.formData.targetPositionY !== '' &&
      this.formData.targetPositionZ !== ''
    ) {
      this.isHasTargetPos = true
      this.addEventListener()
    } else {
      this.isHasTargetPos = false
      this.addEventListener()
    }
  }

  // 开启可视域分析工具
  private startVisualAnalysis() {
    this.isAnalyze = true
    // 开启地形深度测试
    this.webGlobe.viewer.scene.globe.depthTestAgainstTerrain = true
    this.tilesetArray = this.webGlobe._m3dServerLayer
    // 初始化分析工具
    window.VisualAnalysisManage.visualAnalysis = new this.Cesium.ViewshedAnalysis()

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
    this.formData.viewPositionX = ''
    this.formData.viewPositionY = ''
    this.formData.viewPositionZ = ''
    this.formData.targetPositionX = ''
    this.formData.targetPositionY = ''
    this.formData.targetPositionZ = ''

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

        this.hasViewPosition = true

        // 如果拥有初始目标点，则相当于在选择观察点后，又自动点击了鼠标左键一次来选择目标点
        if (this.isHasTargetPos) {
          const targetCartesian = this.Cesium.Cartesian3.fromDegrees(
            this.formData.targetPositionX,
            this.formData.targetPositionY,
            this.formData.targetPositionZ
          )
          window.VisualAnalysisManage.visualAnalysis.targetPosition = targetCartesian

          this.convertPosition(targetCartesian, 'target')

          this.hasViewPosition = false
          this.isAnalyze = false
        }
      } else {
        // 已经选择了观察点，则这次是选择结束点

        // 设置可视域结束点坐标
        window.VisualAnalysisManage.visualAnalysis.targetPosition = cartesian
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
      this.convertPosition(cartesian, 'target')
    }

    this.hasViewPosition = false
    this.isAnalyze = false
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
      this.formData.viewPositionX = centerLon
      this.formData.viewPositionY = centerLat
      this.formData.viewPositionZ = height
    } else {
      this.formData.targetPositionX = centerLon
      this.formData.targetPositionY = centerLat
      this.formData.targetPositionZ = height
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
}
</script>

<style lang="less" scoped>
@import '../index.less';
</style>
<style lang="less">
.visual-form {
  .ant-form-item-control {
    width: 240px !important;
  }
}
</style>
