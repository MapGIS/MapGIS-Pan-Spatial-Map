<template>
  <div class="popup">
    <mp-row-flex label="弹框标题" :label-width="72">
      <a-input v-model="title" placeholder="请选择" />
    </mp-row-flex>
    <editable-field-table
      @view="onView"
      @change="onChange"
      :data="tableData"
      :columns="tableColumns"
      :subject-config="subjectConfig"
    />
  </div>
</template>
<script lang="ts">
import { Vue, Component, Prop, Watch } from 'vue-property-decorator'
import { NewSubjectConfig } from '../../../../../store'
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
  @Prop({ default: () => ({}) }) readonly subjectConfig!: NewSubjectConfig

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

  /**
   * 预览
   */
  onView() {}
}
</script>
