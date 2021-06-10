<template>
  <div class="mp-widget-flooding">
    <div class="setting-panel">
      <a-space direction="vertical" class="space">
        <a-row>
          <a-col :span="8" class="col">
            淹没最低高度
          </a-col>
          <a-col :span="16">
            <a-input
              :value="form.minHeight"
              type="number"
              min="0"
              suffix="(米)"
            ></a-input>
          </a-col>
        </a-row>
        <a-row>
          <a-col :span="8" class="col">
            淹没最高高度
          </a-col>
          <a-col :span="16">
            <a-input
              :value="form.maxHeight"
              type="number"
              min="0"
              suffix="(米)"
            ></a-input>
          </a-col>
        </a-row>
        <a-row>
          <a-col :span="8" class="col">
            洪水上涨速度
          </a-col>
          <a-col :span="16">
            <a-input
              :value="form.speed"
              type="number"
              min="0"
              suffix="(米/秒)"
            ></a-input>
          </a-col>
        </a-row>
        <a-row>
          <a-col :span="8" class="col">
            波浪个数
          </a-col>
          <a-col :span="16">
            <a-input
              :value="form.frequency"
              type="number"
              min="0"
              suffix="(个)"
            ></a-input>
          </a-col>
        </a-row>
        <a-row>
          <a-col :span="8" class="col">
            波浪速度
          </a-col>
          <a-col :span="16">
            <a-input :value="form.animationSpeed" min="0" step="0.01"></a-input>
          </a-col>
        </a-row>
        <a-row>
          <a-col :span="8" class="col">
            波浪高度
          </a-col>
          <a-col :span="16">
            <a-input
              :value="form.amplitude"
              type="number"
              min="0"
              suffix="(米)"
            ></a-input>
          </a-col>
        </a-row>
        <a-row>
          <a-col :span="8" class="col">
            颜色
          </a-col>
          <a-col :span="16">
            <a-popover trigger="click">
              <template slot="content">
                <sketch-picker
                  :disableAlpha="true"
                  :value="form.floodColor"
                  @input="onColorChange"
                />
              </template>
              <div :style="{ background: form.floodColor }" class="color"></div>
            </a-popover>
          </a-col>
        </a-row>
        <a-row>
          <a-col :span="8" class="col">
            透明度
          </a-col>
          <a-col :span="16">
            <a-input
              :value="form.opacity"
              type="number"
              min="0"
              max="1"
              step="0.1"
            ></a-input>
          </a-col>
        </a-row>
      </a-space>
    </div>
    <div class="btn">
      <a-button type="primary" @click="add">开始分析</a-button>
      <a-button type="primary" @click="rise">升高</a-button>
      <a-button type="primary" @click="down">下降</a-button>
      <a-button type="primary" @click="remove">结束分析</a-button>
    </div>
  </div>
</template>
<script lang="ts">
declare const CesiumZondy
import { Vue, Component, Mixins } from 'vue-property-decorator'
import { WidgetMixin } from '@mapgis/web-app-framework'
import { Sketch } from 'vue-color'
import { utilInstance } from '@mapgis/pan-spatial-map-store'

@Component({
  name: 'MpFlooding',
  components: { 'sketch-picker': Sketch }
})
export default class MpFlooding extends Mixins(WidgetMixin) {
  private form = {
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
    if (this.form.floodColor) {
      const Color = this.form.floodColor.split(',')
      const ColorRgb = {
        green: Number(Color[1] / 255),
        blue: Number(parseInt(Color[2]) / 255),
        red: Number(Color[0].split('(')[1] / 255)
      }
      return new window.Cesium.Color(
        ColorRgb.red,
        ColorRgb.green,
        ColorRgb.blue,
        this.opacity || 0.5
      )
    }
    const ColorRgb = {
      green: 0.2,
      blue: 0.5,
      red: 0.4
    }
    return new window.Cesium.Color(
      ColorRgb.red,
      ColorRgb.green,
      ColorRgb.blue,
      this.opacity || 0.5
    )
  }

  created() {
    window.FloodingManage = {
      drawElement: null,
      flood: null
    }
  }

  // 微件失活时
  onDeActive() {
    this.stopFloodAnalysis()
  }

  add() {
    const { viewer } = window.webGlobe
    // 初始化交互式绘制控件
    window.FloodingManage.drawElement =
      window.FloodingManage.drawElement || new window.Cesium.DrawElement(viewer)
    // 激活交互式绘制工具
    window.FloodingManage.drawElement.startDrawingPolygon({
      // 绘制完成回调函数
      callback: positions => {
        this.remove()
        const {
          minHeight,
          maxHeight,
          speed,
          frequency,
          animationSpeed,
          amplitude
        } = this.form
        // 初始化高级分析功能管理类
        const advancedAnalysisManager = new window.CesiumZondy.Manager.AdvancedAnalysisManager(
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
        window.FloodingManage.flood.floodColor = this.edgeColor

        viewer.scene.globe.depthTestAgainstTerrain = true
        // 添加洪水淹没结果显示
        window.webGlobe.scene.VisualAnalysisManager.add(
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
    window.webGlobe.scene.requestRender()
  }

  /**
   * 洪水下降
   */
  down() {
    window.FloodingManage.flood.maxHeight -= 1000
    window.FloodingManage.flood.isDownFlood = true
    window.webGlobe.scene.requestRender()
  }

  /* 移除洪水淹没分析 */
  stopFloodAnalysis() {
    this.remove()
    window.webGlobe.viewer.entities.removeAll()
  }

  remove() {
    // 判断是否已有洪水淹没分析结果
    if (window.FloodingManage.flood) {
      // 移除洪水淹没分析显示结果
      window.webGlobe.scene.VisualAnalysisManager.remove(
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

  // 颜色拾取器对应事件
  private onColorChange(val) {
    this.form.floodColor = utilInstance.rgbaToString(val.rgba, false)
  }
}
</script>
<style lang="less">
.mp-widget-flooding {
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
