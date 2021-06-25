import { Component, Prop, Watch, Vue, Mixins } from 'vue-property-decorator'
import { MapMixin, Feature } from '@mapgis/web-app-framework'

@Component
export default class BaseMinxin extends Mixins<Record<string, any>>(MapMixin) {
  // 专题的配置
  @Prop({ default: () => ({}) }) subDataConfig!: any

  // 专题某年度的要素数据
  @Prop({ default: () => ({}) }) dataSet!: Feature.FeatureIGS

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

  /**
   * geojson
   */
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
    const features = geojson.features.map((feature: Feature.GFeature) => ({
      ...feature,
      properties: {
        ...feature.properties,
        count: this.subDataConfig.weight
      }
    }))
    return {
      ...geojson,
      features
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
