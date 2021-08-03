<template>
  <editable-field-table
    @view="onView"
    @fields-loaded="onFieldsLoaded"
    :field-config="subjectConfig"
    :columns="tableColumns"
    :data.sync="tableData"
    title="图表配置"
  >
    <mp-row-flex slot="top" label="分组字段" :label-width="72">
      <a-select v-model="field" :options="fieldList" placeholder="请选择" />
    </mp-row-flex>
  </editable-field-table>
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
export default class StatisticGragh extends Vue {
  @Prop({ default: () => ({}) }) readonly subjectConfig!: NewSubjectConfig

  field = null

  fieldList = []

  get tableColumns() {
    return [
      {
        type: 'Select',
        title: '统计字段',
        dataIndex: 'field',
        width: 160
      },
      {
        type: 'Input',
        title: '别名',
        dataIndex: 'alias'
      },
      {
        type: 'ColorPicker',
        title: '颜色设置',
        dataIndex: 'color',
        align: 'center'
      }
    ]
  }

  get tableData() {
    return []
  }

  /**
 *   graph: {
               // 右侧的显示字段（y轴字段）
              showFields: ['WRLD30_ID', 'mpLayer', 'POP_1994', 'SQMI'],
               // 右侧统计图的显示字段别名,key,value形式
              showFieldsTitle: {},
               // 右侧统计图的x轴字段
              field: 'COUNTRY',
            },
 */
  set tableData(nV) {
    // todo
    console.log('tableData', nV)
  }

  /**
   * 属性列表加载完成
   */
  onFieldsLoaded(list) {
    this.fieldList = list
  }

  /**
   * 预览
   */
  onView() {}
}
</script>
<style lang="less" scoped>
::v-deep .ant-row-flex {
  margin-bottom: 8px;
}
</style>
