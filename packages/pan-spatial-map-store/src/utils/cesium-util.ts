import utilInstance from './util'

class CesiumUtil {
  // 地图默认站点
  server = {
    ip: '',
    port: '',
    guid: ''
  }

  // 地图文档图层信息
  docInfo = {}

  // 二维图形类型
  graphType = {
    POINT: 'Point',
    BOX: 'Box',
    LINESTRING: 'LineString',
    POLYGON: 'Polygon',
    CIRCLE: 'Circle'
  }

  // 测量工具类型
  measureToolType = {
    TRIANGULATION: 'triangulation',
    AREA: 'area',
    LENGTH: 'length'
  }

  private featureStyleConfig: Record<string, any> = []

  private globeArray: any[] = [] // 服务数组

  private entityArray: any[] = [] // 实体数组

  private dataSourcesArray: any[] = [] // 本地数据源数组

  private terrainArray: any[] = [] // 地形数据数组

  private tilesetArray: any[] = [] // 模型缓存和倾斜摄影数据

  private popupArray: any[] = [] // PopUP数组（只有一个）

  private VTTILESArray: any[] = [] // 矢量瓦片数组

  private markerOptions: any[] = [] // 标注点的参数feature信息进行存储

  private markerEvent = false // 标识标注点的鼠标事件是否执行

  private scenceModel: any = undefined

  private current: Record<string, any> = {} // 当前hover的要素和颜色，为模型缓存和倾斜摄影的鼠标事件的标识

  private tilesetMoveEvent = false

  private tilesetClickEvent = false

  private viewsAnaEvent = false // 可视域分析

  private visiblityEvent = false // 通视分析

  private isViewPoint = false

  private visibliyState = false

  private visiblityAnalysising = false

  private visiblityActive = false

  private visAnalysis: any = null

  private digFill: any = undefined

  private targetY = 0.0

  private vector: Record<string, any> = {}

  private visualManage: any = undefined // 可视模型类型管理

  private lineColor: any = undefined // 线要素，或者区的边线颜色

  private lineSize = 2

  private pntColor: any = undefined // 点要素

  private ptnSize = 20

  private regColor: any = undefined // 区要素

  // 标注
  // 文字颜色
  private textColor: any = undefined // 标注|文字颜色

  private fontSize = '14'

  private fontFamily = '宋体'

  private visualAnalysis: any = undefined

  private visualAnalysisAction = false

  private visualAnalysising = false

  public Cesium: any = undefined

  public webGlobe: any = undefined

  /**
   * 设置Cesium和webGlobe，在调用改类后，调用该函数，方便其他函数的使用
   * @param cesium
   * @param webGlobe
   */
  setCesiumGlobe(cesium: any, webGlobe: any) {
    if (!this.Cesium) {
      this.Cesium = cesium
    }
    if (!this.webGlobe) {
      this.webGlobe = webGlobe
    }
    this.registerGlobeMouseEvent()
  }

  init() {
    this.globeArray = [] // 服务数组
    this.entityArray = [] // 实体数组
    this.dataSourcesArray = [] // 本地数据源数组
    this.terrainArray = [] // 地形数据数组
    this.tilesetArray = [] // 模型缓存和倾斜摄影数据
    this.popupArray = [] // PopUP数组（只有一个）
    this.VTTILESArray = [] // 矢量瓦片数组
    this.markerOptions = [] // 标注点的参数feature信息进行存储
    this.markerEvent = false // 标识标注点的鼠标事件是否执行
    this.scenceModel = undefined
    this.current = {
      // 当前hover的要素和颜色，为模型缓存和倾斜摄影的鼠标事件的标识
      feature: undefined,
      originalColor: new this.Cesium.Color()
    }
    this.tilesetMoveEvent = false
    this.tilesetClickEvent = false
    this.viewsAnaEvent = false // 可视域分析
    this.visiblityEvent = false // 通视分析
    this.vector = {}
    this.visualManage = undefined // 可视模型类型管理
    const styleConfig = this.featureStyleConfig
    // 线要素，或者区的边线颜色
    this.lineColor = this.Cesium.Color.BLUE
    if (styleConfig.feature.line.color !== '') {
      const lineColor = styleConfig.feature.line.color // "rgba(0,0,204,1)"
      this.lineColor = this.changeColorToCesiumColor(lineColor)
    }
    this.lineSize =
      styleConfig.feature.line.size !== ''
        ? Number(styleConfig.feature.line.size)
        : 2

    // 点要素
    this.pntColor = this.webGlobe.getColor(1, 1, 1, 1)
    if (styleConfig.feature.pnt.color !== '') {
      const pntColor = styleConfig.feature.pnt.color // "rgba(0,0,204,1)"
      this.pntColor = this.changeColorToCesiumColor(pntColor)
    }
    this.ptnSize =
      styleConfig.feature.pnt.size !== ''
        ? Number(styleConfig.feature.pnt.size)
        : 20

    // 区要素
    this.regColor = this.webGlobe.getColor(1, 1, 1, 0.5)
    if (styleConfig.feature.reg.color !== '') {
      const regColor = styleConfig.feature.reg.color // "rgba(0,0,204,1)"
      this.regColor = this.changeColorToCesiumColor(regColor)
    }

    // 标注
    // 文字颜色
    this.textColor = this.Cesium.Color.WHITE
    if (styleConfig.label.text.color !== '') {
      const textColor = styleConfig.label.text.color // "rgba(0,0,204,1)"
      this.textColor = this.changeColorToCesiumColor(textColor)
    }
    this.fontSize =
      styleConfig.label.text.fontSize !== ''
        ? styleConfig.label.text.fontSize
        : '14'
    this.fontFamily =
      styleConfig.label.text.fontFamily !== ''
        ? styleConfig.label.text.fontFamily
        : '宋体'
  }

