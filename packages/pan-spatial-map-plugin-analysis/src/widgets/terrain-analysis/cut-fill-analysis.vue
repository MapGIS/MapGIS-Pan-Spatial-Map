<template>
  <div class="mp-widget-cut-fill-analysis">
    <div class="setting-panel">
      <a-space direction="vertical" class="space">
        <a-row class="title">
          <div class="space"></div>
          <div class="label">参数设置</div>
        </a-row>
        <a-row>
          <a-col :span="8" class="col">
            x方向采样点个数
          </a-col>
          <a-col :span="16">
            <a-input :value="form.x" type="number" min="0"></a-input>
          </a-col>
        </a-row>
        <a-row>
          <a-col :span="8" class="col">
            y方向采样点个数
          </a-col>
          <a-col :span="16">
            <a-input :value="form.y" type="number" min="0"></a-input>
          </a-col>
        </a-row>
        <a-row>
          <a-col :span="8" class="col">
            填挖规整高度
          </a-col>
          <a-col :span="16">
            <a-input :value="form.z" type="number" min="0"></a-input>
          </a-col>
        </a-row>
      </a-space>
      <a-space direction="vertical" class="space">
        <a-row class="title">
          <div class="space"></div>
          <div class="label">填挖结果</div>
        </a-row>
        <a-row>
          <a-col :span="8" class="col">
            高程范围
          </a-col>
          <a-col :span="16">
            <a-input readonly :value="result.height"></a-input>
          </a-col>
        </a-row>
        <a-row>
          <a-col :span="8" class="col">
            表面积
          </a-col>
          <a-col :span="16">
            <a-input readonly :value="result.surfaceArea"></a-input>
          </a-col>
        </a-row>
        <a-row>
          <a-col :span="8" class="col">
            挖体积
          </a-col>
          <a-col :span="16">
            <a-input readonly :value="result.cutVolume"></a-input>
          </a-col>
        </a-row>
        <a-row>
          <a-col :span="8" class="col">
            填体积
          </a-col>
          <a-col :span="16">
            <a-input readonly :value="result.fillVolume"></a-input>
          </a-col>
        </a-row>
      </a-space>
    </div>
    <div class="btn">
      <a-button type="primary" @click="add">开始分析</a-button>
      <a-button type="primary" @click="remove">结束分析</a-button>
    </div>
  </div>
</template>
<script lang="ts">
declare const CesiumZondy
import { Vue, Component, Mixins } from 'vue-property-decorator'
import { WidgetMixin } from '@mapgis/web-app-framework'

@Component({
  name: 'MpCutFillAnalysis',
  components: {}
})
export default class MpCutFillAnalysis extends Mixins(WidgetMixin) {
  private form = {
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

  created() {
    window.CutFillAnalyzeManage = {
      drawElement: null,
      cutFill: null
    }
  }

  destroyed() {
    this.stopCutFillM()
  }

  add() {
    this.reset()
    this.remove()

    // 初始化交互式绘制控件
    window.CutFillAnalyzeManage.drawElement =
      window.CutFillAnalyzeManage.drawElement ||
      new window.Cesium.DrawElement(window.webGlobe.viewer)
    // 激活交互式绘制工具
    window.CutFillAnalyzeManage.drawElement.startDrawingPolygon({
      // 绘制完成回调函数
      callback: positions => {
        this.stopDraw()
        const { viewer } = window.webGlobe
        const { x, y, z } = this.form
        // 移除视图中所有的实体对象
        viewer.entities.removeAll()
        // 添加填挖方分析显示实体
        // 构造闭合区点数组
        // eslint-disable-next-line prefer-destructuring
        positions[positions.length - 1] = positions[0]
        const transform = this.transformEdit()
        const array = []
        for (let i = 0; i < positions.length; i++) {
          const point = positions[i]
          const resPoint = new window.Cesium.Cartesian3()
          const invserTran = new window.Cesium.Matrix4()
          window.Cesium.Matrix4.inverse(transform, invserTran)
          window.Cesium.Matrix4.multiplyByPoint(invserTran, point, resPoint)
          array.push(
            new window.Cesium.Cartesian3(resPoint.x, resPoint.y, resPoint.z)
          )
        }
        const newArray = []
        for (let arraylength = 0; arraylength < array.length; arraylength++) {
          array[arraylength].z = Number(z)
          const point = array[arraylength]
          const resPoint = new window.Cesium.Cartesian3()
          const invserTran = new window.Cesium.Matrix4()
          window.Cesium.Matrix4.multiplyByPoint(transform, point, resPoint)
          newArray.push(
            new window.Cesium.Cartesian3(resPoint.x, resPoint.y, resPoint.z)
          )
        }
        // 在视图中添加围栏实体
        viewer.entities.add({
          id: 'cutfill',
          // 实体名称
          name: '围栏',
          // 示例类型
          wall: {
            // 实体点数组
            positions: newArray,
            // 实体材质
            material: new window.Cesium.Color(0.2, 0.5, 0.4, 0.7),
            // 实体轮廓
            outline: true
          }
        })
        // 初始化高级分析功能管理类
        const advancedAnalysisManager = new CesiumZondy.Manager.AdvancedAnalysisManager(
          {
            viewer
          }
        )
        // 创建填挖方实例
        window.CutFillAnalyzeManage.cutFill = advancedAnalysisManager.createCutFill(
          0.0,
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
                height: `${result.minHeight.toFixed(
                  2
                )}~${result.maxHeight.toFixed(2)}`,
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
    })
  }

  transformEdit() {
    // 经纬度定位
    const lo = 120.9819
    const la = 23.5307
    // 修改模型高度
    const height = 50.0
    // 定位方法
    let hpr = new window.Cesium.Matrix3()
    // new window.Cesium.HeadingPitchRoll(heading, pitch, roll)
    // heading围绕负z轴的旋转。pitch是围绕负y轴的旋转。Roll是围绕正x轴的旋转
    const hprObj = new window.Cesium.HeadingPitchRoll(
      window.Cesium.Math.PI,
      window.Cesium.Math.PI,
      window.Cesium.Math.PI
    )
    hpr = window.Cesium.Matrix3.fromHeadingPitchRoll(hprObj, hpr)
    // 2、平移
    // 2.3储存平移的结果
    const modelMatrix = window.Cesium.Matrix4.multiplyByTranslation(
      // 2.1从以度为单位的经度和纬度值返回Cartesian3位置
      // 2.2计算4x4变换矩阵
      window.Cesium.Transforms.eastNorthUpToFixedFrame(
        window.Cesium.Cartesian3.fromDegrees(lo, la, height)
      ),
      new window.Cesium.Cartesian3(),
      new window.Cesium.Matrix4()
    )
    /// 3、应用旋转
    // window.Cesium.Matrix4.multiplyByMatrix3 （矩阵，旋转，结果）
    window.Cesium.Matrix4.multiplyByMatrix3(modelMatrix, hpr, modelMatrix)
    return modelMatrix
  }

  // 移除填挖方计算
  stopCutFillM() {
    // const { viewer } = window.webGlobe
    // // 移除视图中所有的实体对象
    // viewer.entities.removeAll()
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
      const { viewer } = window.webGlobe
      // 移除视图中所有的实体对象
      viewer.entities.removeById('cutfill')
      window.CutFillAnalyzeManage.cutFill = null
    }
  }
}
</script>
<style lang="less">
.mp-widget-cut-fill-analysis {
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
