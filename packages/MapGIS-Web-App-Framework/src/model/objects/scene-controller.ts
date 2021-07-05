export class SceneController {
  public static sceneControllerArray: { webGlobe; sceneController }[] = []

  private Cesium: any = undefined

  private CesiumZondy: any = undefined

  private webGlobe: any = undefined

  public static getInstance(Cesium, CesiumZondy, webGlobe) {
    let sceneControllerValue = this.sceneControllerArray.find(item => {
      return item.webGlobe === webGlobe
    })

    if (sceneControllerValue) {
      return sceneControllerValue.sceneController
    }

    sceneControllerValue = {
      webGlobe: webGlobe,
      sceneController: new SceneController(Cesium, CesiumZondy, webGlobe)
    }
    this.sceneControllerArray.push(sceneControllerValue)

    return sceneControllerValue.sceneController
  }

  constructor(Cesium, CesiumZondy, webGlobe) {
    this.Cesium = Cesium
    this.CesiumZondy = CesiumZondy
    this.webGlobe = webGlobe
  }

  /**
   * 截图
   */
  public outputImage() {
    this.webGlobe.outputImage()
  }

  /**
   * RGB/RGBA转Cesium内部颜色值
   * @param {string} color rgb/rgba颜色值
   */
  public colorToCesiumColor(color: string) {
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
   * 获取当前范围
   * @param webGlobe
   */
  public getCurrentExtent() {
    // 范围对象
    const extent = {
      xmin: -180,
      ymax: 90,
      xmax: 180,
      ymin: -90,
      height: 0
    }
    const rectangle = this.webGlobe.viewer.camera.computeViewRectangle()
    extent.xmin = (rectangle.west / Math.PI) * 180
    extent.ymax = (rectangle.north / Math.PI) * 180
    extent.xmax = (rectangle.east / Math.PI) * 180
    extent.ymin = (rectangle.south / Math.PI) * 180

    // 获取高度
    extent.height = Math.ceil(
      this.webGlobe.viewer.camera.positionCartographic.height
    )
    return extent
  }

  // 屏幕坐标转地理坐标
  public screenPositionToGlobelPosition(mousePoint) {
    // 通过指定的椭球或者地图对应的坐标系，将鼠标的二维坐标转换为对应椭球体三维坐标
    const { ellipsoid } = this.webGlobe.scene.globe
    let cartesian
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
      const longitude = this.Cesium.Math.toDegrees(cartographic.longitude) // 转换后的经度
      const latitude = this.Cesium.Math.toDegrees(cartographic.latitude) // 转换后的纬度
      const currentCoor = [longitude, latitude]
      return currentCoor
    }
    return null
  }

  /**
   * 地理坐标转局部坐标
   * @param  {object} position 经纬度点
   * @param  {object} transform 对应数据的transform信息
   * @return {Cartographic}  Cartographic 数据坐标
   */
  public globelPositionToLocalPosition(position, transform) {
    // 度转迪卡尔
    const c3 = this.Cesium.Cartesian3.fromDegrees(
      position.x,
      position.y,
      position.z
    )
    let matrixInver = new this.Cesium.Matrix4()
    matrixInver = this.Cesium.Matrix4.inverse(transform, matrixInver)
    const maxCar = new this.Cesium.Cartesian3()
    this.Cesium.Matrix4.multiplyByPoint(matrixInver, c3, maxCar)
    return maxCar
  }

  /**
   * 数据局部坐标转经纬度地理坐标
   * @param  {object} position 数据坐标点
   * @param  {object} transform 对应数据的transform信息
   * @return {object}  Position 经纬度坐标
   */
  public localPositionToGlobelPosition(position, transform) {
    let car3 = new this.Cesium.Cartesian3()
    car3 = this.Cesium.Matrix4.multiplyByPoint(transform, position, car3)
    const cartographic = this.Cesium.Cartographic.fromCartesian(car3)
    const lonDegree = this.Cesium.Math.toDegrees(cartographic.longitude)
    const latDegree = this.Cesium.Math.toDegrees(cartographic.latitude)
    const heightDegree = cartographic.height // this.Cesium.Math.toDegrees(radiusPoint.height);鼠标Z值代表真实Z值
    const positions = { x: lonDegree, y: latDegree, z: heightDegree }
    return positions
  }

  /**
   * 数据局部坐标范围转经纬度地理坐标范围
   * @param  {object} extent3D 数据坐标点范围
   * @param  {object} transform 对应数据的transform信息
   * @return {object}  Position 经纬度坐标
   */
  public localExtentToGlobelExtent(extent3D, transform) {
    const centerMinPoint = new this.Cesium.Cartesian3()
    centerMinPoint.x = extent3D.xmin
    centerMinPoint.y = extent3D.ymin
    centerMinPoint.z = extent3D.zmin
    const positions1 = this.localPositionToGlobelPosition(
      centerMinPoint,
      transform
    ) // 数据坐标转经纬度坐标

    const centerMaxPoint = new this.Cesium.Cartesian3()
    centerMaxPoint.x = extent3D.xmax
    centerMaxPoint.y = extent3D.ymax
    centerMaxPoint.z = extent3D.zmax
    const positions2 = this.localPositionToGlobelPosition(
      centerMaxPoint,
      transform
    ) // 数据坐标转经纬度坐标
    const bound = {
      xmin: positions1.x,
      ymin: positions1.y,
      xmax: positions2.x,
      ymax: positions2.y
    }
    return bound
  }

  /**
   * 图层数据局部坐标范围转经纬度地理范围
   * @param igsSceneSubLayer IGS三维图层
   * @param vueKey 对应WebGlobe的key
   * @retu rns 经纬度坐标
   */
  layerLocalExtentToGlobelExtent(igsSceneSubLayer) {
    /**
     * @修改说明 现在新版webGlobe已经携带了vueKey，再不需要传入vueKey了
     * @修改人 龚瑞强
     * @修改时间 2021/7/5
     */
    const { id, range } = igsSceneSubLayer
    const { source } = this.findSource(id)
    let bound: any = null
    if (source.length > 0) {
      const tranform = source[0].root.transform
      bound = this.localExtentToGlobelExtent(range, tranform)
    }
    return bound
  }

  /**
   * 查找模型对象
   * @param id 查找模型的id
   * @returns 模型对象
   */
  findSource(id: string) {
    const { vueKey } = this.webGlobe
    const res = this.CesiumZondy.M3DIgsManager.findSource(vueKey, id) || {}
    return res || { source: [] }
  }

  /**
   * 根据经纬度范围获取经纬度
   * @param bound  经纬度范围
   * @returns Rectangle bound
   */
  public getRectangleFromDegrees({ xmin, ymin, xmax, ymax }) {
    return new this.Cesium.Rectangle.fromDegrees(xmin, ymin, xmax, ymax)
  }

  /**
   * 获取positionCartographic.height
   * @returns positionCartographic.height
   */
  public getPsitionCartographicHeight() {
    return this.webGlobe.viewer.camera.positionCartographic.height
  }

  /**
   * 根据经纬度获取Cartesian3坐标
   * @param x,y,z
   * @returns Cartesian3坐标
   */
  public getCartesian3FromDegrees(x: number, y: number, z: number) {
    return this.Cesium.Cartesian3.fromDegrees(x, y, z)
  }

  /**
   * 相机视角跳转
   * @param params
   */
  public cameraFlyTo(params: any) {
    this.webGlobe.viewer.camera.flyTo(params)
  }

  /**
   * 监听相机变化的事件
   * @param callback
   */
  public addCameraChangedEvent(callback: () => void) {
    this.webGlobe.viewer.camera.changed.addEventListener(callback)
  }

  /**
   * 监听相机变化的事件
   * @param callback
   */
  public removeCameraChangedEvent(callback: () => void) {
    this.webGlobe.viewer.camera.changed.removeEventListener(callback)
  }
}