  /**
   * RGB/RGBA转Cesium内部颜色值
   * @param {string} color rgb/rgba颜色值
   */
  changeColorToCesiumColor(color: string) {
    let cesiumColor
    if (color.includes('rgb')) {
      // 如果是rgb或者rgba
      const a = color.substr(5, color.length - 6)
      const arr = a.split(',')
      const cesiumRed = Number((Number(arr[0]) / 255).toFixed(2))
      const cesiumGreen = Number((Number(arr[1]) / 255).toFixed(2))
      const cesiumBlue = Number((Number(arr[2]) / 255).toFixed(2))
      const cesiumAlpha = Number(arr[3] ? arr[3] : 1)
      cesiumColor = this.webGlobe.getColor(
        cesiumRed,
        cesiumGreen,
        cesiumBlue,
        cesiumAlpha
      )
    }
    return cesiumColor
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
   * Zondy.OneMap.BaseGlobe.viewshedAnalysis({
   *   azimuthAngle: azimuthAngle,
   *   horizontAngle: horizontAngle,
   *   pitchAngle: pitchAngle,
   *   verticalAngle: verticalAngle
   *   unVisibleColor: unVisibleColor,
   *   visibleColor: visibleColor,
   *   fanColor: fanColor,
   * })
   */
  viewshedAnalysis(opt: Record<string, any>) {
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
      // eslint-disable-next-line no-underscore-dangle
      this.visualAnalysis._fanColor = new this.Cesium.Color(
        fanColorRgb.red,
        fanColorRgb.green,
        fanColorRgb.blue,
        0.2
      )
    }

    this.webGlobe.viewer.scene.VisualAnalysisManager.add(this.visualAnalysis)
    // 定义 可视域状态
    this.visualAnalysisAction = true
    // 定义是否正在执行 可视域分析
    this.visualAnalysising = false
  }

