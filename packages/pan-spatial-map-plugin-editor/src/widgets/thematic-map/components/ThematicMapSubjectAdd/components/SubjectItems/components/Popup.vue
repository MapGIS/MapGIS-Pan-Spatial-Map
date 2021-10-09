<template>
  <editable-field-table
    @change="onChange"
    :data="tableData"
    :columns="tableColumns"
    :subject-config="subjectConfig"
  >
    <mp-row-flex slot="top" label="标题" :label-width="50">
      <a-input v-model="title" placeholder="请填写" size="small" />
    </mp-row-flex>
  </editable-field-table>
</template>
<script lang="ts">
import { Vue, Component, Prop, Watch } from 'vue-property-decorator'
import { INewSubjectConfig } from '../../../../../store'
import EditableFieldTable from '../../../common/EditableFieldTable.vue'

interface ITableDataItem {
  index: number
  field: string
  alias: string
}

interface IPopup{
  showFields: string[]
  showFieldsTitle: Record<string, string>
}

@Component({
  components: {
    EditableFieldTable
  }
})
export default class Popup extends Vue {
  @Prop({ default: () => ({}) }) readonly subjectConfig!: INewSubjectConfig

  @Watch('subjectConfig.popup', { deep: true })
  tableDataChange({ showFields = [], showFieldsTitle } = {}) {
    if (showFields.length === this.tableData.length) {
      this.tableData = showFields.map((f, i) => ({
        index: i,
        field: f,
        alias: showFieldsTitle[f]
      }))
    }
  }

  title = ''

  tableData: ITableDataItem[] = []

  get tableColumns() {
    return [
      {
        type: 'Select',
        title: '属性字段',
        dataIndex: 'field',
        width: 160
      },
      {
        type: 'Input',
        title: '属性别名',
        dataIndex: 'alias'
      }
    ]
  }

  /**
   * 属性配置变化
   */
  onChange(data: ITableDataItem[] = []) {
    const popup: ?IPopup =
      data.length && data.some(({ field }) => !!field)
        ? data.reduce(
            ({ showFields, showFieldsTitle }, { field, alias }) => {
              if (field) {
                if (!showFields.includes(field)) {
                  showFields.push(field)
                }
                showFieldsTitle[field] = alias
              }
              return { showFields, showFieldsTitle }
            },
            {
              showFields: [],
              showFieldsTitle: {}
            }
          )
        : undefined
    this.tableData = data
    this.$emit('change', { popup })
  }
}
</script>
<style lang="less" scoped>
::v-deep .mp-row-flex {
  padding-bottom: 8px;
}
</style>
