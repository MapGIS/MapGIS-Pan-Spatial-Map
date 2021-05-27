import { Vue, Component, Prop, Watch } from 'vue-property-decorator'

@Component({})
export default class SelectTreeMixin extends Vue {
  @Prop(String) readonly ip!: string

  @Prop(String) readonly port!: string

  // 选择树当前选中的条目
  private value: any = ''

  // 选择树数据
  private treeData: Record<string, any>[] = []

  // 替换treeNode中的title、key字段为treeData中对应的字段
  private replaceFields: object = {
    title: 'name',
    key: 'id'
  }
}
