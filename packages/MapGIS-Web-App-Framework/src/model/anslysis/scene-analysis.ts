import * as Zondy from '@mapgis/webclient-es6-service'
import axios from 'axios'

export default class SceneAnalysis {
  private Cesium: any = undefined

  private CesiumZondy: any = undefined

  private webGlobe: any = undefined

  // 可视域分析
  private visualAnalysis: any = undefined

  private tilesetArray: any[] = [] // 模型缓存和倾斜摄影数据

  private viewsAnaEvent = false // 可视域分析

  private visiblityEvent = false // 通视分析

  private visualAnalysisAction = false // 可视域状态

  private visualAnalysising = false // 是否正在执行 可视域分析

  // 通视分析
  private isViewPoint = false

  private visibliyState = false

  private visiblityAnalysising = false

  private visiblityActive = false

  private visAnalysis: any = null

  constructor(Cesium, CesiumZondy, webGlobe) {
    this.Cesium = Cesium
    this.CesiumZondy = CesiumZondy
    this.webGlobe = webGlobe
  }

  /**
   * 可视域分析
   * @param {Object} opt
   * @param {Number} [opt.azimuthAngle] 方位角
   * @param {Number} [opt.horizontAngle] 水平夹角
   * @param {Number} [opt.pitchAngle] 俯仰角
   * @param {Number} [opt.verticalAngle] 垂直夹角
   * @param {String} [opt.unVisibleColor] 不可视区域颜色
   * @param {String} [opt.visibleColor] 可视区域颜色
   * @param {String} [opt.fanColor] 遮罩颜色
   * @example
   * viewshedAnalysis({
   *   azimuthAngle: azimuthAngle,
   *   horizontAngle: horizontAngle,
   *   pitchAngle: pitchAngle,
   *   verticalAngle: verticalAngle
   *   unVisibleColor: unVisibleColor,
   *   visibleColor: visibleColor,
   *   fanColor: fanColor,
   * })
   */
  public viewshedAnalysis(opt: Record<string, any>) {
    // 锁定图层帧数,只显示一个可视域结果
    for (let i = 0; i < this.tilesetArray.length; i += 1) {
      this.tilesetArray[i].debugFreezeFrame = true
    }

    // 移除可视域分析结果
    this.webGlobe.viewer.scene.VisualAnalysisManager.removeAll()
    this.viewsAnaEvent = true

    this.visualAnalysis = new this.Cesium.ViewshedAnalysis()
    this.visualAnalysis.azimuthAngle =
      opt.azimuthAngle || this.visualAnalysis.azimuthAngle // 方位角

    this.visualAnalysis.horizontAngle =
      opt.horizontAngle || this.visualAnalysis.horizontAngle // 水平夹角

    this.visualAnalysis.pitchAngle =
      opt.pitchAngle || this.visualAnalysis.pitchAngle // 俯仰角

    this.visualAnalysis.verticalAngle =
      opt.verticalAngle || this.visualAnalysis.verticalAngle // 垂直夹角
    if (opt.unVisibleColor) {
      const unVisibleColor = opt.unVisibleColor.split(',')
      const unVisibleColorRgb = {
        green: unVisibleColor[1] / 255,
        // eslint-disable-next-line radix
        blue: parseInt(unVisibleColor[2]) / 255,
        red: unVisibleColor[0].split('(')[1] / 255
      }
      this.visualAnalysis.unVisibleColor = new this.Cesium.Color(
        unVisibleColorRgb.red,
        unVisibleColorRgb.green,
        unVisibleColorRgb.blue,
        1
      )
    }
    if (opt.visibleColor) {
      const visibleColor = opt.visibleColor.split(',')
      const visibleColorRgb = {
        green: visibleColor[1] / 255,
        // eslint-disable-next-line radix
        blue: parseInt(visibleColor[2]) / 255,
        red: visibleColor[0].split('(')[1] / 255
      }
      this.visualAnalysis.visibleColor = new this.Cesium.Color(
        visibleColorRgb.red,
        visibleColorRgb.green,
        visibleColorRgb.blue,
        1
      )
    }
    if (opt.fanColor) {
      const fanColor = opt.fanColor.split(',')
      const fanColorRgb = {
        green: fanColor[1] / 255,
        // eslint-disable-next-line radix
        blue: parseInt(fanColor[2]) / 255,
        red: fanColor[0].split('(')[1] / 255
      }

      this.visualAnalysis._fanColor = new this.Cesium.Color(
        fanColorRgb.red,
        fanColorRgb.green,
        fanColorRgb.blue,
        0.2
      )
    }

    this.webGlobe.viewer.scene.VisualAnalysisManager.add(this.visualAnalysis)
    // 定义可视域状态
    this.visualAnalysisAction = true
    // 定义是否正在执行 可视域分析
    this.visualAnalysising = false
  }

  /**
   * 结束可视域分析
   */
  public removeViewshedAnalysis() {
    for (let i = 0; i < this.tilesetArray.length; i += 1) {
      this.tilesetArray[i].debugFreezeFrame = false
    }
    this.viewsAnaEvent = false
    this.visualAnalysis = null
    // 移除通视分析结果
    this.webGlobe.viewer.scene.VisualAnalysisManager.removeAll()
  }

  /**
   * 通视分析
   * @param {Boolean} isViewPoint 选择以观察点为起始点{true为以观察点为起始点，false以目标点为起始点}
   * @example
   *
   */
  public visiblityAnalysis(isViewPoint) {
    // 锁定当前帧数，只显示一个分析结果
    for (let i = 0; i < this.tilesetArray.length; i += 1) {
      this.tilesetArray[i].debugFreezeFrame = true
    }
    this.isViewPoint = isViewPoint || true
    this.visibliyState = true

    this.visiblityAnalysising = false
    this.visiblityActive = true
    this.visiblityEvent = true
  }

  /**
   * 结束通视分析
   */
  public removeVisiblityAnalysis() {
    // 取消锁帧
    for (let i = 0; i < this.tilesetArray.length; i += 1) {
      this.tilesetArray[i].debugFreezeFrame = false
    }
    this.visiblityEvent = false
    this.visAnalysis = null
    this.webGlobe.viewer.entities.removeAll()
    // 移除通视分析结果
    this.webGlobe.viewer.scene.VisualAnalysisManager.removeAll()
  }
}
