<template>
  <div class="editable-field-table">
    <a-empty v-if="!visible" :image-style="emptyImageStyle">
      <span slot="description" @click="showTable" class="description">
        点击开始配置
      </span>
    </a-empty>
    <mp-editable-table
      v-else
      :columns="tableColumns"
      :data.sync="tableData"
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
import { Vue, Component, Prop, Watch } from 'vue-property-decorator'
import { INewSubjectConfig } from '../../../store'
import FieldInstance from '../store/fields'

interface IColumn extends ColumnProps {
  type?: 'Select' | 'Input' | 'InputNumber' | 'ColorPicker' | string
  options?: Array<any>
  props?: Record<string, any>
}

@Component
export default class EditableFieldTable extends Vue {
  @Prop({ default: '配置列表' }) readonly title!: string

  @Prop({ type: Array, default: () => [] }) readonly columns!: Array<IColumn>

  @Prop({ type: Array, default: () => [] }) readonly data!: Array<
    Record<string, any>
  >

  @Prop({ type: Object, default: () => ({}) })
  readonly subjectConfig!: INewSubjectConfig

  visible = false

  fieldList = []

  get closeTool() {
    return {
      title: '取消配置',
      icon: 'close',
      method: this.onClose
    }
  }

  get tools() {
    return (add, batchDel) => {
      const _tools = [add, this.closeTool]
      if (this.tableData.length) {
        _tools.splice(1, 0, batchDel)
      }
      return _tools
    }
  }

  get emptyImageStyle() {
    return {
      height: '50px'
    }
  }

  get tableColumns() {
    return [
      ...this.columns.map(v => {
        const options = v.dataIndex === 'field' ? this.fieldList : undefined
        return {
          ...v,
          props: {
            options
          },
          scopedSlots: {
            customRender: v.dataIndex
          }
        }
      })
    ]
  }

  get tableData() {
    return this.data
  }

  set tableData(data: Array<Record<string, any>>) {
    this.$emit('change', data)
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
   * 设置属性列表
   */
  setFields() {
    FieldInstance.getFields(this.subjectConfig).then(fields => {
      this.fieldList = fields.map(({ value }) => ({
        label: value,
        value
      }))
      this.$emit('fields-loaded', this.fieldList)
    })
  }

  /**
   * 取消
   */
  onClose() {
    this.tableData = undefined
    this.hideTable()
  }

  @Watch('subjectConfig.field', { immediate: true })
  fieldChanged(nV) {
    if (nV) {
      this.setFields()
    }
  }
}
</script>
<style lang="less" scoped>
.editable-field-table {
  padding: 8px;
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