  /**
   * 结束可视域分析
   */
  removeViewshedAnalysis() {
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
   *  Zondy.OneMap.Globe.BaseGlobe.visiblityAnalysis(isViewPoint)
   *
   */
  visiblityAnalysis(isViewPoint) {
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
  removeVisiblityAnalysis() {
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

  // /**
  //  * 填挖方分析
  //  * @param {Function} callFillDig 填挖方分析成功回调
  //  * @param {Object} opt 填挖方参数
  //  * @param {String} opt.xPaneNum x方向采样点
  //  * @param {String} opt.yPaneNum y方向采样点
  //  * @param {String} opt.heightSmooth 平整高程
  //  * @example
  //  *  Zondy.OneMap.Globe.BaseGlobe.DigFillAyalysis(callFillDig, drawCallBack)
  //  */
  // digFillAyalysis(callFillDig, opt) {
  //   this.digFill = new this.Cesium.CutFillAnalyzeC(this.webGlobe.viewer, {
  //     callBack: callFillDig
  //   })
  //   this.changeInteraction('Polygon', (position: any) => {
  //     this.drawCallBack(position, opt)
  //   })
  // }

  // drawGreenWall(viewer, positions) {
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

  // drawCallBack(positions, opt) {
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
  // removeDigFillAyalysis() {
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
  // floodAnalysis(opt) {
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
  // removeFloodAnalysis() {
  //   this.webGlobe.scene.VisualAnalysisManager.removeAll()
  //   // 取消交互式绘制矩形事件激活状态
  //   this.stopInteraction()

  //   this.webGlobe.viewer.entities.removeAll()
  // }

  /**
   * 截图
   */
  outputImage() {
    this.webGlobe.outputImage()
  }

  /**
   *
   * @param {Object} opt
   * @param {String} opt.edgeColor 相切边缘色
   * @param {String} opt.axis 坐标轴
   * @param {String} opt.model 参与剖面的模型
   * @example
   * Zondy.OneMap.Globe.BaseGlobe.ClippingPlane(opt)
   */
  clippingPlane(opt) {
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
        // eslint-disable-next-line radix
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
    // var coordinate;
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
      // eslint-disable-next-line no-underscore-dangle
      for (let i = 0; i < globe._appendCollection.length; i += 1) {
        if (
          // eslint-disable-next-line no-underscore-dangle
          opt.model[j].name === globe._appendCollection[i].name &&
          // eslint-disable-next-line no-underscore-dangle
          globe._appendCollection[i][0].boundingSphere &&
          // eslint-disable-next-line no-underscore-dangle
          globe._appendCollection &&
          opt.model[j].checked
        ) {
          if (
            !this.Cesium.Matrix4.equals(
              // eslint-disable-next-line no-underscore-dangle
              globe._appendCollection[i][0].root.transform,
              this.Cesium.Matrix4.IDENTITY
            )
          ) {
            // The clipping plane is initially positioned at the tileset's root transform.
            // Apply an additional matrix to center the clipping plane on the bounding sphere center.
            transformCenter = this.Cesium.Matrix4.getTranslation(
              // eslint-disable-next-line no-underscore-dangle
              globe._appendCollection[i][0].root.transform,
              new this.Cesium.Cartesian3()
            )
            // var boundingSphere = globe._appendCollection[i][0].boundingSphere;
            // var radius = boundingSphere.radius;
          }
          // eslint-disable-next-line no-underscore-dangle
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

    // eslint-disable-next-line no-plusplus
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
      // eslint-disable-next-line no-plusplus
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

  // 更新剖面位置
  createPlaneUpdateFunction(plane) {
    return () => {
      plane.distance = this.targetY
      return plane
    }
  }

  // 清除剖面
  removeClippingPlane() {
    this.webGlobe.viewer.entities.removeAll()
    // eslint-disable-next-line no-underscore-dangle
    for (let i = 0; i < this.webGlobe._appendCollection.length; i += 1) {
      // eslint-disable-next-line no-underscore-dangle
      if (this.webGlobe._appendCollection[i][0].clippingPlanes) {
        // eslint-disable-next-line no-underscore-dangle
        this.webGlobe._appendCollection[i][0].clippingPlanes.removeAll()
      }
    }
    for (let i = 0; i < this.tilesetArray.length; i += 1) {
      if (this.tilesetArray[i].clippingPlanes) {
        this.tilesetArray[i].clippingPlanes.removeAll()
      }
    }
  }

  coordinateConvert(mousePoint: any) {
    if (!this.webGlobe || !this.Cesium) {
      console.log('webGlobe和Cesium缺失')
      return null
    }
    // 通过指定的椭球或者地图对应的坐标系，将鼠标的二维坐标转换为对应椭球体三维坐标
    const { ellipsoid } = this.webGlobe.scene.globe
    let cartesian: any
    if (mousePoint.position) {
      // 拿到屏幕坐标  【屏幕坐标转笛卡尔坐标】
      cartesian = this.webGlobe.viewer.camera.pickEllipsoid(
        mousePoint.position,
        ellipsoid
      )
    } else {
      cartesian = this.webGlobe.viewer.camera.pickEllipsoid(
        mousePoint.endPosition,
        ellipsoid
      )
    }
    if (cartesian) {
      // 将笛卡尔坐标转换为地理坐标
      const cartographic = ellipsoid.cartesianToCartographic(cartesian)
      // 将弧度转为度的十进制度表示
      const longitudeString = this.Cesium.Math.toDegrees(cartographic.longitude) // 转换后的经度
      const latitudeString = this.Cesium.Math.toDegrees(cartographic.latitude) // 转换后的纬度
      const currentCoor = [longitudeString, latitudeString]
      return currentCoor
    }
    return null
  }

  /**
   * 根据给定点画线
   * @param  {String} name       名称
   * @param  {Array} pointsArray 点数组
   * @param  {Number} width      线的宽度
   * @param  {Color} color       线颜色(默认不指定时为蓝色) 通过getColor(red, green, blue, alpha)
   * @see getColor
   * @see removeEntity
   * @example
   *   var arrayp =[104.0, 28.0,
   *              106.0, 27.0,
   *             107.0, 28.0,
   *              108.0, 29.0];
   *   var lineByPoints =   webSS.drawLine('1',arrayp,2);
   * @return {entity}            绘制的线 移除通过removeEntity(entity)
   */
  appendLine(opt: Record<string, any>) {
    if (!this.webGlobe) {
      console.log('webGlobe缺失')
      return null
    }
    if (!opt.name || !opt.pointsArray) {
      return null
    }
    const width = opt.width || ''
    const color = opt.color || ''
    const lineEntity: any = this.webGlobe.appendLine(
      opt.name,
      opt.pointsArray,
      width,
      color,
      opt.isGround,
      opt.options
    )
    this.entityArray.push(lineEntity)
    // eslint-disable-next-line consistent-return
    return lineEntity
  }

  /**
   * 画多边形区
   * @param  {String} name       名称
   * @param  {Array}  pointsArr     点数组（顺序是逆时针）
   * @param  {Color}  fillColor  区填充色 默认白色半透明 通过webSceneControl.getColor(red, green, blue, alpha)
   * @param  {Color}  fillColor  外框线颜色 默认红色半透明
   * @param  {object}  options  其他参数 {outlineWidth：边线宽度}（画多边形无法生效）
   * @param  {boolean}  options.drawOutLine  是否在多边形边上画一条线（drawOutLine：true/false）
   * @see getColor
   * @see removeEntity
   * @return {entity}  绘制的多边形区对象 移除通过removeEntity(entity)
   */
  appendPolygon(
    name: string,
    pointsArr: any[],
    fillColor: string,
    outlineColor: string,
    options?: Record<string, any>
  ) {
    if (!this.webGlobe) {
      console.log('webGlobe缺失')
      return null
    }
    const fcolor = fillColor || ''
    const olcolor = outlineColor || ''
    const polygonEntity = this.webGlobe.appendPolygon(
      name,
      pointsArr,
      fcolor,
      olcolor,
      options
    )
    this.entityArray.push(polygonEntity)
    if (!options) options = {}
    if (options.drawOutLine) {
      const a = pointsArr
      a.unshift(pointsArr[0], pointsArr[1])
      this.appendLine({
        name,
        pointsArray: a,
        width: Number(options.outlineWidth),
        color: olcolor
      })
    }
    return polygonEntity
  }

  /**
   * 根据给定点添加带洞多边形（二维）
   * @param  {String} name       名称
   * @param  {Array}  latLons_out  外圈坐标 ：[x1,y1,x2,y2,x3,y3]
   * @param  {Array}  latLons_in     内圈:[[x1,y1,x2,y2,x3,y3]]
   * @param  {object} options    参数对象
   * @return {entity}  绘制的多边形区对象 移除通过removeEntity(entity)
   */
  appendHolePolygon(
    name: string,
    latLonOut: any[],
    lanLonIn: any[],
    options?: Record<string, any>
  ) {
    if (!this.webGlobe) {
      console.log('webGlobe缺失')
      return null
    }
    // var latLon_out = [95.1550, 30.8902, 95.1668, 30.8800, 95.1836, 30.8902, 95.1696, 30.91];
    // var lanLon_in = [[95.1617, 30.8902, 95.1668, 30.8882, 95.1766, 30.8939, 95.1696, 30.8996]];
    const polygonEntity = this.webGlobe.appendHolePolygon(
      name,
      latLonOut,
      lanLonIn,
      options
    )
    // this.webGlobe.viewer.flyTo(polygonEntity);
    this.entityArray.push(polygonEntity)
    return polygonEntity
  }

  /**
   * 根据给定点画贴地多边形
   * @param  {Array} outPnts   外圈坐标数组（经纬度）
   * @param  {Array}  inerPnts 内圈坐标数组（经纬度）:[[x1,y1,x2,y2,x3,y3]]
   * @param  {Color} color     填充颜色(默认不指定时为蓝色) 通过getColor(red, green, blue, alpha)
   */
  appendGroundPolygon(latLonOut: any[], lanLonIn: any[], color: any) {
    if (!this.webGlobe) {
      console.log('webGlobe缺失')
      return null
    }
    // var latLon_out = [95.1550, 30.8902, 95.1668, 30.8800, 95.1836, 30.8902, 95.1696, 30.91];
    // var lanLon_in = [[95.1617, 30.8902, 95.1668, 30.8882, 95.1766, 30.8939, 95.1696, 30.8996]];
    // var color = new cesium.ColorGeometryInstanceAttribute(0.0, 1.0, 1.0, 0.5);
    const primitive = this.webGlobe.appendGroundPolygon(
      latLonOut,
      lanLonIn,
      color
    )
    // this.webGlobe.viewer.flyTo(primitive);
    this.entityArray.push(primitive)
    return primitive
  }

  /**
   * 根据给定点画贴地多边形(在三维地形上面添加)
   * @param  {Array} outPnts   外圈坐标数组（经纬度）
   * @param  {Array}  inerPnts 内圈坐标数组（经纬度）:[[x1,y1,x2,y2,x3,y3]]
   * @param  {Color} color     填充颜色(默认不指定时为蓝色) 通过getColor(red, green, blue, alpha)
   */
  appendHolePolygonOnTerrain(
    name: string,
    latLonsOut: any[],
    latLonsIn: any[],
    options: Record<string, any>,
    step?: number
  ) {
    if (!this.webGlobe) {
      console.log('webGlobe缺失')
      return null
    }
    // var latLon_out = [95.1550, 30.8902, 95.1668, 30.8800, 95.1836, 30.8902, 95.1696, 30.91];
    // var lanLon_in = [[95.1617, 30.8902, 95.1668, 30.8882, 95.1766, 30.8939, 95.1696, 30.8996]];
    if (!step) {
      let len = 0
      for (let i = 0; i < latLonsOut.length / 2 - 1; i += 1) {
        len += Math.sqrt(
          // eslint-disable-next-line no-restricted-properties
          Math.pow(latLonsOut[2 * i] - latLonsOut[2 * (i + 1)], 2) +
            // eslint-disable-next-line no-restricted-properties
            Math.pow(latLonsOut[2 * i + 1] - latLonsOut[2 * (i + 1) + 1], 2)
        )
      }
      step = len / 200
    }
    const primitive = this.webGlobe.appendHolePolygonOnTerrain(
      name,
      latLonsOut,
      latLonsIn,
      step,
      options
    )
    // this.webGlobe.viewer.flyTo(primitive);
    this.entityArray.push(primitive)
    return primitive
  }

  /**
   * 通过名称删除实体对象
   * @param  {string} name 实体对象
   */
  removeEntityByName(name: string) {
    const entities = this.entityArray
    for (let i = this.entityArray.length - 1; i > -1; i -= 1) {
      // eslint-disable-next-line no-underscore-dangle
      if (entities[i] && entities[i]._name && entities[i]._name === name) {
        this.removeEntity(entities[i])
      }
    }
    // 同时删除markerOptions里面存放的数据
    this.removeMarkerByName(name)
  }

  /**
   * 只删除markerOptions里面存放的数据
   * @param  {string} name 实体对象
   */
  removeMarkerByName(name: string) {
    const markers = this.markerOptions
    for (let i = 0; i < markers.length; i += 1) {
      if (markers[i] && markers[i].name && markers[i].name === name) {
        markers.splice(i, 1)
      }
    }
  }

  /**
   * 移除指定实体
   * @param  {entity} entity 实体对象
   */
  removeEntity(entity: any) {
    if (!this.webGlobe) {
      console.log('webGlobe缺失')
      return
    }
    this.webGlobe.viewer.entities.remove(entity)
    const entities = this.entityArray
    for (let i = 0; i < entities.length; i += 1) {
      if (entities[i] && entities[i].id && entities[i].id === entity.id) {
        entities.splice(i, 1)
        break
      }
    }
  }

  /**
   * 添加标注点
   * @param {Object} option 参数对象
   * @returns {object} markerEntity
   */
  addMarkerByFeature(option: Record<string, any>) {
    if (!this.Cesium) {
      console.log('Cesium缺失')
      return null
    }
    if (!option.center && !option.features) {
      return null
    }
    option.img = option.img || null
    option.stopEvent = option.stopEvent || true
    // 鼠标悬浮事件
    option.mouseOver = option.mouseOver || null
    // 鼠标移除事件
    option.mouseOut = option.mouseOut || null
    // 查询结果
    option.AttValue = option.AttValue || null
    // 结果表字段
    option.FldName = option.FldName || null
    // 标注点ID
    option.name = option.name || 'markerOverlay'
    // 高亮entity的名称
    option.lightFeaturesName = option.lightFeaturesName || 'lightFeatures'

    // 计算中心点
    option.center =
      option.center || utilInstance.getGeoJsonFeatureCenter(option.features[0])
    const markerEntity = this.appendPictureLabel({
      lon: option.center[0],
      lat: option.center[1],
      height: option.center.length > 2 ? option.center[2] : 0,
      iconUrl: option.img,
      iconWidth: option.iconWidth,
      iconHeight: option.iconHeight,
      name: option.name
    })
    if (!markerEntity) {
      return
    }
    // eslint-disable-next-line no-underscore-dangle
    option.id = markerEntity._id

    const { mouseOver, mouseOut } = option

    // 标注点添加鼠标事件
    option.mouseOver =
      mouseOver !== undefined && mouseOver !== null
        ? mouseOver
        : event => {
            this.markerMouseOver(event, option)
          }
    option.mouseOut =
      mouseOut !== undefined && mouseOut !== null
        ? mouseOut
        : event => {
            this.markerMouseOut(event, option.lightFeaturesName)
          }
    this.markerOptions.push(option)
    this.markerEvent = true
    return markerEntity
  }

  markerMouseOver(event: any, option: any) {
    // console.log(option)
    // const drawEntity = this.lightFeatures(
    //   option.feature,
    //   option.lightFeaturesName
    // )
    // this.showPopupElement(
    //   option,
    //   this.Cesium.Cartesian3.fromDegrees(option.center[0], option.center[1])
    // )
  }

  markerMouseOut(event: any, lightFeaturesName: string) {
    this.removeEntityByName(lightFeaturesName)
    // this.removePopopElement() // 移除弹框
  }

  // /**
  //  * 高亮要素（二维数据）
  //  * @param {GeoJson} feature 要素
  //  * @param {string} id 实体ID
  //  * @param {string} color 颜色
  //  */
  // lightFeatures(
  //   feature: any,
  //   name: string,
  //   fillColor?: string,
  //   outlineColor?: string,
  //   options?: any
  // ) {
  //   // by zhang 2019-10-22 修改，要素为多圈时，使用带洞区绘制
  //   const fcolor = fillColor || ''
  //   const olcolor = outlineColor || ''
  //   // eslint-disable-next-line no-underscore-dangle
  //   const arryp = feature.values_.geometry.flatCoordinates // 拿到参数中的点数组
  //   let polygon
  //   // eslint-disable-next-line no-underscore-dangle
  //   if (feature.values_.geometry.ends_.length > 1) {
  //     const latLonOut = []
  //     const lanLonInArr = []
  //     let latLonIn = []
  //     // 取外圈坐标数组
  //     // eslint-disable-next-line no-underscore-dangle
  //     for (let i = 0; i < feature.values_.geometry.ends_[0]; i += 1) {
  //       // eslint-disable-next-line no-underscore-dangle
  //       latLonOut.push(feature.values_.geometry.flatCoordinates[i])
  //     }
  //     // 取内圈数组
  //     // eslint-disable-next-line no-underscore-dangle
  //     for (let i = 1; i < feature.values_.geometry.ends_.length; i += 1) {
  //       latLonIn = []
  //       for (
  //         // eslint-disable-next-line no-underscore-dangle
  //         let j = feature.values_.geometry.ends_[i - 1];
  //         // eslint-disable-next-line no-underscore-dangle
  //         j < feature.values_.geometry.ends_[i];
  //         j += 1
  //       ) {
  //         // eslint-disable-next-line no-underscore-dangle
  //         latLonIn.push(feature.values_.geometry.flatCoordinates[j])
  //       }
  //       lanLonInArr.push(latLonIn)
  //     }
  //     if (options) {
  //       options.fillColor = fcolor
  //       options.outlineColor = olcolor
  //     } else {
  //       options = { fillColor: fcolor, outlineColor: olcolor }
  //     }
  //     polygon = this.appendHolePolygon(name, latLonOut, lanLonInArr, options) // name, latLon_out, lanLon_in, options
  //   } else {
  //     polygon = this.appendPolygon(name, arryp, fcolor, olcolor, options)
  //   }
  //   return polygon
  // }

  /**
   * 添加图标注记
   * @param  {String} text       注记文字内容
   * @param  {Number} lon        经度(必须)
   * @param  {Number} lat        纬度(必须)
   * @param  {Number} height     高程
   * @param  {String} font       字体 这里将字体和大小放在一起 eg:'14pt 楷体'
   * @param  {Color}  fillColor  字体的填充色
   * @param  {String} iconUrl    图标路径
   * @param  {Number} iconWidth  图标宽度
   * @param  {Number} iconHeight 图标高度
   * @param  {Number} farDist    最远显示距离
   * @param  {Number} nearDist   最近显示距离
   * @param  {String} txtPos     位置 'center','top','bottom'
   * @param  {String} attribute  其他属性信息
   * @param  {String} id  id
   * @example
   *  var labelIcon = webSS.appendLabelIcon('注记文本',110,33,0,'14pt 楷体','/car.png',64,64,10000000,1,bottom,'这是属性信息查询时可以看到');
   * @return {entity} labelIcon  图标注记对象 移除通过removeEntity(entity)
   */
  appendPictureLabel(opt: Record<string, any>) {
    if (!this.Cesium) {
      console.log('Cesium缺失')
      return null
    }
    if (!opt.lon || !opt.lat) {
      return null
    }
    const text = opt.text || ''
    const lon = opt.lon || 0
    const lat = opt.lat || 0
    const height = opt.height || 0
    // var font = opt.font || '14pt 宋体';
    const font = opt.font || '14pt 宋体'
    const fillColor = opt.fillColor || ''
    const iconUrl = opt.iconUrl || null
    const iconWidth = opt.iconWidth || 27
    const iconHeight = opt.iconHeight || 32
    const farDist = opt.farDist || 10000000000000
    const nearDist = opt.nearDist || 1
    const txtPos = opt.txtPos || 'top'
    const attribute = opt.attribute || ''
    opt.name = opt.name || 'pictureLabel'
    const labelIcon = this.webGlobe.appendLabelIcon(
      text,
      lon,
      lat,
      height,
      font,
      fillColor,
      iconUrl,
      iconWidth,
      iconHeight,
      farDist,
      nearDist,
      txtPos,
      attribute
    )
    if (opt.id) {
      labelIcon.id = opt.id
    }
    labelIcon.billboard.translucencyByDistance = new this.Cesium.NearFarScalar(
      1.5e5,
      1.0,
      1.5e7,
      1.0
    ) // 不随距离的远近改变透明度
    // labelIcon.pixelOffsetScaleByDistance = new cesium.NearFarScalar(1.5e2, 0.0, 8.0e6, 10.0);//随远近改变大小
    labelIcon.billboard.disableDepthTestDistance = Number.POSITIVE_INFINITY
    labelIcon.name = opt.name

    this.entityArray.push(labelIcon)
    return labelIcon
  }

  /**
   * 移除所有实体对象
   */
  removeAllEntities(webGlobe: any) {
    webGlobe.viewer.entities.removeAll()
    this.entityArray = []
    this.markerOptions = []
  }

  /**
   * 给添加的addMarkerByFeature添加绑定事件
   * @param {Event} event 事件对象
   */
  registerMarkerEvent(event: any) {
    if (this.markerEvent) {
      const options = this.markerOptions
      const collection = this.webGlobe.scene.pick(event.endPosition)
      for (let i = 0; i < options.length; i += 1) {
        const option = options[i]
        if (
          collection &&
          collection.id &&
          // eslint-disable-next-line no-underscore-dangle
          collection.id._id &&
          // eslint-disable-next-line no-underscore-dangle
          collection.id._id === option.id
        ) {
          option.mouseOver(event)
          break
        }
        if (i === options.length - 1) {
          option.mouseOut(event)
          break
        }
      }
    }
  }

  /**
   * 注册事件
   */
  registerGlobeMouseEvent() {
    // 注册鼠标移动事件
    this.registerMouseEvent('MOUSE_MOVE', event => {
      // console.log(event)
      this.registerMarkerEvent(event) // 标注点增加hover事件
    })
    // 注册鼠标左击事件
    this.registerMouseEvent('LEFT_CLICK', event => {
      // console.log(event)
    })
    // 注册鼠标右击事件
    this.registerMouseEvent('RIGHT_CLICK', event => {
      // console.log(event)
    })
    // this.drawElement = new this.Cesium.DrawElement(this.webGlobe.viewer)
  }

  /**
   * 注册监听事件
   * @param  {String} eventType ：'LEFT_CLICK'、'RIGHT_CLICK'、'MOUSE_MOVE'、'LEFT_DOUBLE_CLICK'  事件类型
   * @param  {Function} callbackFun 回调函数
   */
  registerMouseEvent(eventType, callbackFun) {
    this.webGlobe.registerMouseEvent(eventType, callbackFun)
  }

  /**
   * 注销鼠标事件
   * @param  {String} eventType   事件类型
   * @return {handler}             事件句柄
   */
  unRegisterMouseEvent(eventType) {
    this.webGlobe.unRegisterMouseEvent(eventType)
  }

  /**
   * 获取当前范围
   * @param globe
   */
  getCurrentExtent(globe) {
    // 范围对象
    const extent = {
      xmin: -180,
      ymax: 90,
      xmax: 180,
      ymin: -90,
      height: 0
    }
    const rectangle = globe.viewer.camera.computeViewRectangle()
    extent.xmin = (rectangle.west / Math.PI) * 180
    extent.ymax = (rectangle.north / Math.PI) * 180
    extent.xmax = (rectangle.east / Math.PI) * 180
    extent.ymin = (rectangle.south / Math.PI) * 180

    // 获取高度
    extent.height = Math.ceil(globe.viewer.camera.positionCartographic.height)
    return extent
  }

  /**
   * 经纬度坐标转数据坐标
   * @param  {object} position 经纬度点
   * @param  {object} transform 对应数据的transform信息
   * @return {Cartographic}  Cartographic 数据坐标
   */
  degreeToDataPosition(position, transform) {
    // 度转迪卡尔
    const c3 = this.Cesium.Cartesian3.fromDegrees(
      position.x,
      position.y,
      position.z
    )
    if (!this.webGlobe.viewer.scene) {
      return null
    }
    // 笛卡尔转屏幕
    // const cartesian2 = this.Cesium.SceneTransforms.wgs84ToWindowCoordinates(
    //   this.webGlobe.viewer.scene,
    //   c3
    // )
    // // 屏幕转数据
    // let car3 = new this.Cesium.Cartesian3()
    // car3 = this.webGlobe.viewer.getCartesian3Position(cartesian2, car3)
    let matrixInver = new this.Cesium.Matrix4()
    matrixInver = this.Cesium.Matrix4.inverse(transform, matrixInver)
    const maxCar = new this.Cesium.Cartesian3()
    this.Cesium.Matrix4.multiplyByPoint(matrixInver, c3, maxCar)
    return maxCar
  }

  /**
   * 数据坐标转经纬坐标
   * @param  {object} position 数据坐标点
   * @param  {object} transform 对应数据的transform信息
   * @return {object}  Position 经纬度坐标
   */
  dataPositionToDegree(position, transform) {
    let car3 = new this.Cesium.Cartesian3()
    car3 = this.Cesium.Matrix4.multiplyByPoint(transform, position, car3)
    const cartographic = this.Cesium.Cartographic.fromCartesian(car3)
    const lonDegree = this.Cesium.Math.toDegrees(cartographic.longitude)
    const latDegree = this.Cesium.Math.toDegrees(cartographic.latitude)
    const heightDegree = cartographic.height // Cesium.Math.toDegrees(radiusPoint.height);鼠标Z值代表真实Z值
    const positions = { x: lonDegree, y: latDegree, z: heightDegree }
    return positions
  }

  /**
   * 数据坐标范围转经纬坐标范围
   * @param  {object} extend3D 数据坐标点范围
   * @param  {object} transform 对应数据的transform信息
   * @return {object}  Position 经纬度坐标
   */
  dataPositionExtenToDegreeExtend(extend3D, transform) {
    const centerMinPoint = new this.Cesium.Cartesian3()
    centerMinPoint.x = extend3D.xmin
    centerMinPoint.y = extend3D.ymin
    centerMinPoint.z = extend3D.zmin
    const positions1 = this.dataPositionToDegree(centerMinPoint, transform) // 数据坐标转经纬度坐标

    const centerMaxPoint = new this.Cesium.Cartesian3()
    centerMaxPoint.x = extend3D.xmax
    centerMaxPoint.y = extend3D.ymax
    centerMaxPoint.z = extend3D.zmax
    const positions2 = this.dataPositionToDegree(centerMaxPoint, transform) // 数据坐标转经纬度坐标
    const bound = {
      xmin: positions1.x,
      ymin: positions1.y,
      xmax: positions2.x,
      ymax: positions2.y
    }
    return bound
  }
}
export default new CesiumUtil()
