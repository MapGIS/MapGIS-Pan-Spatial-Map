import { Feature } from '@mapgis/web-app-framework'

interface IFieldGeoJsonParams {
  ip: string
  port: string
  docName: string
  layerName: string
  layerIndex: string
  gdbp: string
  field: string
}
class Dep {
  constructor(private subs: Vue[] = []) {
    this.subs = subs
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
    field
  }: IFieldGeoJsonParams) {
    if (!field) return
    const dataSet: Feature.FeatureIGS = await Feature.FeatureQuery.query({
      ip,
      port,
      fields: field,
      IncludeGeometry: true,
      f: 'json',
      ...(docName
        ? {
            docName,
            layerName,
            layerIdxs: layerIndex
          }
        : {
            gdbp
          })
    })
    if (!dataSet) return
    return Feature.FeatureConvert.featureIGSToFeatureGeoJSON(dataSet)
  }

  getSub() {
    return [...this.subs]
  }

  addSub(sub: Vue) {
    this.subs.push(sub)
  }

  removeSub(sub: Vue) {
    this.subs.splice(this.subs.indexOf(sub), 1)
  }
}

const dep = new Dep()

export default dep
