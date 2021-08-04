<template>
  <div class="popup">
    <mp-row-flex label="弹框标题" :label-width="72">
      <a-input v-model="title" placeholder="请选择" />
    </mp-row-flex>
    <editable-field-table
      @view="onView"
      :subject-config="subjectConfig"
      :data.sync="fieldConfig"
      :columns="columns"
    />
  </div>
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
export default class Popup extends Vue {
  @Prop({ default: () => ({}) }) readonly subjectConfig!: NewSubjectConfig

  title = ''

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
    return this.subjectConfig.popup
  }

  set fieldConfig(popup: IFieldConfig) {
    // this.$emit('change', { popup })
  }

  /**
   * 预览
   */
  onView() {}
}
</script>
