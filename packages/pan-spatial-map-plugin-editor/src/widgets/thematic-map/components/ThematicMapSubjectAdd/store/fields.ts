import { Feature } from '@mapgis/web-app-framework'
import { baseConfigInstance } from '@mapgis/pan-spatial-map-common'

interface QueryParams {
  ip: string
  port: string
  gdbp?: string
  docName?: string
  layerIndex?: string
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
      const { ip, port, gdbp, docName, layerIndex } = subjectConfig
      this.fields = await this.fetchFields({
        ip,
        port,
        gdbp,
        docName,
        layerIndex
      })
      this.isFetched = true
    }
    return this.fields
  }

  async fetchFields({ ip, port, gdbp, docName, layerIndex }: QueryParams) {
    const { ip: baseIp, port: basePort } = baseConfigInstance.config
    const _ip = ip || baseIp
    const _port = port || basePort
    const result = await Feature.FeatureQuery.query({
      ip: _ip,
      port: _port,
      gdbp,
      docName,
      layerIdxs: layerIndex,
      IncludeAttribute: false,
      IncludeGeometry: false,
      IncludeWebGraphic: false,
      f: 'json'
    })
    let fields = []
    if (result) {
      const { FldName, FldType, FldAlias } = result.AttStruct
      fields = FldName.map((v: string, i: number) => ({
        type: FldType[i],
        label: FldAlias[i] || v,
        value: v
      }))
    }
    return fields
  }
}

export default new Fields()
