import { Component, Prop, Watch, Vue, Mixins } from 'vue-property-decorator'
import { MapMixin, Feature } from '@mapgis/web-app-framework'
import _isNumber from 'lodash/isNumber'
import { highlightSubjectTypes } from '../../../store'

@Component
export default class BaseMinxin extends Mixins<Record<string, any>>(MapMixin) {
  // 组件唯一值
  @Prop({ default: 'map' }) readonly vueKey!: string

  // 专题配置
  @Prop({ default: () => ({}) }) readonly subjectData!: any

  // 专题某年度的要素数据
  @Prop({ default: () => ({}) }) readonly dataSet!: Feature.FeatureIGS

  /**
   * 监听: 要素数据变化
   */
  @Watch('dataSet', { deep: true })
  watchDataSet(nV: Feature.FeatureIGS | null) {
    if (nV && nV.SFEleArray) {
      this.showLayer()
    } else {
      this.removeLayer()
    }
  }

  // 是否支持图属高亮
  get hasHighlight() {
    return highlightSubjectTypes.includes(this.subjectData.subjectType)
  }

  // 获取geojson数据
  get geojson(): Feature.FeatureGeoJSON | null {
    return this.dataSet
      ? Feature.FeatureConvert.featureIGSToFeatureGeoJSON(this.dataSet)
      : null
  }

  /**
   * 给geojson数据添加权重
   * @param geojson
   * @returns
   */
  addCountToGeoJSON(geojson: Feature.FeatureGeoJSON) {
    const { weight, style } = this.subjectData
    const _weight = weight || (style ? style.weight : 0)
    const count = _isNumber(_weight)
      ? _weight
      : _weight
      ? Number(_weight)
      : null
    const features = geojson.features.map((feature: Feature.GFeature) => ({
      ...feature,
      properties: {
        ...feature.properties,
        count
      }
    }))
    return {
      ...geojson,
      features
    }
  }

  /**
   * 专题图鼠标移入高亮
   * @param 移入的要素数据索引
   */
  emitHighlight(itemIndex: number) {
    if (this.hasHighlight) {
      this.$emit('highlight', {
        from: this.vueKey,
        itemIndex
      })
    }
  }

  /**
   * 清除专题图高亮
   */
  emitClearHighlight() {
    if (this.hasHighlight) {
      this.$emit('clear-highlight')
    }
  }

  /**
   * 显示图层
   */
  showLayer() {}

  /**
   * 移除图层
   */
  removeLayer() {}

  created() {
    this.showLayer()
  }

  beforeDestroy() {
    this.removeLayer()
  }
}
