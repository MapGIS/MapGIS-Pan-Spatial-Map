import { Vue, Component, Prop, Watch } from 'vue-property-decorator'
import { UUID, Feature } from '@mapgis/web-app-framework'
import dep from '../store/dep'

@Component
export default class SubjectStylesMixin extends Vue {
  @Prop({ type: Object }) readonly value!: any

  private id: string = UUID.uuid()

  private dataSource: Feature.FeatureGeoJSON | null = null

  get field() {
    return this.value.field
  }

  @Watch('field')
  fieldChanged(nV: string) {
    dep
      .getFieldGeoJson({
        field: nV,
        ...this.value
      })
      .then(dataSource => (this.dataSource = dataSource))
  }

  mounted() {
    dep.addSub(this)
  }

  beforeDestroy() {
    dep.removeSub(this)
  }
}
