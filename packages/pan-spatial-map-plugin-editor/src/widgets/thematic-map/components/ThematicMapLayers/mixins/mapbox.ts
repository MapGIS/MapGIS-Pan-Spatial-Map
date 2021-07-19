import { Component, Mixins } from 'vue-property-decorator'
import { UUID } from '@mapgis/web-app-framework'
import BaseMinxin from './base'

@Component
export default class MapboxMinxin extends Mixins<Record<string, any>>(
  BaseMinxin
) {
  id = UUID.uuid()

  thematicMapLayer: any = null

  showPopup = false

  properties = null

  coordinates: number[] = [0, 0]

  // 信息弹框字段配置
  get popupConfig() {
    return this.subjectData?.popup || {}
  }

  /**
   * 显示图层
   */
  showLayer() {
    this.removeLayer()
    if (!this.thematicMapLayer) {
      this.getThematicMapLayer()
    }
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
      this.closePopupWin()
    }
  }

  /**
   * 开启信息窗口
   */
  showPopupWin(e: any) {
    const { showFields } = this.popupConfig
    if (!e.target || !showFields || !showFields.length) return
    this.showPopup = true
    this.emitHighlight(e.target.refDataID - 1)
    this.getPopupInfos(e, this.popupConfig)
  }

  /**
   * 关闭信息窗口
   */
  closePopupWin() {
    this.showPopup = false
    this.properties = null
    this.coordinates = [0, 0]
    this.emitClearHighlight()
  }
}
