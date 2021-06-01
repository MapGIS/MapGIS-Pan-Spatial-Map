/* eslint-disable no-new */
import { Component, Mixins } from 'vue-property-decorator'
import { UUID, MapMixin, Layer } from '@mapgis/web-app-framework'
import { GFeature, utilInstance } from '@mapgis/pan-spatial-map-store'
import BaseMinxin from './base'

interface IPopupConfig {
  showFields: string[]
  showFieldsTitle: Record<string, string>
}
interface ILngLat {
  longitude?: number
  latitude?: number
}

interface IPoint {
  lng: number
  lat: number
  alt: number
  x: number
  y: number
  z: number
}

interface IPopupPosition extends ILngLat {
  height?: number
}
@Component
export default class CesiumMinxin extends Mixins<Record<string, any>>(
  BaseMinxin,
  MapMixin
) {
  id = UUID.uuid()

  thematicMapLayer: any = null

  material: any = null

  attrTable = ''

  popupEntity: any = null

  popupPosition: IPopupPosition = {}

  popupStyle = {
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    textColor: 'rgba(255, 255, 255, 1)',
    textSize: 21
  }

  // 信息弹框字段配置
  get popupConfig(): IPopupConfig | undefined {
    return this.subDataConfig.popup
  }

  // 位置信息
  get position() {
    const { longitude, latitude } = this.popupPosition
    return {
      longitude,
      latitude
    }
  }

  /**
   * 1
   * @param layer
   * @param option
   */
  addEntityToLayer(layer: Layer, option: any) {
    return layer.entities.add(new this.Cesium.Entity(option))
  }

  /**
   * 获取颜色值
   * @param color 颜色
   */
  getColor(color: string) {
    const { r, g, b, a } = utilInstance.getRGBA(color)
    return new this.Cesium.Color(r / 255, g / 255, b / 255, a)
  }

  /**
   * 获取位置坐标
   * @param lng
   * @param lat
   * @param alt
   */
  getPosition(lng: number, lat: number, alt = 0) {
    return new this.Cesium.Cartesian3.fromDegrees(lng, lat, alt)
  }

  /**
   * 根据配置项生成popup显示内容
   * @param feature
   */
  getPopupContent({ properties }: GFeature) {
    if (this.popupConfig) {
      const { showFields, showFieldsTitle } = this.popupConfig
      return showFields.reduce<string>((str, v) => {
        const tag = showFieldsTitle[v] ? showFieldsTitle[v] : v
        str += `<div>${tag}：${properties[v]}</div>`
        return str
      }, '')
    }
    return ''
  }

  /**
   * 获取笛卡尔坐标
   * @param position
   */
  getFromCartesian(position: any) {
    const {
      longitude,
      latitude,
      height
    } = this.Cesium.Cartographic.fromCartesian(position)
    const lngAndlat = Object.entries({ longitude, latitude }).reduce(
      (obj, v, k) => {
        obj[k] = this.Cesium.Math.toDegrees(v)
        return obj
      },
      {} as ILngLat
    )
    return {
      ...lngAndlat,
      height
    }
  }

  /**
   * 设置材质
   * @param id
   */
  setMaterial(id: any) {
    if (this.pickEntity) {
      this.pickEntity.material = this.material
    }
    const props = [
      'cylinder',
      'corridor',
      'polylineVolume',
      'polyline',
      'polygon'
    ]
    props.forEach(v => {
      if (id[v]) {
        this.pickEntity = id[v]
      }
    })
    if (this.pickEntity) {
      this.material = this.pickEntity.material
      this.pickEntity.material = this.getColor('#ff0000')
    }
  }

  /**
   * 显示弹出框
   */
  showPopup({ scene }: any, position: any) {
    const pick = scene.pick(position)
    if (pick && pick.id) {
      const {
        id,
        id: { attrTable }
      } = pick
      this.attrTable = `${attrTable}`
      const RayInstance = new this.Cesium.Ray()
      const Cartesian3Instance = new this.Cesium.Cartesian3()
      const pickRay = scene.camera.getPickRay(position, RayInstance)
      const pickPosition1 = scene.globe.pick(pickRay, scene, Cartesian3Instance)
      const pickPosition2 = scene.pickPosition(position)
      if (!pickPosition1 && !pickPosition2) return
      scene.postProcessStages.fxaa.enabled = false
      const { longitude, latitude, height } = this.getFromCartesian(
        pickPosition2 || pickPosition1
      )
      this.popupPosition = {
        longitude,
        latitude,
        height: height > 0 ? height : 0
      }
      this.setMaterial(id)
    }
  }

  /**
   * 右击显示弹出框
   * @param globe
   */
  clickShowPopup(globe: any) {
    const handler3D = new this.Cesium.ScreenSpaceEventHandler(
      globe.scene.canvas
    )
    handler3D.setInputAction(({ position }) => {
      this.showPopup(globe, position)
    }, this.Cesium.ScreenSpaceEventType.LEFT_CLICK)
  }

  /**
   * WGS84坐标系转笛卡尔坐标系(经纬度转换为世界坐标)
   * @param point
   */
  WGS84ToCartesian3(point: IPoint) {
    if (!point) return
    const { lng, lat, alt } = point
    const { x, y, z } = this.getPosition(lng, lat, alt)
    return { x, y, z }
  }

  /**
   * 笛卡尔坐标系转WGS84坐标系(世界坐标转换为经纬度)
   * @param point
   */
  Cartesian3ToWGS84(point: IPoint) {
    if (!point) return
    const { x, y, z } = point
    const cartesian3 = new this.Cesium.Cartesian3(x, y, z)
    const {
      longitude: lng,
      latitude: lat,
      height: alt
    } = this.getFromCartesian(cartesian3)
    return {
      lng,
      lat,
      alt
    }
  }

  /**
   * 显示图层
   */
  showLayer() {
    this.removeLayer()
    if (!this.thematicMapLayer) {
      this.thematicMapLayer = new this.Cesium.CustomDataSource(this.id)
    }
    this.showCesiumLayer()
  }

  /**
   * 移除图层
   */
  removeLayer() {
    if (this.thematicMapLayer) {
      this.webGlobe.viewer.dataSources.remove(this.thematicMapLayer)
      this.thematicMapLayer.entities.removeAll()
      this.thematicMapLayer = null
    }
  }
}
