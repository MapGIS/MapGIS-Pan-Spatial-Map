<template>
  <editable-field-table
    @view="onView"
    :field-config="subjectConfig"
    :columns="tableColumns"
    :data.sync="tableData"
  />
</template>
<script lang="ts">
import { Vue, Component, Prop } from 'vue-property-decorator'
import { NewSubjectConfig } from '../../../../../store'
import EditableFieldTable from '../../../common/EditableFieldTable.vue'

@Component({
  components: {
    EditableFieldTable
  }
})
export default class AttributeTable extends Vue {
  @Prop({ default: () => ({}) }) readonly subjectConfig!: NewSubjectConfig

  get tableColumns() {
    return [
      {
        type: 'Select',
        title: '字段',
        dataIndex: 'field',
        width: 160
      },
      {
        type: 'Input',
        title: '别名',
        dataIndex: 'alias'
      }
    ]
  }

  get tableData() {
    return []
  }

  /**
 * table: {
              showFields: [ // 表格显示字段 （数组形式）
                '权属代码',
                '权属名称',
                'GDP万元'
              ],
              showFieldsTitle: {} // 表格的显示字段别名,key,value形式
            },
 */
  set tableData(nV) {
    // todo
    console.log('tableData', nV)
  }

  /**
   * 预览
   */
  onView() {}
}
</script>
