<template>
  <editable-field-table
    @view="onView"
    :subject-config="subjectConfig"
    :data.sync="fieldConfig"
    :columns="columns"
  />
</template>
<script lang="ts">
import { Vue, Component, Prop } from 'vue-property-decorator'
import { NewSubjectConfig } from '../../../../../store'
import EditableFieldTable, {
  IFieldConfig
} from '../../../common/EditableFieldTable.vue'

@Component({
  components: {
    EditableFieldTable
  }
})
export default class AttributeTable extends Vue {
  @Prop({ default: () => ({}) }) readonly subjectConfig!: NewSubjectConfig

  get columns() {
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

  get fieldConfig() {
    return this.subjectConfig.table
  }

  set fieldConfig(table: IFieldConfig) {
    console.log('3', table)
    this.$emit('change', { table })
  }

  /**
   * 预览
   */
  onView() {}
}
</script>
