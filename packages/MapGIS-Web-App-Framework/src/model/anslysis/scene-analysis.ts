import * as Zondy from '@mapgis/webclient-es6-service'
import axios from 'axios'

export default class SceneAnalysis {
  public Cesium: any = undefined

  public webGlobe: any = undefined

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

  // 剖切分析
  private targetY = 0.0 // 剖面位置

  // 挖填方分析
  // private digFill: any = undefined

  constructor(Cesium, webGlobe) {
    this.Cesium = Cesium
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

  /**
   * 剖切分析
   * @param {Object} opt
   * @param {String} opt.edgeColor 相切边缘色
   * @param {String} opt.axis 坐标轴
   * @param {String} opt.model 参与剖面的模型
   * @example
   */
  public clippingPlane(opt) {
    const globe = this.webGlobe
    this.targetY = 0.0 // 剖面位置
    let clippingPlane
    let edgeColor
    let tilesetclippingPlanes
    let plane
    let planeEntity
    let transformCenter
    if (opt.edgeColor) {
      const Color = opt.edgeColor.split(',')
      const ColorRgb = {
        green: Number(Color[1] / 255),
        blue: Number(parseInt(Color[2]) / 255),
        red: Number(Color[0].split('(')[1] / 255)
      }
      edgeColor = new this.Cesium.Color(
        ColorRgb.red,
        ColorRgb.green,
        ColorRgb.blue,
        1.0
      )
    }
    if (opt.axis === 'X') {
      clippingPlane = new this.Cesium.ClippingPlane(
        new this.Cesium.Cartesian3(-1.0, 0.0, 0.0),
        0.0
      )
    } else if (opt.axis === 'Y') {
      clippingPlane = new this.Cesium.ClippingPlane(
        new this.Cesium.Cartesian3(0.0, 1.0, 0.0),
        0.0
      )
    } else {
      clippingPlane = new this.Cesium.ClippingPlane(
        new this.Cesium.Cartesian3(0.0, 0.0, -1.0),
        0.0
      )
    }
    const clippingPlanes = new this.Cesium.ClippingPlaneCollection({
      planes: [clippingPlane],
      edgeColor: edgeColor || this.Cesium.Color.WHITE,
      edgeWidth: 1
    })
    this.removeClippingPlane()
    for (let j = 0; j < opt.model.length; j += 1) {
      for (let i = 0; i < globe._appendCollection.length; i += 1) {
        if (
          opt.model[j].name === globe._appendCollection[i].name &&
          globe._appendCollection[i][0].boundingSphere &&
          globe._appendCollection &&
          opt.model[j].checked
        ) {
          if (
            !this.Cesium.Matrix4.equals(
              globe._appendCollection[i][0].root.transform,
              this.Cesium.Matrix4.IDENTITY
            )
          ) {
            // The clipping plane is initially positioned at the tileset's root transform.
            // Apply an additional matrix to center the clipping plane on the bounding sphere center.
            transformCenter = this.Cesium.Matrix4.getTranslation(
              globe._appendCollection[i][0].root.transform,
              new this.Cesium.Cartesian3()
            )
            // var boundingSphere = globe._appendCollection[i][0].boundingSphere;
            // var radius = boundingSphere.radius;
          }

          globe._appendCollection[i][0].clippingPlanes = clippingPlanes

          // eslint-disable-next-line no-continue
          continue
        }
      }
      for (let i = 0; i < this.tilesetArray.length; i += 1) {
        if (
          this.tilesetArray[i].name === opt.model[j].name &&
          opt.model[j].checked
        ) {
          tilesetclippingPlanes = new this.Cesium.ClippingPlaneCollection({
            planes: [clippingPlane],
            edgeColor: edgeColor || this.Cesium.Color.WHITE,
            edgeWidth: 1,
            modelMatrix: this.Cesium.Transforms.eastNorthUpToFixedFrame(
              transformCenter
            )
          })
          this.tilesetArray[i].clippingPlanes = tilesetclippingPlanes

          // eslint-disable-next-line no-continue
          continue
        }
      }
    }

    for (let i = 0; i < clippingPlanes.length; ++i) {
      plane = clippingPlanes.get(i)
      planeEntity = globe.viewer.entities.add({
        position: transformCenter,
        plane: {
          dimensions: new this.Cesium.Cartesian2(10, 10),
          material: this.Cesium.Color.WHITE.withAlpha(0.0),
          plane: new this.Cesium.CallbackProperty(
            this.createPlaneUpdateFunction(plane),
            false
          )
        }
      })
    }
    if (tilesetclippingPlanes) {
      for (let i = 0; i < tilesetclippingPlanes.length; ++i) {
        plane = tilesetclippingPlanes.get(i)
        planeEntity = this.webGlobe.viewer.entities.add({
          position: transformCenter,
          plane: {
            dimensions: new this.Cesium.Cartesian2(10, 10),
            material: this.Cesium.Color.WHITE.withAlpha(0.0),
            plane: new this.Cesium.CallbackProperty(
              this.createPlaneUpdateFunction(plane),
              false
            )
          }
        })
      }
    }
  }

  // 清除剖面
  public removeClippingPlane() {
    this.webGlobe.viewer.entities.removeAll()

    for (let i = 0; i < this.webGlobe._appendCollection.length; i += 1) {
      if (this.webGlobe._appendCollection[i][0].clippingPlanes) {
        this.webGlobe._appendCollection[i][0].clippingPlanes.removeAll()
      }
    }
    for (let i = 0; i < this.tilesetArray.length; i += 1) {
      if (this.tilesetArray[i].clippingPlanes) {
        this.tilesetArray[i].clippingPlanes.removeAll()
      }
    }
  }

  // 更新剖面位置
  private createPlaneUpdateFunction(plane) {
    return () => {
      plane.distance = this.targetY
      return plane
    }
  }

  // /**
  //  * 填挖方分析
  //  * @param {Function} callFillDig 填挖方分析成功回调
  //  * @param {Object} opt 填挖方参数
  //  * @param {String} opt.xPaneNum x方向采样点
  //  * @param {String} opt.yPaneNum y方向采样点
  //  * @param {String} opt.heightSmooth 平整高程
  //  */
  // public digFillAyalysis(callFillDig, opt) {
  //   this.digFill = new this.Cesium.CutFillAnalyzeC(this.webGlobe.viewer, {
  //     callBack: callFillDig
  //   })
  //   this.changeInteraction('Polygon', (position: any) => {
  //     this.drawCallBack(position, opt)
  //   })
  // }

  // private drawGreenWall(viewer, positions) {
  //   positions.push(positions[0])
  //   viewer.entities.add({
  //     name: '围栏',
  //     wall: {
  //       positions,
  //       material: this.Cesium.Color.GREEN,
  //       outline: true,
  //       outlineWidth: 2.0
  //     }
  //   })
  // }

  // private drawCallBack(positions, opt) {
  //   this.webGlobe.viewer.entities.removeAll()
  //   this.drawGreenWall(this.webGlobe.viewer, positions)
  //   const { xPaneNum, yPaneNum, heightSmooth } = opt
  //   this.digFill.xPaneNumber = xPaneNum
  //   this.digFill.yPaneNumber = yPaneNum
  //   this.digFill.height = heightSmooth
  //   // eslint-disable-next-line no-underscore-dangle
  //   this.digFill._pointsPolygon = positions
  //   const minMax = this.digFill.getMinAndMaxCartesian()
  //   this.digFill.start(minMax)
  // }

  // /**
  //  * 结束填挖方分析
  //  */
  // public removeDigFillAyalysis() {
  //   const { viewer } = this.webGlobe
  //   if (viewer) {
  //     viewer.entities.removeAll()
  //     this.stopInteraction()
  //   }
  // }

  // /**
  //  * 洪水淹没
  //  * @param {Object} opt
  //  * @param {String} opt.minHeight 设置洪水淹没区域最底高度
  //  * @param {String} opt.maxHeight 设置洪水淹没区域最高高度
  //  * @param {String} opt.floodSpeed 设置洪水上涨速度
  //  */
  // public floodAnalysis(opt) {
  //   this.removeFloodAnalysis()

  //   // 初始化洪水淹没分析类
  //   const floodAnaly = new this.Cesium.FloodAnalysis(this.webGlobe.scene)
  //   // 添加洪水淹没结果显示
  //   this.webGlobe.scene.VisualAnalysisManager.add(floodAnaly)
  //   this.changeInteraction('Polygon', (positions: any) => {
  //     positions.push(positions[0])
  //     // 设置洪水淹没分析区域点集
  //     floodAnaly.dotsList = positions
  //     floodAnaly.minHeight = opt.minHeight || 0
  //     floodAnaly.maxHeight = opt.maxHeight || 10000
  //     floodAnaly.floodSpeed = opt.floodSpeed || 200
  //   })
  // }

  // /**
  //  * 结束洪水淹没
  //  */
  // public removeFloodAnalysis() {
  //   this.webGlobe.scene.VisualAnalysisManager.removeAll()
  //   // 取消交互式绘制矩形事件激活状态
  //   this.stopInteraction()

  //   this.webGlobe.viewer.entities.removeAll()
  // }
}
