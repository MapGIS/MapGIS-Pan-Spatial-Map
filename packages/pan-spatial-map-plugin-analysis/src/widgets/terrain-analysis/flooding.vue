<template>
  <div class="mp-widget-flooding">
    <mp-setting-form>
      <a-form-item label="淹没最低高度">
        <a-input
          v-model.number="formData.minHeight"
          type="number"
          min="0"
          addon-after="(米)"
        />
      </a-form-item>
      <a-form-item label="淹没最高高度">
        <a-input
          v-model.number="formData.maxHeight"
          type="number"
          min="0"
          addon-after="(米)"
        />
      </a-form-item>
      <a-form-item label="洪水上涨速度">
        <a-input
          v-model.number="formData.speed"
          type="number"
          min="0"
          addon-after="(米/秒)"
        />
      </a-form-item>
      <a-form-item label="波浪个数">
        <a-input
          v-model.number="formData.frequency"
          type="number"
          min="0"
          addon-after="(个)"
        />
      </a-form-item>
      <a-form-item label="波浪速度">
        <a-input
          v-model.number="formData.animationSpeed"
          type="number"
          min="0"
          step="0.01"
          addon-after="(米/秒)"
        />
      </a-form-item>
      <a-form-item label="波浪高度">
        <a-input
          v-model.number="formData.amplitude"
          type="number"
          min="0"
          addon-after="(米)"
        />
      </a-form-item>
      <a-form-item label="颜色">
        <MpColorPicker
          :color.sync="formData.floodColor"
          :disableAlpha="false"
          class="color-picker"
        ></MpColorPicker>
      </a-form-item>
    </mp-setting-form>
    <div class="mp-footer-actions">
      <a-button type="primary" @click="add">分析</a-button>
      <a-button type="primary" @click="rise">升高</a-button>
      <a-button type="primary" @click="down">下降</a-button>
      <a-button @click="remove">清除</a-button>
    </div>
  </div>
</template>
<script lang="ts">
import { Vue, Component, Mixins } from 'vue-property-decorator'
import { WidgetMixin, Objects } from '@mapgis/web-app-framework'

@Component({
  name: 'MpFlooding'
})
export default class MpFlooding extends Mixins(WidgetMixin) {
  private formData = {
    minHeight: 0,
    maxHeight: 2000,
    speed: 500,
    frequency: 1000,
    animationSpeed: 0.01,
    amplitude: 10,
    floodColor: 'rgba(255,255,102,0.7)'
  }

  private depthTestAgainstTerrain = false // 深度检测是否已开启

  /**
   * rgba转cesium内部颜色
   */
  get edgeColor() {
    return Objects.SceneController.getInstance(
      this.Cesium,
      this.CesiumZondy,
      this.webGlobe
    ).colorToCesiumColor(this.formData.floodColor)
  }

  created() {
    window.FloodingManage = {
      drawElement: null,
      flood: null
    }
  }

  onActive() {
    const { viewer } = this.webGlobe
    if (viewer.scene.globe.depthTestAgainstTerrain) {
      this.depthTestAgainstTerrain = true
    }
  }

  // 微件失活时
  onDeActive() {
    this.stopFloodAnalysis()
  }

  add() {
    const { viewer } = this.webGlobe
    // 初始化交互式绘制控件
    window.FloodingManage.drawElement =
      window.FloodingManage.drawElement || new this.Cesium.DrawElement(viewer)
    const {
      minHeight,
      maxHeight,
      speed,
      frequency,
      animationSpeed,
      amplitude
    } = this.formData
    const self = this
    // 激活交互式绘制工具
    window.FloodingManage.drawElement.startDrawingPolygon({
      // 绘制完成回调函数
      callback: positions => {
        self.remove()
        // 初始化高级分析功能管理类
        const advancedAnalysisManager = new self.CesiumZondy.Manager.AdvancedAnalysisManager(
          {
            viewer: viewer
          }
        )
        // 初始化洪水淹没分析类
        window.FloodingManage.flood =
          window.FloodingManage.flood ||
          advancedAnalysisManager.createFlood(positions, {
            // 设置洪水淹没区域动画最低高度
            minHeight: Number(minHeight <= 0 ? 0 : minHeight), // 设置洪水淹没区域动画最低高度
            // 设置洪水淹没区域最高高度
            maxHeight: Number(maxHeight <= 0 ? 2000 : maxHeight),
            // 设置洪水上涨速度
            floodSpeed: Number(speed <= 0 ? 1 : speed)
          })
        window.FloodingManage.flood.floodColor = self.edgeColor
        // 水纹频率 指波浪的个数
        window.FloodingManage.flood.frequency = Number(
          frequency <= 0 ? 1000 : frequency
        )
        // 水纹速度
        window.FloodingManage.flood.animationSpeed = Number(
          animationSpeed <= 0 ? 0.01 : animationSpeed
        )
        // 水波的高度
        window.FloodingManage.flood.amplitude = Number(
          amplitude <= 0 ? 10 : amplitude
        )
        // 指定光线强度
        window.FloodingManage.flood.specularIntensity = 3.0

        if (!self.depthTestAgainstTerrain) {
          viewer.scene.globe.depthTestAgainstTerrain = true
        }
        // 添加洪水淹没结果显示
        self.webGlobe.scene.VisualAnalysisManager.add(
          window.FloodingManage.flood
        )
      }
    })
  }

  /**
   * 洪水涨高
   */
  rise() {
    const maxHeight = this.formData.maxHeight + 1000
    this.$set(this.formData, 'maxHeight', maxHeight)
    window.FloodingManage.flood.maxHeight = maxHeight
    window.FloodingManage.flood.isDownFlood = false
    this.webGlobe.scene.requestRender()
  }

  /**
   * 洪水下降
   */
  down() {
    const maxHeight = this.formData.maxHeight - 1000
    this.$set(this.formData, 'maxHeight', maxHeight)
    window.FloodingManage.flood.maxHeight = maxHeight
    window.FloodingManage.flood.isDownFlood = true
    this.webGlobe.scene.requestRender()
  }

  /* 移除洪水淹没分析 */
  stopFloodAnalysis() {
    this.remove()
    this.webGlobe.viewer.entities.removeAll()
  }

  remove() {
    // 判断是否已有洪水淹没分析结果
    if (window.FloodingManage.flood) {
      // 移除洪水淹没分析显示结果
      this.webGlobe.scene.VisualAnalysisManager.remove(
        window.FloodingManage.flood
      )
      window.FloodingManage.flood = null
    }

    if (window.FloodingManage.drawElement) {
      // 取消交互式绘制矩形事件激活状态
      window.FloodingManage.drawElement.stopDrawing()
      window.FloodingManage.drawElement = null
    }

    if (!this.depthTestAgainstTerrain) {
      this.webGlobe.viewer.scene.globe.depthTestAgainstTerrain = false
    }
  }
}
</script>
<style lang="less" scoped>
@import '../index.less';

.mp-widget-flooding {
  padding-top: 8px;
}
</style>
