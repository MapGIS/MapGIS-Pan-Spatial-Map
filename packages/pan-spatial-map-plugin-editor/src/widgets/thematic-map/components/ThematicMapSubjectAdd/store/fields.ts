import { resolveQuery } from '../../../store'

interface QueryParams {
  ip: string
  port: string
  gdbp: string
  docName: string
  layerName: string
  layerIndex: string
}

interface FieldInfosItem {
  type: string
  label: string
  value: string
}

class Fields {
  private isFetched = false

  private fields: FieldInfosItem[] = []

  clearFields() {
    this.isFetched = false
    this.fields = []
  }

  async getFields(subjectConfig) {
    if (!this.isFetched) {
      this.fields = await this.fetchFields(subjectConfig)
      this.isFetched = true
    }
    return this.fields
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
    const result = await resolveQuery({
      ip,
      port,
      gdbp,
      docName,
      layerName,
      layerIndex,
      IncludeAttribute: false,
      IncludeGeometry: false,
      IncludeWebGraphic: false
    })
    if (result) {
      const { FldName, FldType, FldAlias } = result.AttStruct
      return FldName.map((v: string, i: number) => ({
        type: FldType[i],
        alias: FldAlias[i] || v,
        value: v
      }))
    }
    return []
  }
}

export default new Fields()
