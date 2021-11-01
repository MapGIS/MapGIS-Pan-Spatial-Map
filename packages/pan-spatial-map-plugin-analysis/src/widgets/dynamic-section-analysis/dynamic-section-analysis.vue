<template>
  <div class="mp-widget-dynamic-section-analysis">
    <mp-group-tab title="模型" :has-top-margin="false"></mp-group-tab>
    <a-row class="model">
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
    </a-row>
    <mp-group-tab title="坐标轴"></mp-group-tab>
    <a-row class="axis">
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
    </a-row>
    <mp-group-tab title="参数设置"></mp-group-tab>
    <mp-setting-form :label-width="72">
      <a-form-item label="剖面颜色">
        <MpColorPicker
          :color.sync="color"
          :disableAlpha="false"
          class="color-picker"
        ></MpColorPicker>
      </a-form-item>
      <a-form-item label="动画时间">
        <a-input-number v-model="time" :min="0" />
      </a-form-item>
      <a-form-item label="剖切距离">
        <a-slider
          v-model="distance"
          :min="min"
          :max="max"
          @change="setDistance"
          :disabled="readonly"
        />
      </a-form-item>
    </mp-setting-form>
    <div class="mp-footer-actions center">
      <a-button type="primary" @click="startClipping">
        分析
      </a-button>
      <a-button type="primary" @click="animation">
        动态效果
      </a-button>
      <a-button @click="stopClipping">
        清除
      </a-button>
    </div>
  </div>
</template>

<script lang="ts">
import { Mixins, Component, Watch } from 'vue-property-decorator'
import {
  WidgetMixin,
  LayerType,
  IGSSceneSublayerRenderType,
  LoadStatus,
  Objects
} from '@mapgis/web-app-framework'

@Component({
  name: 'MpDynamicSectionAnalysis'
})
export default class MpDynamicSectionAnalysis extends Mixins(WidgetMixin) {
  // 模型集合
  private models = []

  // 选中模型
  private model = null

  // 默认坐标轴
  private axis = 'X'

  // 默认裁剪边缘颜色
  private color = 'rgb(200,200,200,0.5)'

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
            const { renderType } = layer.activeScene.sublayers[0]
            if (renderType === IGSSceneSublayerRenderType.modelCache) {
              // 剖切分析暂时只支持模型
              layers.push(layer)
            }
          }
        }
      })
    this.models = layers
    if (layers.length > 0) {
      this.model = layers[layers.length - 1]
    } else {
      this.model = null
      // 基础目录树上取消勾选会直接移除模型，这里把window.Cutting.CuttingTool置空处理，不然报错
      if (window.Cutting && window.Cutting.CuttingTool) {
        window.Cutting.CuttingTool = null
      }
    }
  }

  /**
   * 切换三维模型
   */
  @Watch('model', { deep: true, immediate: true })
  changeModel() {
    if (!this.isActive || !this.model) return
    const source = this.landscapeLayerFuc()
    Objects.SceneController.getInstance(
      this.Cesium,
      this.CesiumZondy,
      this.webGlobe
    ).zoomToM3dLayerBySource(source[0])
    this.getMaxMin()
    this.startClipping()
  }

  /**
   * 切换坐标轴
   */
  @Watch('axis', { deep: true, immediate: true })
  changeAxis() {
    this.getMaxMin()
    this.startClipping()
  }

  /**
   * 打开模块
   */
  onOpen() {
    window.Cutting = {
      CuttingTool: null
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
    if (window.Cutting.CuttingTool) {
      window.Cutting.CuttingTool.removeAll()
      window.Cutting.CuttingTool = null
    }
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

  /**
   * 剖切方向，Cesium.Cartesian3中第一个参数是左右，第二个参数是前后，第三个参数是上下
   */
  clippingDirection() {
    switch (this.axis) {
      case 'X':
        return new this.Cesium.Cartesian3(-1.0, 0.0, 0.0)
      case 'Y':
        return new this.Cesium.Cartesian3(0.0, -1.0, 0.0)
      case 'Z':
        return new this.Cesium.Cartesian3(0.0, 0.0, -1.0)
      default:
        return new this.Cesium.Cartesian3(-1.0, 0.0, 0.0)
    }
  }

  /**
   * 裁剪边缘颜色
   */
  edgeColor() {
    return Objects.SceneController.getInstance(
      this.Cesium,
      this.CesiumZondy,
      this.webGlobe
    ).colorToCesiumColor(this.color)
  }

  /**
   * 开始分析
   */
  startClipping() {
    if (this.model === null || this.models.length === 0) {
      return
    }
    this.clearTimer()
    this.removeDynaCut()
    // 获取切割图层
    const landscapeLayer = this.landscapeLayerFuc()

    // 初始化分析功能管理类
    window.Cutting.CuttingTool =
      window.Cutting.CuttingTool ||
      new this.Cesium.CuttingTool(this.webGlobe.viewer, landscapeLayer)

    // 剖切方向
    const direction = this.clippingDirection()
    // 创建剖切对象实例
    window.Cutting.CuttingTool.createModelCuttingPlane(direction, {
      distance: 0,
      color: this.edgeColor(),
      // 剖切辅助面的宽高缩放比(基于模型球的半径)
      scaleHeight: 2.0,
      scaleWidth: 2.0
    })
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
    if (window.Cutting.CuttingTool) {
      // 设置剖切面距离
      window.Cutting.CuttingTool.distance = value
    }
  }

  /**
   * 获取剖切图层
   */
  landscapeLayerFuc() {
    const { id } = this.model.activeScene.sublayers[0]
    const { source } = Objects.SceneController.getInstance(
      this.Cesium,
      this.CesiumZondy,
      this.webGlobe
    ).findSource(id)
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
    const { xmin, ymin, xmax, ymax, zmin, zmax } = range
    let length = max - min
    switch (this.axis) {
      case 'X':
        max = xmax
        min = xmin
        break
      case 'Y':
        max = ymax
        min = ymin
        break
      case 'Z':
        max = zmax
        min = zmin
        break
      default:
        break
    }
    length = (max - min) * 1.5
    this.distance = length / 2
    this.max = length
    this.min = -length
  }
}
</script>

<style lang="less" scoped>
@import '../index.less';

::v-deep {
  .ant-input-number {
    width: 100%;
  }
}

.mp-widget-dynamic-section-analysis {
  display: flex;
  flex-direction: column;
  .model,
  .axis {
    font-size: 12px;
    .ant-radio-wrapper {
      font-size: 12px;
    }
  }
}
</style>
