import { Component, Vue, Mixins } from 'vue-property-decorator'
import { WidgetMixin } from '@mapgis/web-app-framework'

declare const CesiumZondy
declare const webGlobe
declare const Cesium

@Component
export default class CesiumDraw extends Mixins(WidgetMixin) {
  private tool: any = null

  createCesium() {
    if (!window.ElementQueryManage) {
      window.ElementQueryManage = {
        entityController: new CesiumZondy.Manager.EntityController({
          viewer: webGlobe.viewer
        }),
        // 构造鼠标事件管理对象
        mouseEventManager: new CesiumZondy.Manager.MouseEventManager({
          viewer: webGlobe.viewer
        })
      }
    }
  }

  clearCesiumDraw() {
    if (window.ElementQueryManage) {
      window.ElementQueryManage = null
    }

    this.queryType = ''
  }

  // 设置鼠标样式
  setCursor(cursorStyle: string) {
    const arr = document.getElementsByClassName('cesium-widget')
    if (arr.length > 0) {
      ;(arr[0].style || { cursor: 'auto' }).cursor = cursorStyle || 'auto'
    }
  }

  /* 绘制点 */
  interactionDrawPnt() {
    // 清除绘制的内容
    this.removeEntities()
    const { mouseEventManager, entityController } = window.ElementQueryManage
    this.setCursor('crosshair')
    // 注册鼠标左键单击事件
    mouseEventManager.registerMouseEvent('LEFT_CLICK', function(movement) {
      // 屏幕坐标转笛卡尔坐标
      const cartesian = webGlobe.viewer.getCartesian3Position(movement.position)
      const cartographic = Cesium.Cartographic.fromCartesian(cartesian)
      const lng = Cesium.Math.toDegrees(cartographic.longitude)
      const lat = Cesium.Math.toDegrees(cartographic.latitude)
      const { height } = cartographic // 模型高度
      // 添加点：经度、纬度、高程、名称、像素大小、颜色、外边线颜色、边线宽度
      entityController.appendPoint(
        lng,
        lat,
        height,
        '点',
        10,
        new Cesium.Color(255 / 255, 0 / 255, 0 / 255, 1),
        new Cesium.Color(255 / 255, 255 / 255, 0 / 255, 1),
        2
      )
    })
    // 注册鼠标右键单击事件
    mouseEventManager.registerMouseEvent('RIGHT_CLICK', e => {
      mouseEventManager.unRegisterMouseEvent('LEFT_CLICK')
      mouseEventManager.unRegisterMouseEvent('RIGHT_CLICK')
      this.setCursor('')
    })
  }

