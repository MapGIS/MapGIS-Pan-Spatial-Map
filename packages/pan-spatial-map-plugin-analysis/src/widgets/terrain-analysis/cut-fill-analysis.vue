<template>
  <div class="mp-widget-cut-fill-analysis">
    <mp-group-tab title="参数设置"></mp-group-tab>
    <mp-setting-form>
      <a-form-item label="x方向采样点个数">
        <a-input v-model.number="formData.x" type="number" min="0" />
      </a-form-item>
      <a-form-item label="y方向采样点个数">
        <a-input v-model.number="formData.y" type="number" min="0" />
      </a-form-item>
      <a-form-item label="填挖规整高度">
        <a-input v-model.number="formData.z" type="number" min="0" />
      </a-form-item>
    </mp-setting-form>
    <mp-group-tab title="填挖结果"></mp-group-tab>
    <mp-setting-form>
      <a-form-item label="高程范围">
        <a-input v-model.number="result.height" disabled />
      </a-form-item>
      <a-form-item label="表面积">
        <a-input v-model.number="result.surfaceArea" disabled />
      </a-form-item>
      <a-form-item label="挖体积">
        <a-input v-model.number="result.cutVolume" disabled />
      </a-form-item>
      <a-form-item label="填体积">
        <a-input v-model.number="result.fillVolume" disabled />
      </a-form-item>
    </mp-setting-form>
    <div class="mp-footer-actions">
      <a-button type="primary" @click="add">分析</a-button>
      <a-button @click="remove">清除</a-button>
    </div>
  </div>
</template>
<script lang="ts">
import { Vue, Component, Mixins, Watch } from 'vue-property-decorator'
import { WidgetMixin, CommonUtil } from '@mapgis/web-app-framework'

@Component({
  name: 'MpCutFillAnalysis',
  components: {}
})
export default class MpCutFillAnalysis extends Mixins(WidgetMixin) {
  private formData = {
    x: 16,
    y: 16,
    z: 2000
  }

  private result = {
    height: '',
    surfaceArea: '',
    cutVolume: '',
    fillVolume: ''
  }

  private positions = null

  // get z() {
  //   return this.formData.z
  // }

  @Watch('formData.z', { deep: true })
  changeZ() {
    if (!this.positions) {
      return
    }
    const self = this
    // self.startFill
    CommonUtil.debounce(self.startFill, 200, true)
  }

  created() {
    window.CutFillAnalyzeManage = {
      drawElement: null,
      cutFill: null
    }
  }

  onActive() {}

  // 微件失活时
  onDeActive() {
    this.stopCutFillM()
  }

  add() {
    this.reset()
    this.remove()

    // 初始化交互式绘制控件
    window.CutFillAnalyzeManage.drawElement =
      window.CutFillAnalyzeManage.drawElement ||
      new this.Cesium.DrawElement(this.webGlobe.viewer)
    // 激活交互式绘制工具
    window.CutFillAnalyzeManage.drawElement.startDrawingPolygon({
      // 绘制完成回调函数
      callback: positions => {
        this.stopDraw()
        this.positions = positions
        this.startFill()
      }
    })
  }

  // 开始分析
  startFill() {
    const { positions } = this
    // console.log('startFill')
    const { viewer } = this.webGlobe
    const { x, y, z } = this.formData
    // 移除视图中所有的实体对象
    viewer.entities.removeAll()

    // 在视图中添加围栏实体
    viewer.entities.add({
      id: 'cutfill',
      // 实体名称
      name: '围栏',
      // 示例类型
      wall: {
        // 实体点数组
        positions,
        // 实体材质
        material: new this.Cesium.Color(0.2, 0.5, 0.4, 0.7),
        // 实体轮廓
        outline: true
      }
    })
    // 初始化高级分析功能管理类
    const advancedAnalysisManager = new this.CesiumZondy.Manager.AdvancedAnalysisManager(
      {
        viewer
      }
    )
    // 创建填挖方实例
    window.CutFillAnalyzeManage.cutFill = advancedAnalysisManager.createCutFill(
      2.0,
      {
        // 设置x方向采样点个数
        xPaneNum: x <= 0 ? 16 : x,
        // 设置y方向采样点个数参数
        yPaneNum: y <= 0 ? 16 : y,
        // 设置填挖规整高度
        height: z <= 0 ? 2000 : z,
        // 返回结果的回调函数
        callback: result => {
          this.result = {
            height: `${result.minHeight.toFixed(2)}~${result.maxHeight.toFixed(
              2
            )}`,
            surfaceArea: result.surfaceArea,
            cutVolume: result.cutVolume,
            fillVolume: result.fillVolume
          }
        }
      }
    )
    // 开始执行填挖方分析
    advancedAnalysisManager.startCutFill(
      window.CutFillAnalyzeManage.cutFill,
      positions
    )
  }

  // 移除填挖方计算
  stopCutFillM() {
    this.stopDraw()
    this.reset()
    this.remove()
  }

  reset() {
    this.result = {
      height: '',
      surfaceArea: '',
      cutVolume: '',
      fillVolume: ''
    }
  }

  stopDraw() {
    if (window.CutFillAnalyzeManage.drawElement) {
      // 停止交互式绘制工具
      window.CutFillAnalyzeManage.drawElement.stopDrawing()
    }
  }

  remove() {
    if (window.CutFillAnalyzeManage.cutFill) {
      const { viewer } = this.webGlobe
      // 移除视图中所有的实体对象
      viewer.entities.removeById('cutfill')
      window.CutFillAnalyzeManage.cutFill = null
    }
  }
}
</script>
<style lang="less" scoped>
@import '../index.less';

.mp-widget-cut-fill-analysis {
  padding-top: 8px;
}
</style>
