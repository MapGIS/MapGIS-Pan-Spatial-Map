import { Component, Mixins, Watch, Inject } from 'vue-property-decorator'
import { UUID, Layer, ColorUtil, Feature } from '@mapgis/web-app-framework'
import BaseMixin from './base'
import { getMarker } from '../../../utils'

interface ILngLat {
  longitude?: number
  latitude?: number
}
@Component
export default class CesiumMixin extends Mixins(BaseMixin) {
  @Inject('webGlobe') webGlobe

  @Inject('Cesium') Cesium

  @Inject('CesiumZondy') CesiumZondy

  @Watch('marker.fid')
  fidChanged() {
    this.selfMarker = this.marker
  }

  private thematicMapLayer = null

  private selfMarker: any = {}

  private showPopup = false

  private popupProperties = null

  private popupPosition: ILngLat = {}

  // 信息弹框字段配置
  get popupConfig() {
    return this.subjectData?.popup || {}
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
  addEntityToLayer(layer: Layer, feature: Feature.GFeature, option = {}) {
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
    const { r, g, b, a } = ColorUtil.getColorObject(color)
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
        const { geojsonFeature } = pick.id
        const { fid } = geojsonFeature.properties
        getMarker(geojsonFeature, fid).then(
          marker => (this.selfMarker = marker || {})
        )
        this.emitHighlight(fid)
      }
    })
  }

  /**
   * 关闭实体弹框
   */
  closePopupWin() {
    this.emitClearHighlight()
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
