<template>
  <div class="mp-widget-flooding">
    <mp-group-tab title="参数设置">
      <mp-toolbar slot="handle" :bordered="false">
        <mp-toolbar-command
          icon="reload"
          title="重新计算"
          @click="refresh"
          :disabled="!recalculate"
        ></mp-toolbar-command>
      </mp-toolbar>
    </mp-group-tab>
    <mp-setting-form>
      <a-form-item label="淹没最低高度">
        <a-input
          v-model.number="formData.minHeight"
          type="number"
          :max="formData.maxHeight"
          addon-after="(米)"
        />
      </a-form-item>
      <a-form-item label="淹没最高高度">
        <a-input
          v-model.number="formData.maxHeight"
          type="number"
          :min="formData.minHeight"
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
      <!-- <a-form-item label="波浪个数" v-show="false">
        <a-input
          v-model.number="formData.frequency"
          type="number"
          min="0"
          addon-after="(个)"
        />
      </a-form-item>
      <a-form-item label="波浪速度" v-show="false">
        <a-input
          v-model.number="formData.animationSpeed"
          type="number"
          min="0"
          step="0.01"
          addon-after="(米/秒)"
        />
      </a-form-item>
      <a-form-item label="波浪高度" v-show="false">
        <a-input
          v-model.number="formData.amplitude"
          type="number"
          min="0"
          addon-after="(米)"
        />
      </a-form-item> -->
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
      <!-- <a-button type="primary" @click="rise">升高</a-button>
      <a-button type="primary" @click="down">下降</a-button> -->
      <a-button @click="remove">清除</a-button>
    </div>
  </div>
</template>
<script lang="ts">
import { Vue, Component, Mixins, Watch } from 'vue-property-decorator'
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
    floodColor: 'rgba(149,232,249,0.5)'
  }

  private positions = null

  private recalculate = false // 是否重新计算

  private depthTestAgainstTerrain = false // 深度检测是否已开启

  private mHeight = this.formData.maxHeight // 淹没最高高度变化前的值

  private timer = null

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

  @Watch('formData.minHeight', { deep: true, immediate: true })
  @Watch('formData.speed', { deep: true, immediate: true })
  @Watch('formData.floodColor', { deep: true, immediate: true })
  changeFormData() {
    if (this.positions) {
      this.recalculate = true
    }
  }

  @Watch('formData.maxHeight', { deep: true, immediate: true })
  changeMaxHeight() {
    if (!window.FloodingManage || !window.FloodingManage.flood) {
      return
    }
    if (!this.timer) {
      this.timer = setTimeout(() => {
        if (this.timer) clearTimeout(this.timer)
        this.timer = null
        const { maxHeight } = this.formData
        window.FloodingManage.flood.maxHeight = maxHeight
        if (this.mHeight > maxHeight) {
          // 下降
          window.FloodingManage.flood.isDownFlood = true
        } else if (this.mHeight < maxHeight) {
          // 上升
          window.FloodingManage.flood.isDownFlood = false
        }
        this.mHeight = maxHeight
        this.webGlobe.scene.requestRender()
      }, 1000)
    }
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
    this.remove()
  }

  add() {
    const { viewer } = this.webGlobe
    // 初始化交互式绘制控件
    window.FloodingManage.drawElement =
      window.FloodingManage.drawElement || new this.Cesium.DrawElement(viewer)

    // 激活交互式绘制工具
    window.FloodingManage.drawElement.startDrawingPolygon({
      // 绘制完成回调函数
      callback: positions => {
        this.remove()
        this.positions = positions
        this.analysis()
      }
    })
  }

  /**
   * 分析
   */
  analysis() {
    const { positions } = this
    if (!positions) {
      this.$message.warning('请绘制分析区域')
      return
    }
    const { viewer } = this.webGlobe
    const {
      minHeight,
      maxHeight,
      speed,
      frequency,
      animationSpeed,
      amplitude
    } = this.formData
    // 初始化高级分析功能管理类
    const advancedAnalysisManager = new this.CesiumZondy.Manager.AdvancedAnalysisManager(
      {
        viewer: viewer
      }
    )
    // 初始化洪水淹没分析类
    window.FloodingManage.flood =
      window.FloodingManage.flood ||
      advancedAnalysisManager.createFlood(positions, {
        // 设置洪水淹没区域动画最低高度
        minHeight: Number(minHeight >= 0 ? 0 : minHeight), // 设置洪水淹没区域动画最低高度
        // 设置洪水淹没区域最高高度
        maxHeight: Number(maxHeight <= 0 ? 2000 : maxHeight),
        // 设置洪水上涨速度
        floodSpeed: Number(speed <= 0 ? 1 : speed)
      })

    // 洪水淹没区域最低高度
    window.FloodingManage.flood.startHeight = Number(
      minHeight <= 0 ? 0 : minHeight
    )
    // 洪水颜色
    window.FloodingManage.flood.floodColor = this.edgeColor
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

    if (!this.depthTestAgainstTerrain) {
      viewer.scene.globe.depthTestAgainstTerrain = true
    }
    // 添加洪水淹没结果显示
    this.webGlobe.scene.VisualAnalysisManager.add(window.FloodingManage.flood)
    this.mHeight = maxHeight
  }

  /**
   * 洪水涨高
   */
  // rise() {
  //   const maxHeight = this.formData.maxHeight + 1000
  //   this.$set(this.formData, 'maxHeight', maxHeight)
  //   window.FloodingManage.flood.maxHeight = maxHeight
  //   window.FloodingManage.flood.isDownFlood = false
  //   this.webGlobe.scene.requestRender()
  // }

  /**
   * 洪水下降
   */
  // down() {
  //   const maxHeight = this.formData.maxHeight - 1000
  //   this.$set(this.formData, 'maxHeight', maxHeight)
  //   window.FloodingManage.flood.maxHeight = maxHeight
  //   window.FloodingManage.flood.isDownFlood = true
  //   this.webGlobe.scene.requestRender()
  // }

  /**
   * 重新计算
   */
  refresh() {
    this.removeFlood()
    this.analysis()
  }

  /**
   * 移除洪水淹没对象
   */
  removeFlood() {
    // 判断是否已有洪水淹没分析结果
    if (window.FloodingManage.flood) {
      // 移除洪水淹没分析显示结果
      this.webGlobe.scene.VisualAnalysisManager.remove(
        window.FloodingManage.flood
      )
      window.FloodingManage.flood = null
    }
  }

  /**
   * 移除洪水淹没分析
   */
  remove() {
    this.removeFlood()
    if (window.FloodingManage.drawElement) {
      // 取消交互式绘制矩形事件激活状态
      window.FloodingManage.drawElement.stopDrawing()
      window.FloodingManage.drawElement = null
    }

    if (!this.depthTestAgainstTerrain) {
      this.webGlobe.viewer.scene.globe.depthTestAgainstTerrain = false
    }

    this.positions = null
    this.recalculate = false
  }
}
</script>
<style lang="less" scoped>
@import '../index.less';

.mp-widget-flooding {
  padding-top: 8px;
}
</style>
