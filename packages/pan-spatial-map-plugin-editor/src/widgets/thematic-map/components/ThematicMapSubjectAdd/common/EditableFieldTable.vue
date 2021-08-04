<template>
  <div class="editable-field-table">
    <a-empty :image-style="emptyImageStyle" v-if="!visible">
      <span slot="description" @click="showTable" class="description">
        点击开始配置
      </span>
    </a-empty>
    <mp-editable-table
      v-else
      @change="onTableChange"
      :before-add="beforeAdd"
      :columns="tableColumns"
      :data="tableData"
      :tools="tools"
      :title="title"
    >
      <template #top>
        <slot name="top" />
      </template>
    </mp-editable-table>
  </div>
</template>
<script lang="ts">
import { Vue, Component, Prop } from 'vue-property-decorator'
import { NewSubjectConfig } from '../../../store'
import FieldInstance from '../store/fields'

interface ITableDataItem {
  id: string
  field: string
  alias: string
}

export interface IColumn extends ColumnProps {
  type?: 'Select' | 'Input' | 'InputNumber' | 'ColorPicker' | string
  props?: Record<string, any>
}

export interface IFieldConfig {
  showFields: string[]
  showFieldsTitle: Record<string, string>
}

@Component
export default class EditableFieldTable extends Vue {
  @Prop({ default: '配置列表' }) readonly title!: string

  @Prop({ type: Array, default: () => [] }) readonly columns!: Array<IColumn>

  @Prop({ type: Object }) readonly data!: IFieldConfig

  @Prop({ type: Object, default: () => ({}) })
  readonly subjectConfig!: NewSubjectConfig

  visible = false

  fieldList = []

  get viewTool() {
    return {
      title: '预览',
      icon: 'eye',
      method: this.onView
    }
  }

  get closeTool() {
    return {
      title: '取消配置',
      icon: 'close',
      method: this.onClose
    }
  }

  get tools() {
    return (add, batchDel) => {
      return [add, this.viewTool, batchDel, this.closeTool]
    }
  }

  get emptyImageStyle() {
    return {
      height: '50px'
    }
  }

  get tableColumns() {
    return [
      ...this.columns.map(v => ({
        ...v,
        options: v.dataIndex === 'field' ? this.fieldList : undefined,
        scopedSlots: {
          customRender: v.dataIndex
        }
      }))
    ]
  }

  get tableData() {
    return this.data
      ? this.data.showFields.map(v => ({
          field: v,
          alias: this.data.showFieldsTitle[v]
        }))
      : []
  }

  set tableData(nV) {
    const fieldConfig = this.setFieldConfig(nV)
    console.log('2', fieldConfig)
    this.$emit('change', fieldConfig)
    this.$emit('update:data', fieldConfig)
  }

  /**
   * 设置属性和别名配置
   */
  setFieldConfig(data?: ITableDataItem[]) {
    return data && data.length
      ? data.reduce<IFieldConfig>(
          (obj, { field, alias }: ITableDataItem) => {
            const { showFields, showFieldsTitle } = obj
            if (!showFields.includes(field)) {
              showFields.push(field)
            }
            showFieldsTitle[field] = alias
            return obj
          },
          {
            showFields: [],
            showFieldsTitle: {}
          }
        )
      : undefined
  }

  /**
   * 隐藏配置面板
   */
  hideTable() {
    if (this.visible) {
      this.visible = false
    }
  }

  /**
   * 显示配置面板
   */
  showTable() {
    const { ip, port } = this.subjectConfig
    if (!ip || !port) {
      this.$message.warning('未配置服务地址')
      return
    }
    this.visible = true
  }

  /**
   * 添加配置项之前操作
   */
  beforeAdd(addFn: () => void) {
    FieldInstance.getFields(this.subjectConfig).then(list => {
      this.fieldList = list
      this.$emit('fields-loaded', list)
      addFn()
    })
  }

  /**
   * 列表数据变化
   */
  onTableChange(data?: ITableDataItem[]) {
    this.tableData = data
  }

  /**
   * 预览
   */
  onView() {
    this.$emit('view')
  }

  /**
   * 取消
   */
  onClose() {
    this.onTableChange(undefined)
    this.hideTable()
  }
}
</script>
<style lang="less" scoped>
.editable-field-table {
  padding: 4px 8px 8px;
  .description {
    color: @primary-color;
    cursor: pointer;
    font-size: @font-size-sm;
    &:hover {
      text-decoration: underline;
    }
  }
}
</style>
