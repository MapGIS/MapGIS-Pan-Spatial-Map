<template>
  <div class="mp-widget-dynamic-section-analysis">
    <div class="setting-panel">
      <a-space direction="vertical" class="space">
        <a-row class="title">
          <div class="space"></div>
          <div class="label">模型</div>
        </a-row>
        <a-row>
          <a-card bordered size="small" class="card">
            <a-radio-group v-if="models.length > 0" v-model="model">
              <a-radio
                v-for="(node, index) in models"
                :style="radioStyle"
                :key="`model-${index}`"
                :value="node"
              >
                {{ node.title }}
              </a-radio>
            </a-radio-group>
            <div v-else>
              暂无数据！
            </div>
          </a-card>
        </a-row>
        <a-row class="title">
          <div class="space"></div>
          <div class="label">坐标轴</div>
        </a-row>
        <a-row>
          <a-card bordered size="small" class="card">
            <a-radio-group v-model="axis">
              <a-radio value="X">
                X轴
              </a-radio>
              <a-radio value="Y">
                Y轴
              </a-radio>
              <a-radio value="Z">
                Z轴
              </a-radio>
            </a-radio-group>
          </a-card>
        </a-row>
        <a-row class="title">
          <div class="space"></div>
          <div class="label">剖面分析</div>
        </a-row>
        <a-row>
          <a-col :span="8" class="col">
            裁剪边缘颜色
          </a-col>
          <a-col :span="16">
            <a-popover trigger="click">
              <template slot="content">
                <sketch-picker
                  :disableAlpha="true"
                  :value="color"
                  @input="onColorChange"
                />
              </template>
              <div :style="{ background: color }" class="color"></div>
            </a-popover>
          </a-col>
        </a-row>
        <a-row>
          <a-col :span="8" class="col">
            动画时间
          </a-col>
          <a-col :span="16">
            <a-input :value="time" type="number" min="0"></a-input>
          </a-col>
        </a-row>
        <a-row>
          <a-col :span="8" class="col">
            剖切距离
          </a-col>
          <a-col :span="16">
            <a-slider
              v-model="distance"
              :min="min"
              :max="max"
              @change="setDistance"
              :disabled="readonly"
            />
          </a-col>
        </a-row>
      </a-space>
    </div>
    <div class="btn">
      <a-button type="primary" @click="startClipping">开始</a-button>
      <a-button type="primary" @click="stopClipping">结束</a-button>
      <a-button type="primary" @click="animation">动画</a-button>
    </div>
  </div>
</template>

<script lang="ts">
declare const CesiumZondy
import { Mixins, Component, Watch } from 'vue-property-decorator'
import { WidgetMixin, LayerType, LoadStatus } from '@mapgis/web-app-framework'
import { Sketch } from 'vue-color'
import {
  queryFeaturesInstance,
  utilInstance,
  cesiumUtilInstance
} from '@mapgis/pan-spatial-map-store'

@Component({
  name: 'MpDynamicSectionAnalysis',
  components: { 'sketch-picker': Sketch }
})
export default class MpDynamicSectionAnalysis extends Mixins(WidgetMixin) {
  // 模型集合
  private models = []

  // 选中模型
  private model = null

  // 默认坐标轴
  private axis = 'X'

  // 默认裁剪边缘颜色
  private color = 'rgb(255,255,255)'

  // 默认动画时间
  private time = 10

  // 默认剖切距离
  private distance = 0

  // 剖切图层
  private landscapeLayer = []

  // 最大剖切距离
  private max = 10000

  // 最小剖切距离
  private min = -10000

  // 时间轴
  private timer = null

  // slider滑块是否禁用
  private readonly = false

  // 组件是否已激活
  private isActive = false

  // radio样式
  radioStyle = {
    display: 'block',
    height: '30px',
    lineHeight: '30px'
  }

