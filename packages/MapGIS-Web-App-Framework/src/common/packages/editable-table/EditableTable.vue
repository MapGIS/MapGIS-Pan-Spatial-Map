<template>
  <mp-card
    :size="size"
    :title="title"
    :tools="tableTools"
    :loading="loading"
    class="mp-editable-table"
  >
    <slot name="top" />
    <a-table
      bordered
      :row-selection="tableRowSelection"
      :columns="tableColumns"
      :data-source="tableData"
      :loading="loading"
      :pagination="false"
      row-key="id"
      class="editable-table-table"
    >
      <template
        v-for="column in tableColumns"
        :slot="column.scopedSlots.customRender"
        slot-scope="text, record, index"
      >
        <mp-editable-table-cell
          v-if="column.dataIndex"
          @change="cellChange"
          :column="column"
          :record="record"
          :key="column.dataIndex"
        />
        <span v-else :key="column.dataIndex">
          <slot
            :name="column.scopedSlots.customRender"
            v-bind="{ column, record, index }"
          />
          <a-icon type="delete" @click="deleteRow(index)" />
        </span>
      </template>
    </a-table>
  </mp-card>
</template>
<script>
import { UUID } from '@mapgis/web-app-framework'
import MpEditableTableCell from './EditableTableCell.js'

export default {
  name: 'MpEditableTable',
  components: {
    MpEditableTableCell
  },
  props: {
    title: {
      type: String,
      default: '列表'
    },
    size: {
      type: String,
      default: 'small',
      validator(v) {
        return ['large', 'default', 'small'].includes(v)
      }
    },
    tools: {
      type: [Array, Function],
      default: () => []
    },
    loading: {
      type: Boolean,
      default: false
    },
    checkable: {
      type: Boolean,
      default: true
    },
    disabled: {
      type: Boolean,
      default: false
    },
    columns: {
      type: Array,
      default: () => []
    },
    data: {
      type: Array,
      default: () => []
    },
    beforeAdd: {
      type: Function,
      default() {}
    }
  },
  data: vm => ({
    selectedRowKeys: []
  }),
  computed: {
    // 新增按钮
    addTool() {
      return {
        title: '新增',
        icon: 'plus',
        method: this.add
      }
    },
    // 批量删除按钮
    batchDelTool() {
      return {
        title: '批量删除',
        icon: 'delete',
        method: this.batchDelete
      }
    },
    // 列表的操作按钮
    tableTools({ tools, addTool, batchDelTool, checkable }) {
      let _tools = tools
      if (typeof _tools === 'function') {
        _tools = _tools(addTool, batchDelTool)
      } else if (!_tools.length) {
        _tools.push(addTool)
        if (checkable) {
          _tools.push(batchDelTool)
        }
      }

      return _tools
    },
    // 列表多选框
    tableRowSelection() {
      return this.checkable
        ? {
            columnWidth: 32,
            selectedRowKeys: this.selectedRowKeys,
            onChange: this.selectChange
          }
        : false
    },
    // 操作栏
    tableAction() {
      return this.columns.findIndex(
        ({ scopedSlots: { customRender } }) => customRender === 'action'
      ) < 0
        ? {
            title: '操作',
            align: 'center',
            width: 50,
            scopedSlots: { customRender: 'action' }
          }
        : null
    },
    // 列表列配置
    tableColumns() {
      const _columns = [
        ...this.columns.map(v => ({
          ...v,
          scopedSlots: {
            customRender: v.dataIndex
          }
        }))
      ]
      if (this.tableAction) {
        _columns.push(this.tableAction)
      }
      return _columns
    },
    // 列表数据
    tableData: {
      get() {
        return this.data
      },
      set(nV) {
        this.$emit('change', nV)
        this.$emit('update:data', nV)
      }
    }
  },
  methods: {
    /**
     * 配置列表选择变化
     */
    selectChange(selectedRowKeys) {
      this.selectedRowKeys = selectedRowKeys
    },
    /**
     * 表格单元组件变化
     */
    cellChange(value, column, record) {
      this.$nextTick(() => {
        this.$set(record, column.dataIndex, value)
      })
    },
    /**
     * 移除行
     */
    deleteRow(index) {
      this.tableData.splice(index, 1)
    },
    /**
     * 添加行
     */
    addRow() {
      this.tableData.push(
        this.columns.reduce(
          (obj, { dataIndex }) => {
            if (dataIndex) {
              obj[dataIndex] = null
            }
            return obj
          },
          {
            id: UUID.uuid()
          }
        )
      )
      this.$emit('added', this.tableData)
    },
    /**
     * 添加
     */
    add() {
      if (typeof this.beforeAdd === 'function') {
        this.beforeAdd(this.addRow)
      } else {
        this.addRow()
      }
    },
    /**
     * 批量删除
     */
    batchDelete() {
      if (!this.selectedRowKeys.length) {
        this.$message.warning('请勾选需要删除的数据项')
        return
      }
      this.selectedRowKeys.forEach(v => {
        this.deleteRow(this.tableData.findIndex(t => t.id === v))
      })
      this.selectedRowKeys = []
    }
  }
}
</script>
<style lang="less" scoped>
.mp-editable-table {
  ::v-deep .ant-table {
    th {
      padding: 4px 8px !important;
    }
    td {
      padding: 0 !important;
    }
    .ant-empty {
      margin: 0;
    }
    .anticon {
      cursor: pointer;
      &:hover {
        color: @primary-color;
      }
    }
    .ant-input,
    .ant-select-selection {
      border: none;
    }

    .ant-input:focus,
    .ant-select-focused .ant-select-selection {
      box-shadow: none;
    }
  }
}
</style>
