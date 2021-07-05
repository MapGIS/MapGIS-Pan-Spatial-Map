import { Component, Vue, Prop } from 'vue-property-decorator'

@Component
export default class MetadataInfo extends Vue {
  @Prop(Object) readonly metadata!: Record<string, any>

  getTableColumns(info: Record<string, unknown>) {
    const tags = Object.keys(info)
    const columns: Record<string, unknown>[] = []
    for (let i = 0; i < tags.length; i += 1) {
      const obj = {
        align: 'left',
        title: tags[i],
        dataIndex: tags[i],
        key: tags[i],
        width: 180
      }
      columns.push(obj)
    }
    return columns
  }

  getDataSource(arr: Array<Record<string, unknown>>) {
    const dataSource = arr.map((info: Record<string, unknown>) => {
      const tags = Object.keys(info)
      const columns: Record<string, unknown>[] = []
      const obj = {}
      for (let i = 0; i < tags.length; i += 1) {
        if (
          info[tags[i]] !== null &&
          info[tags[i]] !== undefined &&
          Object.prototype.toString.call(info[tags[i]]) !== '[object String]'
        ) {
          obj[tags[i]] = JSON.stringify(info[tags[i]])
        } else if (info[tags[i]] !== null && info[tags[i]] !== undefined) {
          obj[tags[i]] = info[tags[i]]
        } else {
          obj[tags[i]] = ''
        }
      }
      return obj
    })
    return dataSource
  }
}
