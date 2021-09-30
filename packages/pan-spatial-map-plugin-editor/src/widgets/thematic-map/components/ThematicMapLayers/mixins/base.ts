import { Component, Prop, Watch, Vue } from 'vue-property-decorator'
import { UUID, Feature } from '@mapgis/web-app-framework'
import { highlightSubjectTypes } from '../../../store'

@Component
export default class BaseMixin extends Vue {
  // 专题配置
  @Prop({ default: () => ({}) }) readonly subjectData!: any

  // 专题某年度的要素数据
  @Prop({ default: () => ({}) }) readonly dataSet!: Feature.FeatureIGS | null

  /**
   * 监听: 要素数据变化
   */
  @Watch('dataSet', { deep: true })
  watchDataSet(nV: Feature.FeatureIGS | null) {
    this.removeLayer()
    this.setGeoJSON(nV)
    this.showLayer()
  }

  private id = UUID.uuid()

  private geojson: Feature.FeatureGeoJSON = null

  // 是否支持图属高亮
  get hasHighlight() {
    return highlightSubjectTypes.includes(this.subjectData.subjectType)
  }

  // 获取统计属性
  get field() {
    return this.subjectData?.field
  }

  /**
   * 获取geojson数据
   * @param {object} dataSet json数据
   * @returns
   */
  setGeoJSON(dataSet: Feature.FeatureIGS | null = null) {
    this.geojson = dataSet
      ? Feature.FeatureConvert.featureIGSToFeatureGeoJSON(dataSet)
      : null
  }

  /**
   * 专题图鼠标移入高亮
   * @param 移入的要素数据索引
   */
  emitHighlight(dataIndex: number) {
    if (this.hasHighlight) {
      this.$emit('highlight', { dataIndex })
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
