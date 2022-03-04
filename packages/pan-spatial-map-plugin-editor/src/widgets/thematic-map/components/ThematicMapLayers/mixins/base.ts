import { Component, Prop, Watch, Vue } from 'vue-property-decorator'
import { UUID, Feature } from '@mapgis/web-app-framework'
import { hasHighlightSubjectList, ISubjectData } from '../../../store'

interface IMarker {
  img: string
  feature: Feature.GFeature
  properties: Feature.GFeature['properties']
  coordinates: number[]
  fid: string
  markerId: string
}

@Component
export default class BaseMixin extends Vue {
  // 高亮的标注信息
  @Prop({ default: () => ({}) }) readonly marker!: IMarker

  // 某专题配置
  @Prop({ default: () => ({}) })
  readonly subjectData!: ISubjectData

  // 某专题某年度的要素GeoJson数据
  @Prop({ default: () => ({}) })
  readonly geojson!: Feature.FeatureIGSGeoJSON | null

  /**
   * 监听: 要素geojson数据变化
   */
  @Watch('geojson', { deep: true })
  geojsonChanged() {
    this.removeLayer()
    this.showLayer()
  }

  id = UUID.uuid()

  // 是否支持图属高亮
  get hasHighlight() {
    return this.subjectData
      ? hasHighlightSubjectList.includes(this.subjectData.subjectType)
      : false
  }

  // 获取统计属性
  get field() {
    return this.subjectData?.field
  }

  get popup() {
    return this.subjectData ? this.subjectData.popup : undefined
  }

  get propertiesOption() {
    let propertiesOption
    if (this.popup) {
      const { showFields, showFieldsTitle } = this.popup
      if (showFields && showFields.length > 0) {
        propertiesOption = { fields: showFields, fieldsTitle: showFieldsTitle }
      }
    }
    return propertiesOption
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
