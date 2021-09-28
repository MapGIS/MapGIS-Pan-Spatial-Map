<template>
  <div class="mp-widget-cut-fill-analysis">
    <mp-group-tab title="参数设置">
      <mp-toolbar slot="handle" :bordered="false">
        <mp-toolbar-command
          icon="reload"
          title="重新计算"
          @click="startFill"
          :disabled="!recalculate"
        ></mp-toolbar-command>
      </mp-toolbar>
    </mp-group-tab>
    <mp-setting-form>
      <a-form-item label="x方向采样点数">
        <a-input v-model.number="formData.x" type="number" min="0" />
      </a-form-item>
      <a-form-item label="y方向采样点数">
        <a-input v-model.number="formData.y" type="number" min="0" />
      </a-form-item>
      <a-form-item label="填挖规整高度">
        <a-input
          v-model.number="formData.z"
          type="number"
          min="0"
          addon-after="(米)"
        />
      </a-form-item>
    </mp-setting-form>
    <mp-group-tab title="样式设置"></mp-group-tab>
    <mp-setting-form>
      <a-form-item label="边线">
        <MpColorPicker
          :color.sync="style.lineColor"
          :disableAlpha="false"
          class="color-picker"
        ></MpColorPicker>
      </a-form-item>
      <a-form-item label="填充">
        <MpColorPicker
          :color.sync="style.fillColor"
          :disableAlpha="false"
          class="color-picker"
        ></MpColorPicker>
      </a-form-item>
    </mp-setting-form>
    <mp-group-tab title="填挖结果"></mp-group-tab>
    <mp-setting-form>
      <a-form-item label="高程范围">
        <a-input v-model.number="result.height" disabled addon-after="(米)" />
      </a-form-item>
      <a-form-item label="表面积">
        <a-input
          v-model.number="result.surfaceArea"
          disabled
          addon-after="(平方米)"
        />
      </a-form-item>
      <a-form-item label="挖体积">
        <a-input
          v-model.number="result.cutVolume"
          disabled
          addon-after="(立方米)"
        />
      </a-form-item>
      <a-form-item label="填体积">
        <a-input
          v-model.number="result.fillVolume"
          disabled
          addon-after="(立方米)"
        />
      </a-form-item>
    </mp-setting-form>
    <div class="mp-footer-actions">
      <a-button type="primary" @click="analysis">分析</a-button>
      <a-button @click="stopCutFillM">清除</a-button>
    </div>
  </div>
