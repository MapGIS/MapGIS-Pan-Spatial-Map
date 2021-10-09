<template>
  <editable-field-table
    @change="onChange"
    @fields-loaded="onFieldsLoaded"
    :subject-config="subjectConfig"
    :columns="tableColumns"
    :data="tableData"
    title="图表配置"
  >
    <mp-row-flex slot="top" label="分组字段" :label-width="72">
      <a-select
        v-model="field"
        :options="fieldList"
        :auto-width="true"
        size="small"
        placeholder="请选择"
      />
    </mp-row-flex>
    <!-- <mp-row-flex slot="top" :span="[11, 11]" justify="space-between">
      <mp-row-flex slot="label" label="分组字段" :label-width="72">
        <a-select v-model="field" :options="fieldList" placeholder="请选择" />
      </mp-row-flex>
      <mp-row-flex label="统计方式" :label-width="72">
        <a-select
          v-model="way"
          :options="statisticWays"
          :disabled="true"
          placeholder="请选择"
        />
      </mp-row-flex>
    </mp-row-flex> -->
  </editable-field-table>
</template>
<script lang="ts">
import { Vue, Component, Prop, Watch } from 'vue-property-decorator'
import { INewSubjectConfig } from '../../../../../store'
import EditableFieldTable from '../../../common/EditableFieldTable.vue'

interface ITableDataItem {
  index: number
  field: string
  alias: string
  color: string
}

interface IGragh{
  field: string
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
  @Prop({ default: () => ({}) }) readonly subjectConfig!: INewSubjectConfig

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

  private field = null

  // private way = '3'

  private fieldList = []

  private tableData: ITableDataItem[] = []

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
        align: 'center',
        width: 100
      }
    ]
  }

  // get statisticWays() {
  //   return [
  //      {
  //     label: '求和',
  //     value: '3',
  //     type: 'sum'
  //   },
  //   {
  //     label: '求平均值',
  //     value: '4',
  //     type: 'avg'
  //   },
  //   {
  //     label: '最大值',
  //     value: '1',
  //     type: 'max'
  //   },
  //   {
  //     label: '最小值',
  //     value: '2',
  //     type: 'min'
  //   },
  //   {
  //     label: '计数',
  //     value: '6',
  //     type: 'count'
  //   },
  //   {
  //     label: '去重',
  //     value: '7',
  //     type: 'var'
  //   }
  //   ]
  // }

  /**
   * 属性配置变化
   */
  onChange(data: ITableDataItem[] = []) {
    const graph: ?IGragh =
      data.length && data.some(({ field }) => !!field)
        ? {
          field: this.field,
          ...data.reduce((obj,{ field, alias, color }) => {
              const  { fieldColors, showFields, showFieldsTitle } = obj
              if (field) {
                if (!showFields.includes(field)) {
                  showFields.push(field)
                  fieldColors.push(color)
                }
                showFieldsTitle[field] = alias
              }
              return obj
            },
            {
              fieldColors: [],
              showFields: [],
              showFieldsTitle: {}
            }
          )
        }
        : undefined
    this.tableData = data
    this.$emit('change', { graph })
  }

  /**
   * 属性列表加载完成
   */
  onFieldsLoaded(fields) {
    this.fieldList = fields
    this.field = this.fieldList[0]?.value
  }
}
</script>
<style lang="less" scoped>
::v-deep .mp-row-flex {
  padding-bottom: 8px;
}
</style>
