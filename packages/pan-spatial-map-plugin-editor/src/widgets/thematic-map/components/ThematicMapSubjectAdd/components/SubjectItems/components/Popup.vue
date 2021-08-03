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
export default class Popup extends Vue {
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
 *   popup: {
              showFields: [], // 悬浮框的显示字段
              showFieldsTitle: {}, // 悬浮框的内容主体的别名字段  key value 形式
              title: 'fid' // 悬浮框的头部字段
            }
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
