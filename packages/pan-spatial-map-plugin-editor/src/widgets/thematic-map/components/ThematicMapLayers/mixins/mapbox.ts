import { Component, Mixins } from 'vue-property-decorator'
import { UUID, MapMixin } from '@mapgis/web-app-framework'
import { utilInstance } from '@mapgis/pan-spatial-map-store'
import isFunction from 'lodash/isFunction'
import BaseMinxin from './base'

@Component
export default class MapboxMinxin extends Mixins<Record<string, any>>(
  BaseMinxin,
  MapMixin
) {
  id = UUID.uuid()

  thematicMapLayer: Record<string, any> | null = null

  properties: Record<string, any> = {}

  coordinates = [0, 0]

  // 获取某个专题某个年度的subData
  get subDataConfig() {
    return this.config.configSubData
  }

  // 图表title
  get field() {
    return this.subDataConfig.field
  }

  // 信息弹框字段配置
  get popupConfig() {
    return this.subDataConfig.popup
  }

  // 信息弹框展示字段
  get propertiesKeys() {
    return utilInstance.getJsonTag(this.properties)
  }

  /**
   * 显示图层
   */
  showLayer () {
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
        const { clear, removeFromMap } = this.thematicMapLayer
        if (isFunction(clear)) {
          clear.bind(this.thematicMapLayer)()
        }
        if (isFunction(removeFromMap)) {
          removeFromMap.bind(this.thematicMapLayer)()
        }
      }
      this.thematicMapLayer = null
    }
  }
}
