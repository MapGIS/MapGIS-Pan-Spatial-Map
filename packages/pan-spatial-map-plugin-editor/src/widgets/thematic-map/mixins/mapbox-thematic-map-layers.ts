import { Component, Prop, Watch, Mixins } from 'vue-property-decorator'
import { UUID, MapMixin } from '@mapgis/web-app-framework'
import { FeatureIGS, utilInstance } from '@mapgis/pan-spatial-map-store'
import isFunction from 'lodash/isFunction'

@Component
export default class MapboxThematicMapLayersMinxin extends Mixins(MapMixin) {
  // 某个专题的配置
  @Prop({ default: () => ({}) }) config!: any

  // 某个专题配置features
  @Prop({ default: () => ({}) }) dataSet!: FeatureIGS

  id = UUID.uuid()

  thematicMapLayer: any = {}

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
   * 初始化图层
   */
  initLayer() {
    this.showLayer()
  }

  /**
   * 显示图层，子组件在这里实现生成图层的函数
   */
  showLayer() {}

  /**
   * 移除图层
   */
  removeLayer() {
    if (this.thematicMapLayer) {
      const { id } = this.thematicMapLayer
      if (this.map.getLayer(id)) {
        this.map.removeLayer(id)
      } else {
        if (isFunction(this.thematicMapLayer.clear)) {
          this.thematicMapLayer.clear()
        }
        if (isFunction(this.thematicMapLayer.removeFromMap)) {
          this.thematicMapLayer.removeFromMap()
        }
      }
      this.thematicMapLayer = null
    }
  }

  /**
   * 重置图层
   */
  resetLayer() {
    this.initLayer()
  }

  @Watch('dataSet', { deep: true })
  watchDataSet() {
    this.initLayer()
  }

  mounted() {
    this.initLayer()
  }

  beforeDestroy() {
    this.removeLayer()
  }
}
