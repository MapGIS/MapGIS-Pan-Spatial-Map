import { Component, Mixins, Watch, Inject } from 'vue-property-decorator'
import { Layer, ColorUtil, Feature, Overlay } from '@mapgis/web-app-framework'
import { getMarker, IMarker } from '../../../utils'
import BaseMixin from './base'

@Component
export default class CesiumMixin extends Mixins(BaseMixin) {
  @Inject('viewer') viewer

  @Inject('Cesium') Cesium

  @Inject('vueCesium') vueCesium

  // 专题图层
  private thematicMapLayer = null

  // 标注
  private selfMarker: any = {}

  private sceneOverlays: any = undefined

  /**
   * 监听：图属联动变化
   */
  @Watch('marker.fid')
  fidChanged() {
    this.setSelfMarker(this.marker)
  }

  /**
   * 公共方法：添加实体到图层
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
   * 公共方法：移除所有实体
   * @param layer 图层
   */
  removeAllEntity(layer: Layer) {
    if (layer) {
      layer.entities.removeAll()
    }
  }

  /**
   * 公共方法：获取颜色值
   * @param color 颜色
   */
  getColor(color: string) {
    const { r, g, b, a } = ColorUtil.getColorObject(color)
    return new this.Cesium.Color(r / 255, g / 255, b / 255, a)
  }

  /**
   * 公共方法：获取颜色值
   * @param color 颜色
   */
  getCssColorStr(color: string) {
    return new this.Cesium.Color.fromCssColorString(color)
  }

  /**
   * 公共方法：获取Cartesian坐标
   * @param lng
   * @param lat
   * @param alt
   */
  getPosition(lng: number, lat: number, alt = 0) {
    return new this.Cesium.Cartesian3.fromDegrees(lng, lat, alt)
  }

  /**
   * 添加图层
   */
  addDataSourceToViewer(layer: Layer) {
    if (layer) {
      this.viewer.dataSources.add(layer)
    }
  }

  /**
   * 移除图层
   * @param layer 图层
   */
  removeViewerLayer(layer: Layer) {
    if (layer) {
      this.viewer.dataSources.remove(layer)
      layer = null
    }
  }

  /**
   * fixme 设置标注
   * Mp3dMarkerPro组件默认初始marker时不会展示popup弹框。暂不考虑扩展Mp3dMarkerPro组件，因为该组件已被下沉，可能有不稳定的因素，故由上层根据需要手动控制popup弹框的展示。
   * 需要注意的是如果Mp3dMarkerPro组件的showPopup字段被改名，需同步此处代码。
   */
  setSelfMarker(marker?: IMarker) {
    this.selfMarker = {}
    if (marker) {
      this.selfMarker = marker
      this.$nextTick(() => {
        const markerRef: any = this.$refs.marker3dProRef
        if (markerRef && typeof markerRef.showPopup !== 'undefined') {
          markerRef.showPopup = true
        }
      })
    }
  }

  /**
   * 点击显示实体弹框
   */
  showPopupWin() {
    const { viewer, propertiesOption } = this
    let { sceneOverlays } = this
    if (!sceneOverlays) {
      sceneOverlays = Overlay.SceneOverlays.getInstance(
        this.Cesium,
        this.vueCesium,
        viewer
      )
    }
    const { scene } = viewer
    sceneOverlays.unRegisterMouseEvent('LEFT_CLICK')
    sceneOverlays.registerMouseEvent('LEFT_CLICK', ({ position }) => {
      this.closePopupWin()
      const pick = scene.pick(position)
      if (pick && pick.id) {
        const { geojsonFeature } = pick.id
        const { fid } = geojsonFeature.properties
        getMarker(geojsonFeature, fid, propertiesOption).then(
          this.setSelfMarker
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
