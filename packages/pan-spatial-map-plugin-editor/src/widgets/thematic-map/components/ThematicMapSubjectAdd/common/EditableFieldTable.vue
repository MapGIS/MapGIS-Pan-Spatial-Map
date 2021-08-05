<template>
  <div class="editable-field-table">
    <a-empty :image-style="emptyImageStyle" v-if="!visible">
      <span slot="description" @click="showTable" class="description">
        点击开始配置
      </span>
    </a-empty>
    <template v-else>
      <slot name="top" />
      <mp-editable-table
        :columns="tableColumns"
        :data.sync="tableData"
        :tools="tools"
        :title="title"
      />
    </template>
  </div>
</template>
<script lang="ts">
import { Vue, Component, Prop, Watch } from 'vue-property-decorator'
import { NewSubjectConfig } from '../../../store'
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
      ...this.columns.map(v => {
        const options = v.dataIndex === 'field' ? this.fieldList : undefined
        return {
          ...v,
          options,
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
   * 预览
   */
  onView() {
    this.$emit('view')
  }

  /**
   * 取消
   */
  onClose() {
    this.tableData = undefined
    this.hideTable()
  }

  created() {
    FieldInstance.getFields(this.subjectConfig).then(list => {
      this.fieldList = list
      this.$emit('fields-loaded', list)
    })
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
