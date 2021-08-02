<template>
  <div class="editable-table">
    <a-empty :image-style="{ height: '50px' }" v-if="!visible">
      <span
        slot="description"
        @click="showEditableTable"
        class="editable-table-description"
      >
        {{ description }}
      </span>
    </a-empty>
    <mp-card v-else size="small" :title="title" :tools="tools">
      <slot name="top" />
      <a-table
        row-key="id"
        bordered
        :row-selection="{
          columnWidth: 32,
          selectedRowKeys,
          onChange: selectChange
        }"
        :columns="tableColumns"
        :data-source="tableData"
        :scroll="{ y: 160 }"
        :pagination="false"
        class="editable-table-table"
      >
        <template
          v-for="column in tableColumns"
          :slot="column.scopedSlots.customRender"
          slot-scope="text, record, index"
        >
          <span
            v-if="column.scopedSlots.customRender === 'action'"
            :key="column.dataIndex"
          >
            <a-icon type="edit" @click="editRow(record, index)" />
            <a-icon type="delete" @click="removeRow(index)" />
          </span>
          <editable-table-cell
            v-else
            @change="tableCellChange($event, record, column)"
            :key="column.dataIndex"
            :column="column"
            :record="record"
            :disabled="currentRowIndex !== index"
          />
        </template>
      </a-table>
    </mp-card>
  </div>
</template>
<script>
import EditableTableCell from './EditableTableCell.js'

export default {
  name: 'EditableTable',
  components: {
    EditableTableCell
  },
  props: {
    title: {
      type: String,
      default: ''
    },
    columns: {
      type: Array,
      default: () => []
    },
    data: {
      type: Array,
      default: () => []
    },
    beforeShow: {
      type: Function,
      default() {}
    },
    description: {
      type: String,
      default: '点击开始配置'
    }
  },
  data: vm => ({
    visible: false,
    currentRowIndex: null,
    selectedRowKeys: [],
    tools: [
      {
        title: '新增',
        icon: 'plus',
        method: vm.add
      },
      {
        title: '预览',
        icon: 'eye',
        method: vm.view
      },
      {
        title: '批量删除',
        icon: 'delete',
        method: vm.batchRemove
      },
      {
        title: '取消',
        icon: 'close',
        method: vm.close
      }
    ]
  }),
  computed: {
    tableColumns() {
      return [
        ...this.columns.map(v => ({
          ...v,
          scopedSlots: {
            customRender: v.dataIndex
          }
        })),
        {
          title: '操作',
          align: 'center',
          width: 100,
          scopedSlots: { customRender: 'action' }
        }
      ]
    },
    tableData: {
      get() {
        return this.data
      },
      set(nV) {
        this.$emit('change', nV)
      }
    }
  },
  methods: {
    /**
     * 隐藏配置面板
     */
    hideEditableTable() {
      if (!this.visible) {
        this.visible = false
      }
    },
    /**
     * 显示配置面板
     */
    showEditableTable() {
      if (typeof this.beforeShow === 'function') {
        this.beforeShow(() => {
          this.visible = true
        })
      } else {
        this.visible = true
      }
    },
    /**
     * 配置列表选择变化
     */
    selectChange(selectedRowKeys) {
      this.selectedRowKeys = selectedRowKeys
    },
    /**
     * 表格单元组件变化
     */
    tableCellChange(value, record, column) {
      this.$set(record, column.dataIndex, value)
    },
    /**
     * 添加
     */
    add() {
      this.$emit('on-add')
    },
    /**
     * 预览
     */
    view() {
      this.$emit('on-view')
    },
    /**
     * 批量删除
     */
    batchRemove() {
      if (!this.selectedRowKeys.length) {
        this.$message.warning('请勾选需要删除的数据项')
        return
      }
      this.selectedRowKeys.forEach(v => {
        this.removeRow(this.tableData.findIndex(t => t.id === v))
      })
      this.selectedRowKeys = []
    },
    /**
     * 取消
     */
    close() {
      this.$emit('on-close')
      this.hideEditableTable()
    },
    /**
     * 编辑行
     */
    editRow(record, index) {
      this.currentRowIndex = index
    },
    /**
     * 移除行
     */
    removeRow(index) {
      this.tableData.splice(index, 1)
    }
  }
}
</script>
<style lang="less" scoped>
.editable-table {
  padding: 4px 8px 8px;
  &-table {
    ::v-deep .ant-table {
      th {
        padding: 4px 8px;
      }
      td {
        padding: 0;
      }
      .anticon {
        margin: 0 10px;
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
  &-description {
    color: @primary-color;
    cursor: pointer;
    font-size: @font-size-sm;
    &:hover {
      text-decoration: underline;
    }
  }
}
</style>