  /**
   * 动态获取基础目录树上已勾选的三维模型数据
   */
  @Watch('document', { deep: true, immediate: true })
  getScenes() {
    if (!this.document) return
    const layers = []
    this.document.defaultMap
      .clone()
      .getFlatLayers()
      .forEach((layer, index) => {
        if (layer.loadStatus === LoadStatus.loaded) {
          if (layer.type === LayerType.IGSScene) {
            layers.push(layer)
          }
        }
      })
    this.models = layers
    if (layers.length > 0) {
      this.model = layers[0]
    } else {
      this.models = layers
      this.model = null
    }
  }

  /**
   * 切换三维模型
   */
  @Watch('model', { deep: true, immediate: true })
  changeModel() {
    if (!this.isActive || !this.model) return
    const bound = cesiumUtilInstance.layerPositionExtentToDegreeExtent(
      CesiumZondy,
      this.model.activeScene.sublayers[0]
    )
    if (bound) {
      this.webGlobe.viewer.camera.flyTo({
        destination: this.Cesium.Rectangle.fromDegrees(
          bound.xmin,
          bound.ymin,
          bound.xmax,
          bound.ymax
        )
      })
    }
    this.getMaxMin()
  }

  /**
   * 切换坐标轴
   */
  @Watch('axis', { deep: true, immediate: true })
  changeAxis() {
    this.getMaxMin()
  }

  /**
   * 打开模块
   */
  onOpen() {
    window.WebClippingPlaneManage = {
      dynaCut: null,
      analysisManager: null,
      plane: null
    }
  }

  /**
   * 关闭模块
   */
  onClose() {
    this.stopClipping()
    this.isActive = false
  }

  // 微件激活时
  onActive() {
    this.isActive = true
    this.changeModel()
  }

  // 微件失活时
  onDeActive() {
    this.isActive = false
  }

  /**
   * 移除动态剖切对象
   */
  removeDynaCut() {
    if (window.WebClippingPlaneManage.dynaCut) {
      window.WebClippingPlaneManage.analysisManager.deleteDynamicCutting(
        window.WebClippingPlaneManage.dynaCut
      )
      window.WebClippingPlaneManage.dynaCut = null
    }
    window.WebClippingPlaneManage.plane = null
    this.landscapeLayer = []
  }

  /**
   * 清除时间计时器
   */
  clearTimer() {
    if (this.timer) {
      window.clearInterval(this.timer)
      this.timer = null
      this.readonly = false
    }
  }

  // 颜色拾取器对应事件
  private onColorChange(val) {
    this.color = utilInstance.rgbaToString(val.rgba, false)
  }

  /**
   * 剖切方向
   */
  clippingPlane() {
    switch (this.axis) {
      case 'X':
        return new this.Cesium.ClippingPlane(
          new this.Cesium.Cartesian3(-1.0, 0.0, 0.0),
          0.0
        )
      case 'Y':
        return new this.Cesium.ClippingPlane(
          new this.Cesium.Cartesian3(0.0, -1.0, 0.0),
          0.0
        )
      case 'Z':
        return new this.Cesium.ClippingPlane(
          new this.Cesium.Cartesian3(0.0, 0.0, -1.0),
          0.0
        )
      default:
        return new this.Cesium.ClippingPlane(
          new this.Cesium.Cartesian3(-1.0, 0.0, 0.0),
          0.0
        )
    }
  }

  /**
   * 裁剪边缘颜色
   */
  edgeColor() {
    if (this.color) {
      const Color = this.color.split(',')
      const ColorRgb = {
        green: Number(Color[1] / 255),
        blue: Number(parseInt(Color[2]) / 255),
        red: Number(Color[0].split('(')[1] / 255)
      }
      return new this.Cesium.Color(
        ColorRgb.red,
        ColorRgb.green,
        ColorRgb.blue,
        0.3
      )
    }
    const ColorRgb = {
      green: Number(255 / 255),
      blue: Number(255 / 255),
      red: Number(255 / 255)
    }
    return new this.Cesium.Color(
      ColorRgb.red,
      ColorRgb.green,
      ColorRgb.blue,
      0.3
    )
  }

