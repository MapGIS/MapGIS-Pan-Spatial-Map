export default class SceneUtil {
  /**
   * 截图
   */
  public static outputImage(webGlobe) {
    webGlobe.outputImage()
  }

  /**
   * RGB/RGBA转Cesium内部颜色值
   * @param {string} color rgb/rgba颜色值
   */
  public static colorToCesiumColor(webGlobe, color: string) {
    let cesiumColor
    if (color.includes('rgb')) {
      // 如果是rgb或者rgba
      const a = color.substr(5, color.length - 6)
      const arr = a.split(',')
      const cesiumRed = Number((Number(arr[0]) / 255).toFixed(2))
      const cesiumGreen = Number((Number(arr[1]) / 255).toFixed(2))
      const cesiumBlue = Number((Number(arr[2]) / 255).toFixed(2))
      const cesiumAlpha = Number(arr[3] ? arr[3] : 1)
      cesiumColor = webGlobe.getColor(
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
  public static getCurrentExtent(webGlobe) {
    // 范围对象
    const extent = {
      xmin: -180,
      ymax: 90,
      xmax: 180,
      ymin: -90,
      height: 0
    }
    const rectangle = webGlobe.viewer.camera.computeViewRectangle()
    extent.xmin = (rectangle.west / Math.PI) * 180
    extent.ymax = (rectangle.north / Math.PI) * 180
    extent.xmax = (rectangle.east / Math.PI) * 180
    extent.ymin = (rectangle.south / Math.PI) * 180

    // 获取高度
    extent.height = Math.ceil(
      webGlobe.viewer.camera.positionCartographic.height
    )
    return extent
  }

  public static mousePositionToDegree(Cesium, webGlobe, mousePoint) {
    // 通过指定的椭球或者地图对应的坐标系，将鼠标的二维坐标转换为对应椭球体三维坐标
    const { ellipsoid } = webGlobe.scene.globe
    let cartesian
    if (mousePoint.position) {
      // 拿到屏幕坐标  【屏幕坐标转笛卡尔坐标】
      cartesian = webGlobe.viewer.camera.pickEllipsoid(
        mousePoint.position,
        ellipsoid
      )
    } else {
      cartesian = webGlobe.viewer.camera.pickEllipsoid(
        mousePoint.endPosition,
        ellipsoid
      )
    }
    if (cartesian) {
      // 将笛卡尔坐标转换为地理坐标
      const cartographic = ellipsoid.cartesianToCartographic(cartesian)
      // 将弧度转为度的十进制度表示
      const longitude = Cesium.Math.toDegrees(cartographic.longitude) // 转换后的经度
      const latitude = Cesium.Math.toDegrees(cartographic.latitude) // 转换后的纬度
      const currentCoor = [longitude, latitude]
      return currentCoor
    }
    return null
  }

  /**
   * 经纬度坐标转数据坐标
   * @param  {object} position 经纬度点
   * @param  {object} transform 对应数据的transform信息
   * @return {Cartographic}  Cartographic 数据坐标
   */
  public static degreeToDataPosition(Cesium, position, transform) {
    // 度转迪卡尔
    const c3 = Cesium.Cartesian3.fromDegrees(position.x, position.y, position.z)
    let matrixInver = new Cesium.Matrix4()
    matrixInver = Cesium.Matrix4.inverse(transform, matrixInver)
    const maxCar = new Cesium.Cartesian3()
    Cesium.Matrix4.multiplyByPoint(matrixInver, c3, maxCar)
    return maxCar
  }

  /**
   * 数据坐标转经纬坐标
   * @param  {object} position 数据坐标点
   * @param  {object} transform 对应数据的transform信息
   * @return {object}  Position 经纬度坐标
   */
  public static dataPositionToDegree(Cesium, position, transform) {
    let car3 = new Cesium.Cartesian3()
    car3 = Cesium.Matrix4.multiplyByPoint(transform, position, car3)
    const cartographic = Cesium.Cartographic.fromCartesian(car3)
    const lonDegree = Cesium.Math.toDegrees(cartographic.longitude)
    const latDegree = Cesium.Math.toDegrees(cartographic.latitude)
    const heightDegree = cartographic.height // Cesium.Math.toDegrees(radiusPoint.height);鼠标Z值代表真实Z值
    const positions = { x: lonDegree, y: latDegree, z: heightDegree }
    return positions
  }

  /**
   * 数据坐标范围转经纬坐标范围
   * @param  {object} extent3D 数据坐标点范围
   * @param  {object} transform 对应数据的transform信息
   * @return {object}  Position 经纬度坐标
   */
  public static dataPositionExtentToDegreeExtent(Cesium, extent3D, transform) {
    const centerMinPoint = new Cesium.Cartesian3()
    centerMinPoint.x = extent3D.xmin
    centerMinPoint.y = extent3D.ymin
    centerMinPoint.z = extent3D.zmin
    const positions1 = this.dataPositionToDegree(
      Cesium,
      centerMinPoint,
      transform
    ) // 数据坐标转经纬度坐标

    const centerMaxPoint = new Cesium.Cartesian3()
    centerMaxPoint.x = extent3D.xmax
    centerMaxPoint.y = extent3D.ymax
    centerMaxPoint.z = extent3D.zmax
    const positions2 = this.dataPositionToDegree(
      Cesium,
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
}