</template>
<script lang="ts">
import { Vue, Component, Mixins, Watch } from 'vue-property-decorator'
import { WidgetMixin, Objects } from '@mapgis/web-app-framework'

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

  private style = {
    lineColor: 'rgba(0,255,0,1)',
    fillColor: 'rgba(0,0,255,0.3)'
  }

  private result = {
    height: '',
    surfaceArea: '',
    cutVolume: '',
    fillVolume: ''
  }

  private positions = null

  private recalculate = false

  private loading = null

  private entityController = null

  private terrainLine = null

  private terrainPolygon = null

  private depthTestAgainstTerrain = false // 深度检测是否已开启

  @Watch('formData', { deep: true, immediate: true })
  changeFormData() {
    if (this.positions) {
      this.recalculate = true
    }
  }

  created() {
    window.CutFillAnalyzeManage = {
      drawElement: null,
      cutFill: null
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
    this.stopCutFillM()
  }

  /**
   * rgba转cesium内部颜色
   */
  getColor(rgba) {
    return Objects.SceneController.getInstance(
      this.Cesium,
      this.CesiumZondy,
      this.webGlobe
    ).colorToCesiumColor(rgba)
  }

  /**
   * 打开分析提示遮罩层
   */
  showLoading() {
    if (!this.loading) {
      this.loading = this.$portal.show(
        {
          tip: '正在分析中，请稍等'
        },
        document.querySelector('.mp-map-container')
      )
    }
  }

  /**
   * 移除分析提示遮罩层
   */
  removeLoading() {
    if (this.loading) {
      this.loading = null
      this.$portal.remove()
    }
  }

  /**
   * 分析
   */
  analysis() {
    const lineColor = this.getColor(this.style.lineColor)
    const fillColor = this.getColor(this.style.fillColor)

    const { viewer } = this.webGlobe
    // 初始化交互式绘制控件
    window.CutFillAnalyzeManage.drawElement =
      window.CutFillAnalyzeManage.drawElement ||
      new this.Cesium.DrawElement(viewer)
    // 激活交互式绘制工具
    window.CutFillAnalyzeManage.drawElement.startDrawingPolygon({
      // 绘制完成回调函数
      callback: positions => {
        this.stopDraw()
        this.remove()

        this.positions = positions

        const linePointArr = []
        const polygonPointArr = []
        positions.forEach(element => {
          const { lon, lat, height } = this.cartesianToDegrees(element)
          linePointArr.push(lon)
          linePointArr.push(lat)
          polygonPointArr.push(lon)
          polygonPointArr.push(lat)
          polygonPointArr.push(height)
        })

        // 构造几何绘制控制对象
        this.entityController = new this.CesiumZondy.Manager.EntityController({
          viewer
        })

        // 绘制贴地形线
        this.terrainLine = this.entityController.appendLine(
          // 名称
          '贴地形线',
          // 点数组
          linePointArr,
          // 线宽
          3,
          // 线颜色
          lineColor,
          // 是否识别带高度的坐标
          false,
          // 是否贴地形
          true,
          // 附加属性
          {}
        )

        // 构造区对象
        const polygon = {
          // 区
          polygon: {
            // 坐标
            hierarchy: this.Cesium.Cartesian3.fromDegreesArrayHeights(
              polygonPointArr
            ),
            // 颜色
            material: fillColor,
            // 分类类型：地形类型
            classificationType: this.Cesium.ClassificationType.TERRAIN
          }
        }
        // 绘制图形通用方法：对接Cesium原生特性
        this.terrainPolygon = this.entityController.appendGraphics(polygon)

        this.startFill()
      }
    })
  }

  cartesianToDegrees(cartesian) {
    const { ellipsoid } = this.webGlobe.scene.globe
    // 将笛卡尔坐标转换为地理坐标
    const cartographic = ellipsoid.cartesianToCartographic(cartesian)
    // 将弧度转为度的十进制度表示
    const longitude = this.Cesium.Math.toDegrees(cartographic.longitude) // 转换后的经度
    const latitude = this.Cesium.Math.toDegrees(cartographic.latitude) // 转换后的纬度
    const coor = { lon: longitude, lat: latitude, height: cartographic.height }
    return coor
  }

  // 开始分析
  startFill() {
    const { positions } = this
    this.showLoading()
    if (!positions) {
      this.$message.warning('请绘制分析区域')
      return
    }
    this.reset()
    const { viewer } = this.webGlobe
    const { x, y, z } = this.formData

    viewer.scene.globe.depthTestAgainstTerrain = true
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
        height: z,
        // 返回结果的回调函数
        callback: this.analysisSuccess
      }
    )
    // 开始执行填挖方分析
    advancedAnalysisManager.startCutFill(
      window.CutFillAnalyzeManage.cutFill,
      positions
    )
  }

  analysisSuccess(result) {
    this.result = {
      height: `${result.minHeight.toFixed(2)}~${result.maxHeight.toFixed(2)}`,
      surfaceArea: result.surfaceArea,
      cutVolume: result.cutVolume,
      fillVolume: result.fillVolume
    }
    this.removeLoading()
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
      window.CutFillAnalyzeManage.cutFill = null
    }
    this.positions = null
    this.recalculate = false
    this.removeLoading()

    if (!this.depthTestAgainstTerrain) {
      this.webGlobe.viewer.scene.globe.depthTestAgainstTerrain = false
    }

    if (this.terrainLine) {
      this.entityController.removeEntity(this.terrainLine)
      this.entityController.removeEntity(this.terrainPolygon)
      this.terrainLine = null
      this.terrainPolygon = null
      this.entityController = null
    }
  }
}
</script>
<style lang="less" scoped>
@import '../index.less';

.mp-widget-cut-fill-analysis {
  padding-top: 8px;
  .btn {
    display: flex;
    align-items: center;
    justify-content: flex-end;
  }
}
</style>
