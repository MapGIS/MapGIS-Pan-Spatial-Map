import { Component, Mixins } from 'vue-property-decorator'
import { UUID, MapMixin } from '@mapgis/web-app-framework'
import BaseMinxin from './base'

@Component
export default class MapboxMinxin extends Mixins<Record<string, any>>(
  BaseMinxin,
  MapMixin
) {
  id = UUID.uuid()

  thematicMapLayer: any = null

  showPopup = false

  properties = null

  coordinates: number[] = [0, 0]

  // 信息弹框字段配置
  get popupConfig() {
    return this.subDataConfig.popup
  }

  /**
   * 显示图层
   */
  showLayer() {
    if (!this.dataSet) return
    this.removeLayer()
    this.showMapboxLayer()
  }

  /**
   * 移除图层
   */
  removeLayer() {
    if (this.thematicMapLayer) {
      const { id } = this.thematicMapLayer
      if (this.map.getLayer(id)) {
        this.map.removeLayer(id)
      } else {
        if (this.thematicMapLayer.clear) {
          this.thematicMapLayer.clear()
        }
        if (this.thematicMapLayer.removeFromMap) {
          this.thematicMapLayer.removeFromMap()
        }
      }
      this.thematicMapLayer = null
    }
  }

  /**
   * 开启信息窗口
   */
  showInfoWin(e) {
    this.showPopup = true
    this.showMapboxInfoWin(e)
  }

  /**
   * 关闭信息窗口
   */
  closeInfoWin() {
    this.showPopup = false
    this.properties = null
    this.coordinates = [0, 0]
  }
}
