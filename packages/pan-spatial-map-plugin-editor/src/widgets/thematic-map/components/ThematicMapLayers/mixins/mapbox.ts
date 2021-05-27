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

  showedPopup = false

  properties: any = {}

  coordinates: number[] = [118.01427796777404, 36.29607217078218]

  // 获取某个专题某个年度的subData
  get subDataConfig() {
    return this.config.configSubData
  }

  // 信息弹框字段配置
  get popupConfig() {
    return this.subDataConfig.popup
  }

  /**
   * 显示图层
   */
  showLayer() {
    if (!this.dataSet) return
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
   * 展示信息窗口
   */
  showInfoWin(e: any) {
    this.closeInfoWin()
    this.showedPopup = true
    this.showMapboxInfoWin(e)
  }

  /**
   * 关闭信息窗口
   */
  closeInfoWin() {
    this.showedPopup = false
    this.properties = {}
    this.coordinates = [0, 0]
  }
}
