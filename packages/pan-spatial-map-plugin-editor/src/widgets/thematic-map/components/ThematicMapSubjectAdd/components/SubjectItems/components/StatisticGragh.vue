<template>
  <editable-field-table
    @view="onView"
    @change="onChange"
    @fields-loaded="onFieldsLoaded"
    :subject-config="subjectConfig"
    :columns="tableColumns"
    :data="tableData"
    title="图表配置"
  >
    <mp-row-flex slot="top" :span="[11, 11]" justify="space-between">
      <mp-row-flex slot="label" label="分组字段" :label-width="72">
        <a-select v-model="field" :options="fieldList" placeholder="请选择" />
      </mp-row-flex>
      <mp-row-flex label="统计方式" :label-width="72">
        <a-select
          v-model="field"
          :options="statisticWays"
          placeholder="请选择"
        />
      </mp-row-flex>
    </mp-row-flex>
  </editable-field-table>
</template>
<script lang="ts">
import { Vue, Component, Prop, Watch } from 'vue-property-decorator'
import { NewSubjectConfig } from '../../../../../store'
import EditableFieldTable from '../../../common/EditableFieldTable.vue'

interface ITableDataItem {
  index: number
  field: string
  alias: string
  color: string
}

interface IGragh{
  fieldColors: string[]
  showFields: string[]
  showFieldsTitle: Record<string, string>
}

@Component({
  components: {
    EditableFieldTable
  }
})
export default class StatisticGragh extends Vue {
  @Prop({ default: () => ({}) }) readonly subjectConfig!: NewSubjectConfig

  @Watch('subjectConfig.graph', { deep: true })
  tableDataChange({ fieldColors, showFields = [], showFieldsTitle } = {}) {
    if (showFields.length === this.tableData.length) {
      this.tableData = showFields.map((f, i) => ({
        index: i,
        field: f,
        color: fieldColors[i],
        alias: showFieldsTitle[f]
      }))
    }
  }

  field = null

  fieldList = []

  tableData: ITableDataItem[] = []

  get tableColumns() {
    return [
      {
        type: 'Select',
        title: '统计字段',
        dataIndex: 'field',
        width: 130
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

  get statisticWays() {
    return [
      {
        label: '求和',
        value: 'sum'
      },
      {
        label: '求平均值',
        value: 'average'
      },
      {
        label: '最大值',
        value: 'max'
      },
      {
        label: '最小值',
        value: 'min'
      },
      {
        label: '计数',
        value: 'count'
      },
      {
        label: '去重',
        value: 'removeDuplicates'
      },
    ]
  }

  /**
   * 属性配置变化
   * graph: {
               // 右侧的显示字段（y轴字段）
              showFields: ['WRLD30_ID', 'mpLayer', 'POP_1994', 'SQMI'],
               // 右侧统计图的显示字段别名,key,value形式
              showFieldsTitle: {},
               // 右侧统计图的x轴字段
              field: 'COUNTRY',
            },
   */
  onChange(data: ITableDataItem[] = []) {
    const gragh: ?IGragh =
      data.length && data.some(({ field }) => !!field)
        ? data.reduce(
            (
              { fieldColors, showFields, showFieldsTitle },
              { field, alias, color }
            ) => {
              if (field) {
                if (!showFields.includes(field)) {
                  showFields.push(field)
                  fieldColors.push(color)
                }
                showFieldsTitle[field] = alias
              }
              return { showFields, showFieldsTitle }
            },
            {
              fieldColors: [],
              showFields: [],
              showFieldsTitle: {}
            }
          )
        : undefined
    this.tableData = data
    this.$emit('change', { gragh })
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
