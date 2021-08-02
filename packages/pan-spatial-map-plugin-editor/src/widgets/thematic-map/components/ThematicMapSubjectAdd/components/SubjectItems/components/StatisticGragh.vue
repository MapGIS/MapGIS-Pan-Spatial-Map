<template>
  <editable-table
    @on-add="onAdd"
    @on-view="onView"
    @on-close="onClose"
    :columns="tableColumns"
    :data="tableData"
    :beforeShow="beforeShow"
    title="图表配置"
  >
    <mp-row-flex slot="top" label="分组字段" :label-width="72">
      <a-select v-model="field" :options="fieldList" placeholder="请选择" />
    </mp-row-flex>
  </editable-table>
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
export default class StatisticGragh extends Vue {
  @Prop({ default: () => ({}) }) readonly subjectConfig!: NewSubjectConfig

  field = null

  fieldList = []

  tableData = []

  get tableColumns() {
    return [
      {
        title: '统计字段',
        dataIndex: 'field',
        type: 'Select',
        options: this.fieldList
      },
      {
        title: '别名',
        dataIndex: 'alias',
        type: 'Input'
      },
      {
        title: '颜色设置',
        dataIndex: 'color',
        align: 'center',
        type: 'ColorPicker'
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

  /**
   * 添加配置
   */
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

  /**
   * 预览
   */
  onView() {}

  /**
   * 取消配置
   */
  onClose() {}
}
</script>
<style lang="less" scoped>
::v-deep .ant-row-flex {
  margin-bottom: 8px;
}
</style>
