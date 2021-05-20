import { Component, Prop, Watch, Mixins } from 'vue-property-decorator'
import { UUID, MapMixin } from '@mapgis/web-app-framework'
import { FeatureIGS, utilInstance } from '@mapgis/pan-spatial-map-store'
import isFunction from 'lodash/isFunction'

@Component
export default class MapboxMinxin extends Mixins<Record<string, any>>(
  MapMixin
) {
  // 专题的配置
  @Prop({ default: () => ({}) }) config!: any

  // 专题某年度的要素数据
  @Prop({ default: () => ({}) }) dataSet!: FeatureIGS

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

  /**
   * 监听: 要素数据变化
   */
  @Watch('dataSet', { deep: true })
  watchDataSet(nV: FeatureIGS | null) {
    if (nV) {
      this.initLayer()
    } else {
      this.removeLayer()
    }
  }

  created() {
    this.initLayer()
  }

  beforeDestroy() {
    this.removeLayer()
  }
}
