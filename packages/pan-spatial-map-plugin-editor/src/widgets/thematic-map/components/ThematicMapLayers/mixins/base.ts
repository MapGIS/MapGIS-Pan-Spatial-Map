import { Component, Prop, Watch, Vue } from 'vue-property-decorator'
import { UUID, Feature } from '@mapgis/web-app-framework'
import { highlightSubjectTypes } from '../../../store'

@Component
export default class BaseMixin extends Vue {
  // 专题配置
  @Prop({ default: () => ({}) }) readonly subjectData!: any

  // 专题某年度的要素GeoJson数据
  @Prop({ default: () => ({}) })
  readonly geojson!: Feature.FeatureIGSGeoJSON | null

  /**
   * 监听: 要素数据变化
   */
  @Watch('geojson', { deep: true })
  watchDataSet() {
    this.removeLayer()
    this.showLayer()
  }

  private id = UUID.uuid()

  // 是否支持图属高亮
  get hasHighlight() {
    return highlightSubjectTypes.includes(this.subjectData.subjectType)
  }

  // 获取统计属性
  get field() {
    return this.subjectData?.field
  }

  /**
   * 专题图鼠标移入高亮
   * @param {string} fid 要素fid
   */
  emitHighlight(fid: string) {
    if (this.hasHighlight) {
      this.$emit('highlight', fid)
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
