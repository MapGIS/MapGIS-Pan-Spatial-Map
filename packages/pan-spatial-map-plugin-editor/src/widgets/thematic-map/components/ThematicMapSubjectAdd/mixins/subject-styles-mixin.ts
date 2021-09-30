import { Vue, Component, Prop, Watch } from 'vue-property-decorator'
import { UUID, Feature } from '@mapgis/web-app-framework'
import dep from '../store/dep'
import fieldInstance from '../store/fields'

@Component
export default class SubjectStylesMixin extends Vue {
  @Prop({ type: Object }) readonly value!: any

  private id: string = UUID.uuid()

  private customFormRef: Vue | null = null // 主组件赋值

  private dataSource: Feature.FeatureGeoJSON | null = null

  get field() {
    return this.value.field
  }

  @Watch('field')
  fieldChanged(nV: string) {
    fieldInstance
      .getFieldGeoJson({
        fields: nV,
        ...this.value
      })
      .then(geojson => (this.dataSource = geojson))
  }

  /**
   * 保存时获取配置数据
   * @param {string} [key='themeStyle'] key 保存的字段名
   */
  getFormResult(key = 'themeStyle') {
    if (this.customFormRef) {
      return {
        [key]: this.customFormRef.$_getForm()
      }
    }
    return {}
  }

  mounted() {
    dep.addSub(this)
  }

  beforeDestroy() {
    dep.removeSub(this)
  }
}
