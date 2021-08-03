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
import FieldInstance from '../store/fields'

@Component
export default class EditableFieldTable extends Vue {
  @Prop({ default: '配置列表' }) readonly title!: string

  @Prop({ type: Object, default: () => ({}) }) readonly fieldConfig!: object

  @Prop({ type: Array, default: () => [] }) readonly columns!: Array<any>

  @Prop({ type: Array, default: () => [] }) readonly data!: Array<any>

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
  }

  set tableData(nV) {
    this.$emit('change', nV)
    this.$emit('update:data', nV)
  }

  /**
   * 隐藏配置面板
   */
  hideTable() {
    if (!this.visible) {
      this.visible = false
    }
  }

  /**
   * 显示配置面板
   */
  showTable() {
    if (!this.fieldConfig.ip || !this.fieldConfig.port) {
      this.$message.warning('未配置服务地址')
      return
    }
    this.visible = true
  }

  /**
   * 添加之前操作
   */
  beforeAdd(addFn: () => void) {
    FieldInstance.getFields(this.fieldConfig).then(list => {
      this.fieldList = list
      this.$emit('fields-loaded', list)
      addFn()
    })
  }

  /**
   * 列表数据变化
   */
  onTableChange(data) {
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
