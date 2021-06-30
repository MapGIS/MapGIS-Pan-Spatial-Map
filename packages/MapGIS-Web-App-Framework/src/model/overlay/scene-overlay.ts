import { getGeoJSONFeatureCenter } from '../feature/feature-geojson'

export class SceneOverlays {
  public static sceneOverlaysArray: { webGlobe; sceneOverlays }[] = []

  private entityArray: any[] = [] // 实体数组

  private markerOptions: any[] = [] // 标注点的参数feature信息进行存储

  private Cesium: any = undefined

  private webGlobe: any = undefined

  private CesiumZondy: any = undefined

  public static getInstance(Cesium, CesiumZondy, webGlobe) {
    let sceneOverlaysValue = this.sceneOverlaysArray.find(item => {
      return item.webGlobe === webGlobe
    })

    if (sceneOverlaysValue) {
      return sceneOverlaysValue.sceneOverlays
    }

    sceneOverlaysValue = {
      webGlobe: webGlobe,
      sceneOverlays: new SceneOverlays(Cesium, CesiumZondy, webGlobe)
    }
    this.sceneOverlaysArray.push(sceneOverlaysValue)

    return sceneOverlaysValue.sceneOverlays
  }

  constructor(Cesium, CesiumZondy, webGlobe) {
    this.Cesium = Cesium
    this.CesiumZondy = CesiumZondy
    this.webGlobe = webGlobe
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
  public addLine(opt: Record<string, any>) {
    if (!this.webGlobe) {
      console.log('webGlobe缺失')
      return null
    }
    if (!opt.name || !opt.pointsArray) {
      return null
    }
    const width = opt.width || ''
    const color = opt.color || ''
    const isHeight = opt.isHeight || false
    const isGround = opt.isGround || true
    const lineEntity: any = this.webGlobe.appendLine(
      opt.name,
      opt.pointsArray,
      width,
      color,
      isHeight,
      isGround,
      opt.options
    )
    this.entityArray.push(lineEntity)
    return lineEntity
  }

  /**
   * 画多边形区
   * @param  {String} name       名称
   * @param  {Array}  pointsArr  点数组（顺序是逆时针）
   * @param  {Color}  fillColor  区填充色 默认白色半透明 通过webSceneControl.getColor(red, green, blue, alpha)
   * @param  {Color}  fillColor  外框线颜色 默认红色半透明
   * @param  {object}  options   其他参数 {outlineWidth：边线宽度}（画多边形无法生效）
   * @param  {boolean}  options.drawOutLine  是否在多边形边上画一条线（drawOutLine：true/false）
   * @see getColor
   * @see removeEntity
   * @return {entity}            绘制的多边形区对象 移除通过removeEntity(entity)
   */
  public addPolygon(
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
      options && options.outlineWidth === 0 ? '' : olcolor,
      options
    )
    this.entityArray.push(polygonEntity)
    if (!options) options = {}
    if (options.drawOutLine) {
      const a = pointsArr
      a.unshift(pointsArr[0], pointsArr[1])
      this.addLine({
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
   * @param  {String} name         名称
   * @param  {Array}  latLons_out  外圈坐标 ：[x1,y1,x2,y2,x3,y3]
   * @param  {Array}  latLons_in   内圈:[[x1,y1,x2,y2,x3,y3]]
   * @param  {object} options      参数对象
   * @return {entity}              绘制的多边形区对象 移除通过removeEntity(entity)
   */
  public addHolePolygon(
    name: string,
    latLonOut: any[],
    lanLonIn: any[],
    options?: Record<string, any>
  ) {
    if (!this.webGlobe) {
      console.log('webGlobe缺失')
      return null
    }
    // const latLon_out = [95.1550, 30.8902, 95.1668, 30.8800, 95.1836, 30.8902, 95.1696, 30.91];
    // const lanLon_in = [[95.1617, 30.8902, 95.1668, 30.8882, 95.1766, 30.8939, 95.1696, 30.8996]];
    const polygonEntity = this.webGlobe.appendHolePolygon(
      name,
      latLonOut,
      lanLonIn,
      options
    )
    this.entityArray.push(polygonEntity)
    return polygonEntity
  }

  /**
   * 根据给定点画贴地多边形
   * @param  {Array} outPnts   外圈坐标数组（经纬度）
   * @param  {Array} inerPnts  内圈坐标数组（经纬度）:[[x1,y1,x2,y2,x3,y3]]
   * @param  {Color} color     填充颜色(默认不指定时为蓝色) 通过getColor(red, green, blue, alpha)
   */
  public addGroundPolygon(latLonOut: any[], lanLonIn: any[], color: any) {
    if (!this.webGlobe) {
      console.log('webGlobe缺失')
      return null
    }
    // const latLon_out = [95.1550, 30.8902, 95.1668, 30.8800, 95.1836, 30.8902, 95.1696, 30.91];
    // const lanLon_in = [[95.1617, 30.8902, 95.1668, 30.8882, 95.1766, 30.8939, 95.1696, 30.8996]];
    // const color = new cesium.ColorGeometryInstanceAttribute(0.0, 1.0, 1.0, 0.5);
    const primitive = this.webGlobe.appendGroundPolygon(
      latLonOut,
      lanLonIn,
      color
    )
    this.entityArray.push(primitive)
    return primitive
  }

  /**
   * 根据给定点画贴地多边形(在三维地形上面添加)
   * @param  {Array} outPnts   外圈坐标数组（经纬度）
   * @param  {Array} inerPnts  内圈坐标数组（经纬度）:[[x1,y1,x2,y2,x3,y3]]
   * @param  {Color} color     填充颜色(默认不指定时为蓝色) 通过getColor(red, green, blue, alpha)
   */
  public addHolePolygonOnTerrain(
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
    // const latLon_out = [95.1550, 30.8902, 95.1668, 30.8800, 95.1836, 30.8902, 95.1696, 30.91];
    // const lanLon_in = [[95.1617, 30.8902, 95.1668, 30.8882, 95.1766, 30.8939, 95.1696, 30.8996]];
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
    this.entityArray.push(primitive)
    return primitive
  }

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
   *  const labelIcon = addLabelIcon('注记文本',110,33,0,'14pt 楷体','/car.png',64,64,10000000,1,bottom,'这是属性信息查询时可以看到');
   * @return {entity} labelIcon  图标注记对象 移除通过removeEntity(entity)
   */
  public addLabelIcon(opt: Record<string, any>) {
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
   * 添加标注点
   * @param option
   * @returns
   */
  public addPoint(opt: Record<string, any>) {
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
    const font = opt.font || 6
    const fillColor = opt.fillColor || ''
    const outLineColor = opt.outLineColor || ''
    const outlineWidth = opt.outlineWidth || 0
    opt.name = opt.name || 'pictureLabel'
    const labelIcon = this.webGlobe.appendPoint(
      lon,
      lat,
      height,
      text,
      font,
      fillColor,
      outLineColor,
      outlineWidth
    )
    if (opt.id) {
      labelIcon.id = opt.id
    }

    this.entityArray.push(labelIcon)
    return labelIcon
  }

  /**
   * 添加标注点
   * @param {Object} option 参数对象
   * @returns {object} markerEntity
   */
  public addMarker(option: Record<string, any>) {
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

    // 计算中心点
    option.center = option.center || getGeoJSONFeatureCenter(option.features[0])
    const markerEntity = this.addLabelIcon({
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
            this.markerMouseOut(event, option)
          }
    this.markerOptions.push(option)
    if (this.markerOptions.length == 1) {
      this.registerMarkerMouseEvent()
    }

    return markerEntity
  }

  /**
   * 通过名称删除实体对象
   * @param  {string} name 实体对象
   */
  public removeEntityByName(name: string) {
    const entities = this.entityArray
    for (let i = this.entityArray.length - 1; i > -1; i -= 1) {
      if (entities[i] && entities[i]._name && entities[i]._name === name) {
        this.removeEntity(entities[i])
      }
    }

    // 同时删除markerOptions里面存放的数据
    this.removeMarkerByName(name)
  }

  /**
   * 移除所有实体对象
   */
  public removeAllEntities() {
    this.entityArray.forEach(entity => {
      this.removeEntity(entity)
    })
    this.entityArray = []

    if (this.markerOptions.length) {
      this.unregisterMarkerMouseEvent()
      this.markerOptions = []
    }
  }

  /**
   * 注册标注鼠标事件
   */
  public registerMarkerMouseEvent() {
    // 注册鼠标移动事件
    this.webGlobe.registerMouseEvent('MOUSE_MOVE', event => {
      // 标注点增加hover响应
      this.pickMarker(event)
    })
  }

  /**
   * 注销标注鼠标事件
   */
  public unregisterMarkerMouseEvent() {
    this.webGlobe.unRegisterMouseEvent('MOUSE_MOVE')
  }

  /**
   * 移除指定实体
   * @param  {entity} entity 实体对象
   */
  private removeEntity(entity: any) {
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
   * 只删除markerOptions里面存放的数据
   * @param  {string} name 实体对象
   */
  private removeMarkerByName(name: string) {
    const markers = this.markerOptions
    for (let i = 0; i < markers.length; i += 1) {
      if (markers[i] && markers[i].name && markers[i].name === name) {
        markers.splice(i, 1)
      }
    }

    if (this.markerOptions.length == 0) {
      this.unregisterMarkerMouseEvent()
    }
  }

  private markerMouseOver(event: any, option: any) {}

  private markerMouseOut(event: any, option: any) {}

  /**
   * hover拾取标注
   * @param {Event} event 事件对象
   */
  private pickMarker(event: any) {
    if (this.markerOptions.length == 0) return

    const options = this.markerOptions
    const collection = this.webGlobe.scene.pick(event.endPosition)
    for (let i = 0; i < options.length; i += 1) {
      const option = options[i]
      if (
        collection &&
        collection.id &&
        collection.id._id &&
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
