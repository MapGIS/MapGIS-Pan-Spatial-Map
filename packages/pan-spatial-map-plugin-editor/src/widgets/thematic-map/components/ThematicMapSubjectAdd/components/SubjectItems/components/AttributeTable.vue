<template>
  <editable-field-table
    @change="onChange"
    :columns="tableColumns"
    :data="tableData"
    :subject-config="subjectConfig"
  />
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

interface ITable {
  showFields: string[]
  showFieldsTitle: Record<string, string>
}

@Component({
  components: {
    EditableFieldTable
  }
})
export default class AttributeTable extends Vue {
  @Prop({ default: () => ({}) }) readonly subjectConfig!: INewSubjectConfig

  @Watch('subjectConfig.table', { deep: true })
  tableDataChange({ showFields = [], showFieldsTitle } = {}) {
    if (showFields.length === this.tableData.length) {
      this.tableData = showFields.map((f, i) => ({
        index: i,
        field: f,
        alias: showFieldsTitle[f]
      }))
    }
  }

  tableData = []

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
    const table =
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
    this.$emit('change', { table })
  }
}
</script>
