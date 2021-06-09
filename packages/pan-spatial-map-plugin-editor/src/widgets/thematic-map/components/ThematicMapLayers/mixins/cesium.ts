/* eslint-disable no-new */
import { Component, Mixins } from 'vue-property-decorator'
import { UUID, Layer } from '@mapgis/web-app-framework'
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
  BaseMinxin
) {
  id = UUID.uuid()

  thematicMapLayer: any = null

  material = null

  properties: any = null

  popupPosition: IPopupPosition = {}

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
   * 展示信息窗口
   */
  getPopupInfos({ target }: any) {
    const { showFields, showFieldsTitle } = this.popupConfig as IPopupConfig
    if (!target || !target.refDataID || !showFields || !showFields.length) {
      return
    }
    const feature = this.thematicMapLayer.getFeatureById(target.refDataID)
    if (feature) {
      const { attributes } = feature
      this.properties = showFields.reduce((obj, v: string) => {
        const tag = showFieldsTitle[v] ? showFieldsTitle[v] : v
        obj[tag] = attributes[v]
        return obj
      }, {})
    }
  }

  /**
   * 显示弹出框
   */
  getPopupPosition(scene: any, position: any) {
    const pick = scene.pick(position)
    if (pick && pick.id) {
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
    }
  }

  /**
   * 右击显示弹出框
   */
  showPopupWin() {
    const handler3D = new this.Cesium.ScreenSpaceEventHandler(
      this.webGlobe.scene.canvas
    )
    handler3D.setInputAction(e => {
      const { position } = e
      // this.getPopupInfos()
      this.getPopupPosition(this.webGlobe.scene, position)
    }, this.Cesium.ScreenSpaceEventType.LEFT_CLICK)
  }

  /**
   * 显示图层
   */
  showLayer() {
    this.removeLayer()
    if (!this.thematicMapLayer) {
      this.thematicMapLayer = new this.Cesium.CustomDataSource(this.id)
    }
    this.getGeoJSONFeaturesLayer()
    this.webGlobe.viewer.dataSources.add(this.thematicMapLayer)
    this.showPopupWin()
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
