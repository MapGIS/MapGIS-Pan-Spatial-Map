import { Component, Mixins, Inject } from 'vue-property-decorator'
import { UUID, Layer } from '@mapgis/web-app-framework'
import {
  GFeature,
  utilInstance,
  cesiumUtilInstance
} from '@mapgis/pan-spatial-map-store'
import BaseMinxin from './base'

interface ILngLat {
  longitude?: number
  latitude?: number
}
@Component
export default class CesiumMinxin extends Mixins<Record<string, any>>(
  BaseMinxin
) {
  @Inject('CesiumZondy') CesiumZondy

  id = UUID.uuid()

  thematicMapLayer: any = null

  showPopup = false

  popupProperties: any = null

  popupPosition: ILngLat = {}

  // 信息弹框字段配置
  get popupConfig() {
    return this.subDataConfig.popup
  }

  /**
   * 添加图层
   */
  addDataSourceToViewer(layer: Layer) {
    if (layer) {
      this.webGlobe.viewer.dataSources.add(layer)
    }
  }

  /**
   * 移除图层
   * @param layer 图层
   */
  removeViewerLayer(layer: Layer) {
    if (layer) {
      this.webGlobe.viewer.dataSources.remove(layer)
      layer = null
    }
  }

  /**
   * 添加实体到图层
   * @param layer 图层
   * @param feature 要素数据
   * @param option 实体配置
   */
  addEntityToLayer(layer: Layer, feature: GFeature, option: any) {
    const entity = new this.Cesium.Entity(option)
    entity.geojsonFeature = feature
    layer.entities.add(entity)
  }

  /**
   * 移除所有实体
   * @param layer 图层
   */
  removeAllEntity(layer: Layer) {
    if (layer) {
      layer.entities.removeAll()
    }
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
   * 获取颜色值
   * @param color 颜色
   */
  getCssColorStr(color: string) {
    return new this.Cesium.Color.fromCssColorString(color)
  }

  /**
   * 获取Cartesian坐标
   * @param lng
   * @param lat
   * @param alt
   */
  getPosition(lng: number, lat: number, alt = 0) {
    return new this.Cesium.Cartesian3.fromDegrees(lng, lat, alt)
  }

  /**
   * 获取实体弹框的信息
   * @param feature 要素数据
   */
  getPopupInfos(feature: GFeature | null) {
    const { showFields, showFieldsTitle } = this.popupConfig
    if (!feature || !showFields || !showFields.length) return
    this.popupProperties = showFields.reduce((obj: any, v: string) => {
      const tag = showFieldsTitle[v] ? showFieldsTitle[v] : v
      obj[tag] = feature.properties[v]
      return obj
    }, {})
  }

  /**
   * 获取经纬度坐标
   * @param CommonFuncManager
   * @param position 屏幕位置坐标
   */
  getCartographic(CommonFuncManager: any, position: any) {
    const {
      longitude,
      latitude
    } = CommonFuncManager.screenPositionToCartographic(position)
    this.popupPosition = Object.entries({ longitude, latitude }).reduce(
      (obj, [k, v]) => {
        obj[k] = this.Cesium.Math.toDegrees(v)
        return obj
      },
      {} as ILngLat
    )
  }

  /**
   * 点击显示实体弹框
   */
  showPopupWin() {
    const { viewer, scene } = this.webGlobe
    const { Manager } = this.CesiumZondy
    const mouseEventManager = new Manager.MouseEventManager({ viewer })
    const CommonFuncManager = new Manager.CommonFuncManager({ viewer })
    mouseEventManager.unRegisterMouseEvent('LEFT_CLICK')
    mouseEventManager.registerMouseEvent('LEFT_CLICK', ({ position }) => {
      this.closePopupWin()
      const pick = scene.pick(position)
      if (pick && pick.id) {
        this.getCartographic(CommonFuncManager, position)
        this.getPopupInfos(pick.id.geojsonFeature)
        this.showPopup = true
        console.log('图层实体列表', this.thematicMapLayer.entities)
        console.log('位置', this.popupPosition)
        console.log('弹框信息', this.popupProperties)
      }
    })
  }

  /**
   * 关闭实体弹框
   */
  closePopupWin() {
    this.showPopup = false
    this.popupPosition = {}
    this.popupProperties = null
  }

  /**
   * 显示图层
   */
  showLayer() {
    this.removeLayer()
    if (!this.thematicMapLayer) {
      this.thematicMapLayer = new this.Cesium.CustomDataSource(this.id)
    }
    this.addGeoJSONFeaturesToEntity(this.thematicMapLayer)
    this.addDataSourceToViewer(this.thematicMapLayer)
    this.showPopupWin()
  }

  /**
   * 移除图层
   */
  removeLayer() {
    if (this.thematicMapLayer) {
      this.removeViewerLayer(this.thematicMapLayer)
      this.removeAllEntity(this.thematicMapLayer)
      this.closePopupWin()
    }
  }
}
