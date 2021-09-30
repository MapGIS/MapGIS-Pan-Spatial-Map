import { Vue, Component, Prop, Watch } from 'vue-property-decorator'
import { UUID, Feature } from '@mapgis/web-app-framework'
import { FeatureFormatType, resolveFeatureQuery } from '../../../store'
import dep from '../store/dep'

@Component
export default class SubjectStylesMixin extends Vue {
  @Prop({ type: Object }) readonly value!: any

  private id: string = UUID.uuid()

  private dataSource: Feature.FeatureGeoJSON | null = null

  get field() {
    return this.value.field
  }

  /**
   * 获取指定属性的GeoJSON数据
   * @param {object} params 查询参数
   */
  async getFieldGeoJson({
    ip,
    port,
    docName,
    layerName,
    layerIndex,
    gdbp,
    fields
  }) {
    if (!fields) return
    const geojson: Feature.FeatureGeoJSON | null = await resolveFeatureQuery(
      {
        ip,
        port,
        gdbp,
        docName,
        layerName,
        layerIndex,
        fields
      },
      FeatureFormatType.geojson
    )
    return geojson
  }

  @Watch('field')
  fieldChanged(nV: string) {
    this.getFieldGeoJson({
      fields: nV,
      ...this.value
    }).then(geojson => (this.dataSource = geojson))
  }

  mounted() {
    dep.addSub(this)
  }

  beforeDestroy() {
    dep.removeSub(this)
  }
}
