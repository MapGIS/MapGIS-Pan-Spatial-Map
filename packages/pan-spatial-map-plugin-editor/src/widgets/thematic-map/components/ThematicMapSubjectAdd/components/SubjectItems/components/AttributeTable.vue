<template>
  <editable-table
    @on-add="onAdd"
    @on-view="onView"
    @on-close="onClose"
    :columns="tableColumns"
    :data="tableData"
    :beforeShow="beforeShow"
    title="配置列表"
  />
</template>
<script lang="ts">
import { Vue, Component, Prop } from 'vue-property-decorator'
import { UUID } from '@mapgis/web-app-framework'
import { NewSubjectConfig } from '../../../../../store'
import EditableTable from '../../../common/EditableTable.vue'
import FieldInstance from '../store/fields'

@Component({
  components: {
    EditableTable
  }
})
export default class AttributeTable extends Vue {
  @Prop({ default: () => ({}) }) readonly subjectConfig!: NewSubjectConfig

  fieldList = []

  tableData = []

  get tableColumns() {
    return [
      {
        title: '字段',
        dataIndex: 'field',
        type: 'Select',
        options: this.fieldList
      },
      {
        title: '别名',
        dataIndex: 'alias',
        type: 'Input'
      }
    ]
  }

  /**
   * 显示配置面板
   */
  beforeShow(next) {
    if (!this.subjectConfig.ip || !this.subjectConfig.port) {
      this.$message.warning('未配置服务地址')
      return
    }
    next && next()
  }

  onAdd() {
    FieldInstance.getFields(this.subjectConfig).then(list => {
      this.fieldList = list
      this.tableData.push({
        id: UUID.uuid(),
        field: '',
        alias: ''
      })
    })
  }

  onView() {}

  onClose() {}
}
</script>
