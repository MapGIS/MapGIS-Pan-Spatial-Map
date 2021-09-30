import { FeatureFormatType, resolveFeatureQuery } from '../../../store'

interface QueryParams {
  ip: string
  port: string
  gdbp: string
  docName: string
  layerName: string
  layerIndex: string
  fields?: string
}

interface FieldInfosItem {
  type: string
  alias: string
  value: string
}

class Fields {
  private isFetched = false

  private fields: FieldInfosItem[] = []

  /**
   * 获取指定属性的GeoJSON数据
   * @param {object} params 查询参数
   * @returns GeoJSON | undefined
   */
  async getFieldGeoJson({
    ip,
    port,
    gdbp,
    docName,
    layerName,
    layerIndex,
    fields
  }: QueryParams) {
    if (!fields) return
    const geojson = await resolveFeatureQuery({
      ip,
      port,
      gdbp,
      docName,
      layerName,
      layerIndex,
      fields
    })
    return geojson
  }

  /**
   * 请求属性列表数据
   * @param {object} param0 查询参数
   * @returns
   */
  async fetchFields({
    ip,
    port,
    gdbp,
    docName,
    layerName,
    layerIndex
  }: QueryParams) {
    if (this.isFetched) {
      return this.fields
    }
    const igsJson = await resolveFeatureQuery(
      {
        ip,
        port,
        gdbp,
        docName,
        layerName,
        layerIndex,
        IncludeAttribute: false,
        IncludeGeometry: false,
        IncludeWebGraphic: false
      },
      FeatureFormatType.json
    )
    let fields = []
    if (igsJson) {
      const { FldName, FldType, FldAlias } = igsJson.AttStruct
      fields = FldName.map((v: string, i: number) => ({
        type: FldType[i],
        alias: FldAlias[i] || v,
        value: v
      }))
    }
    this.fields = fields
    this.isFetched = true

    return fields
  }

  /**
   * 清除缓存
   */
  clearFields() {
    this.isFetched = false
    this.fields = []
  }
}

export default new Fields()