  /**
   * 开始分析
   */
  startClipping() {
    if (this.model === null || this.models.length === 0) {
      return
    }
    this.clearTimer()
    // 初始化分析功能管理类
    if (!window.WebClippingPlaneManage.analysisManager) {
      window.WebClippingPlaneManage.analysisManager = new CesiumZondy.Manager.AnalysisManager(
        {
          viewer: this.webGlobe.viewer
        }
      )
    } else {
      this.removeDynaCut()
    }
    // 进行剖切分析的面，从上往下切，Cesium.Cartesian3中第一个参数是左右，第二个参数是前后，第三个参数是上下
    window.WebClippingPlaneManage.plane = this.clippingPlane()
    // 获取切割图层
    this.landscapeLayer = this.landscapeLayerFuc()
    // 创建剖切对象实例
    window.WebClippingPlaneManage.dynaCut = window.WebClippingPlaneManage.analysisManager.createDynamicCutting(
      this.landscapeLayer,
      [window.WebClippingPlaneManage.plane],
      {
        color: this.edgeColor()
      }
    )
    this.setDistance(this.distance)
  }

  /**
   * 结束分析
   */
  stopClipping() {
    this.clearTimer()
    this.removeDynaCut()
  }

  /**
   * 动画设置
   */
  animation() {
    if (this.max == undefined || this.min == undefined) {
      return
    }
    this.clearTimer()
    this.distance = this.min
    const self = this
    this.timer = window.setInterval(() => {
      if (self.readonly === false) {
        self.readonly = true
      }
      const step = ((self.max - self.min) * 2) / (self.time * 10)
      self.distance += step
      if (self.distance >= self.max) {
        self.distance = self.min
      }
      self.setDistance(self.distance)
    }, 100)
  }

  /**
   * 设置剖切距离
   */
  setDistance(value) {
    if (
      window.WebClippingPlaneManage.dynaCut &&
      window.WebClippingPlaneManage.plane &&
      this.landscapeLayer.length > 0
    ) {
      // 设置切面回调函数
      window.WebClippingPlaneManage.dynaCut.planes[0].plane.plane = new this.Cesium.CallbackProperty(
        date => {
          // 设置剖切面距离
          window.WebClippingPlaneManage.plane.distance = value
          return this.Cesium.Plane.transform(
            window.WebClippingPlaneManage.plane,
            this.landscapeLayer[0].modelMatrix,
            new this.Cesium.ClippingPlane(this.Cesium.Cartesian3.UNIT_X, 0.0)
          )
        },
        false
      )
    }
  }

  /**
   * 获取剖切图层
   */
  landscapeLayerFuc() {
    const { id } = this.model.activeScene.sublayers[0]
    const { source } = CesiumZondy.M3DIgsManager.findSource('default', id)
    return source
  }

  /**
   * 获取剖切距离最大最小值
   */
  getMaxMin() {
    let max = 10000
    let min = -max
    if (!this.model) return
    const { range } = this.model.activeScene.sublayers[0]
    switch (this.axis) {
      case 'X':
        max = range.xmax
        min = range.xmin
        break
      case 'Y':
        max = range.ymax
        min = range.ymin
        break
      case 'Z':
        max = range.zmax
        min = range.zmin
        break
      default:
        break
    }
    this.max = max
    this.min = min
    this.distance = (min + max) / 2
  }
}
</script>

<style lang="less">
.mp-widget-dynamic-section-analysis {
  .title {
    .space {
      width: 4px;
      height: 25px;
      background: @primary-color;
      margin-right: 8px;
      float: left;
    }
    .label {
      line-height: 25px;
      font-weight: bold;
    }
  }
  .space {
    width: 100%;
    .card {
      max-height: 150px;
      overflow: auto;
    }
  }
  .btn {
    text-align: right;
    margin: 12px 0;
    button {
      margin-left: 8px;
    }
  }
  .col {
    text-align: center;
    line-height: 30px;
  }
  .setting-panel {
    display: flex;
    flex-direction: column;
    .ant-divider-horizontal {
      margin: 8px 0;
    }
    .color {
      height: 30px;
      box-shadow: @shadow-1-down;
      border-radius: 3px;
    }
  }
}
</style>
