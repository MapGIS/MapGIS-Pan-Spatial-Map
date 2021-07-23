<template>
  <div class="mp-widget-flooding">
    <mp-setting-form :form="form">
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
          :disableAlpha="true"
          class="color-picker"
        ></MpColorPicker>
      </a-form-item>
      <a-form-item label="透明度">
        <a-input
          v-model.number="formData.opacity"
          type="number"
          min="0"
          max="1"
          step="0.1"
        />
      </a-form-item>
    </mp-setting-form>
    <div class="control-button-container">
      <a-button class="control-button" type="primary" @click="rise"
        >升高</a-button
      >
      <a-button class="control-button" type="primary" @click="down"
        >下降</a-button
      >
    </div>
    <div class="control-button-container">
      <a-button class="control-button" type="primary" @click="add"
        >开始分析</a-button
      >
      <a-button class="control-button" type="primary" @click="remove"
        >结束分析</a-button
      >
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
  private form = this.$form.createForm(this)

  private formData = {
    minHeight: 0,
    maxHeight: 2000,
    speed: 500,
    frequency: 1000,
    animationSpeed: 0.01,
    amplitude: 10,
    floodColor: 'rgb(255,255,102)',
    opacity: 0.7
  }

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

  onActive() {}

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
            floodSpeed: Number(speed <= 0 ? 1 : speed),
            // 水纹频率 指波浪的个数
            frequency: Number(frequency <= 0 ? 1000 : frequency),
            // 水纹速度
            animationSpeed: Number(animationSpeed <= 0 ? 0.01 : animationSpeed),
            // 水波的高度
            amplitude: Number(amplitude <= 0 ? 10 : amplitude),
            // 指定光线强度
            specularIntensity: 3.0
          })
        window.FloodingManage.flood.floodColor = self.edgeColor

        viewer.scene.globe.depthTestAgainstTerrain = true
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
    window.FloodingManage.flood.maxHeight += 1000
    window.FloodingManage.flood.isDownFlood = false
    this.webGlobe.scene.requestRender()
  }

  /**
   * 洪水下降
   */
  down() {
    window.FloodingManage.flood.maxHeight -= 1000
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
  }
}
</script>
<style lang="less">
.mp-widget-flooding {
  padding-top: 8px;
  .control-button-container {
    display: flex;
    justify-content: space-between;
    margin: 5px 0;
    &:last-child {
      margin-bottom: 0;
    }
    .control-button {
      width: calc(~'50% - 2.5px');
    }
  }
}
</style>
