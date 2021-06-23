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
}
