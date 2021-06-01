import { Component, Prop, Watch, Vue, Mixins } from 'vue-property-decorator'
import {
  queryFeaturesInstance,
  FeatureIGS,
  FeatureGeoJSON
} from '@mapgis/pan-spatial-map-store'

@Component
export default class BaseMinxin extends Mixins<Record<string, any>>(Vue) {
  // 专题的配置
  @Prop({ default: () => ({}) }) subDataConfig!: any

  // 专题某年度的要素数据
  @Prop({ default: () => ({}) }) dataSet!: FeatureIGS

  /**
   * 监听: 要素数据变化
   */
  @Watch('dataSet', { deep: true })
  watchDataSet(nV: FeatureIGS | null) {
    if (nV && nV.SFEleArray) {
      this.showLayer()
    } else {
      this.removeLayer()
    }
  }

  /**
   * geojson
   */
  get geojson(): FeatureGeoJSON | null {
    return this.dataSet
      ? queryFeaturesInstance.igsFeaturesToGeoJSONFeatures(this.dataSet)
      : null
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
