<template>
  <div class="editable-table">
    <mp-card :title="title" :tools="tools">
      <slot name="top" />
      <a-table
        row-key="id"
        bordered
        :columns="columns"
        :data-source="data"
        :scroll="{ y: 160 }"
        :pagination="false"
        :row-selection="{
          columnWidth: 32,
          selectedRowKeys,
          onChange: selectChange
        }"
      >
        <template
          v-for="column in columns"
          :slot="column.scopedSlots.customRender"
          slot-scope="text, record"
        >
          <editable-table-cell
            :key="column.dataIndex"
            :column="column"
            :row="record"
          />
        </template>
      </a-table>
    </mp-card>
  </div>
</template>
<script>
import EditableTableCell from './EditableTableCell'

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
    }
  },
  data: vm => ({
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
        title: '取消配置',
        icon: 'close',
        method: vm.close
      }
    ]
  }),
  methods: {
    /**
     * 配置列表选择变化
     */
    selectChange(selectedRowKeys: string[]) {
      this.selectedRowKeys = selectedRowKeys
    },
    /**
     * 添加
     */
    add() {},
    /**
     * 预览
     */
    view() {},
    /**
     * 批量删除
     */
    batchRemove() {
      if (!this.selectedRowKeys.length) {
        this.$message.warning('请勾选需要删除的数据项')
        return
      }
      this.selectedRowKeys = []
    },
    /**
     * 取消
     */
    close() {}
  }
}
</script>
<style lang="less" scoped></style>