  /* 绘制线 */
  interactionDrawLine() {
    // 清除绘制的内容
    this.removeEntities()

    let pointArray: Array<any> = []
    let allPoint: Array<any> = []
    this.setCursor('crosshair')
    const { mouseEventManager, entityController } = window.ElementQueryManage
    // 注册鼠标左键单击事件
    mouseEventManager.registerMouseEvent('LEFT_CLICK', e => {
      // 屏幕坐标转笛卡尔坐标
      const cartesian = webGlobe.viewer.getCartesian3Position(e.position)
      const cartographic = Cesium.Cartographic.fromCartesian(cartesian)

      const lng = Cesium.Math.toDegrees(cartographic.longitude)
      pointArray.push(lng)
      allPoint.push(lng)

      const lat = Cesium.Math.toDegrees(cartographic.latitude)
      pointArray.push(lat)
      allPoint.push(lat)

      // 模型高度
      const { height } = cartographic
      pointArray.push(height)
      allPoint.push(height)

      // 添加点
      if (pointArray.length > 3) {
        // 绘制线（名称、点数组、线宽、线颜色、是否识别带高度的坐标、是否贴地形、附加属性）
        entityController.appendLine(
          '不贴地线',
          pointArray,
          2,
          new Cesium.Color(255 / 255, 0 / 255, 0 / 255, 0.8),
          true,
          false,
          {}
        )
        pointArray = []
        pointArray.push(lng)
        pointArray.push(lat)
        pointArray.push(height)
        webGlobe.viewer.entities.removeById('moveline')
      }
    })
    // 注册鼠标移动事件
    mouseEventManager.registerMouseEvent('MOUSE_MOVE', e => {
      webGlobe.viewer.entities.removeById('moveline')
      if (pointArray.length < 3) {
        return
      }
      const cartesian = webGlobe.viewer.getCartesian3Position(e.endPosition)
      const cartographic = Cesium.Cartographic.fromCartesian(cartesian)
      const lng = Cesium.Math.toDegrees(cartographic.longitude)
      const lat = Cesium.Math.toDegrees(cartographic.latitude)
      const { height } = cartographic
      const firstPosition = Cesium.Cartesian3.fromDegrees(
        pointArray[0],
        pointArray[1],
        pointArray[2]
      )
      const movePosition = Cesium.Cartesian3.fromDegrees(lng, lat, height)
      console.log(`f${firstPosition}`)
      console.log(`m${movePosition}`)
      const redBox = webGlobe.viewer.entities.add({
        id: 'moveline',
        polyline: {
          positions: [firstPosition, movePosition],
          width: 2,
          material: Cesium.Color.YELLOW
        }
      })
    })
    // 注册鼠标右键单击事件
    mouseEventManager.registerMouseEvent('RIGHT_CLICK', e => {
      // 移除所有实体
      entityController.removeAllEntities()
      if (allPoint.length > 3) {
        // 绘制线（名称、点数组、线宽、线颜色、是否识别带高度的坐标、是否贴地形、附加属性）
        entityController.appendLine(
          '不贴地线',
          allPoint,
          2,
          new Cesium.Color(255 / 255, 0 / 255, 0 / 255, 0.8),
          true,
          false,
          {}
        )
      }
      pointArray = []
      allPoint = []
      // 注销鼠标各项事件
      mouseEventManager.unRegisterMouseEvent('LEFT_CLICK')
      mouseEventManager.unRegisterMouseEvent('MOUSE_MOVE')
      mouseEventManager.unRegisterMouseEvent('RIGHT_CLICK')
      this.setCursor('')
    })
  }

  /* 绘制多边形 */
  interactionDrawPolygon() {
    // 清除绘制的内容
    this.removeEntities()
    this.setCursor('crosshair')
    // 创建区绘制工具
    this.tool = new Cesium.DrawPolygonTool(webGlobe.viewer, this.getDrawResult)
    // 激活工具
    this.tool.activeTool()
  }

  /* 绘制结果回调函数 */
  getDrawResult(entity) {
    const { mouseEventManager, entityController } = window.ElementQueryManage
    if (entity) {
      console.log(entity)
      let pointArr: Array<any> = []
      // 坐标转换、处理
      for (let i = 0; i < entity._points.length; i++) {
        const point = entity._points[i]
        const { ellipsoid } = webGlobe.viewer.scene.globe
        const cartesian3 = new Cesium.Cartesian3(point.x, point.y, point.z)
        const cartographic = ellipsoid.cartesianToCartographic(cartesian3)
        const lat = Cesium.Math.toDegrees(cartographic.latitude)
        const lng = Cesium.Math.toDegrees(cartographic.longitude)
        const alt = cartographic.height
        pointArr.push(lng, lat, alt)
      }

      // 移除所有实体
      entityController.removeAllEntities()

      // 构造区对象
      const polygon = {
        name: '立体区',
        polygon: {
          // 坐标点
          hierarchy: Cesium.Cartesian3.fromDegreesArrayHeights(pointArr),
          // 是否指定各点高度
          perPositionHeight: true,
          // 颜色
          material: new Cesium.Color(33 / 255, 150 / 255, 243 / 255, 0.5),
          // 轮廓线是否显示
          outline: true,
          // 轮廓线颜色
          outlineColor: Cesium.Color.BLACK
        }
      }
      // 绘制图形通用方法：对接Cesium原生特性
      const polygon2 = entityController.appendGraphics(polygon)
      // 清除
      pointArr = []
      this.setCursor('')
    }
  }

  removeEntities() {
    const { mouseEventManager, entityController } = window.ElementQueryManage
    // 注销鼠标各项事件
    mouseEventManager.unRegisterMouseEvent('LEFT_CLICK')
    mouseEventManager.unRegisterMouseEvent('MOUSE_MOVE')
    mouseEventManager.unRegisterMouseEvent('RIGHT_CLICK')
    // 移除所有实体
    entityController.removeAllEntities()
    if (this.tool) {
      this.tool.deactiveTool()
      this.tool = null
    }
  }
}
