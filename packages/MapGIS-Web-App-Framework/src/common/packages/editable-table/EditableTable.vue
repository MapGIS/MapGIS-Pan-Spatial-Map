<template>
  <mp-card
    :size="size"
    :title="title"
    :tools="tableTools"
    :loading="loading"
    class="mp-editable-table"
  >
    <a-table
      bordered
      :row-selection="tableRowSelection"
      :columns="tableColumns"
      :data-source="tableData"
      :loading="loading"
      :pagination="false"
      :row-key="rowKey"
      class="editable-table-table"
    >
      <template
        v-for="column in tableColumns"
        :slot="column.scopedSlots.customRender"
        slot-scope="text, record, index"
      >
        <mp-editable-table-cell
          v-if="column.dataIndex"
          @change="cellChange($event, column, record)"
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
    rowKey: {
      type: String,
      default: 'index'
    }
  },
  data: vm => ({
    index: 0,
    selectedRowKeys: [],
    tableData: []
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
    }
  },
  watch: {
    data(nV) {
      if (JSON.stringify(this.tableData) !== JSON.stringify(nV)) {
        this.tableData = nV
      }
    },
    tableData(nV) {
      this.$emit('change', nV)
      this.$emit('update:data', nV)
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
     * 优化: 此处$set某行数据并未触发视图的更新, 因为tableData有可能为非响应式数据,
     * 因此需要手动对tableData赋值
     */
    cellChange(value, column, record) {
      this.$set(record, column.dataIndex, value)
      this.tableData = [...this.tableData]
    },
    /**
     * 移除行
     */
    deleteRow(index) {
      this.tableData.splice(index, 1)
      this.index -= 1
    },
    /**
     * 添加
     */
    add() {
      this.tableData.push(
        this.columns.reduce((obj, { dataIndex }) => {
          if (dataIndex) {
            this.$set(obj, dataIndex, undefined)
            this.$set(obj, 'index', this.index)
          }
          return obj
        }, {})
      )
      this.index += 1
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
        this.deleteRow(this.tableData.findIndex(({ index }) => index === v))
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

    .ant-empty,
    .ant-empty-image {
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
