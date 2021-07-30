<template>
  <div class="attribute-table">
    <a-empty :image-style="{ height: '50px' }" v-if="!visible">
      <span
        slot="description"
        @click="showTable"
        class="attribute-table-description"
      >
        点击开始配置
      </span>
    </a-empty>
    <mp-card v-else title="表格配置" :tools="tools">
      <a-table
        row-key="id"
        bordered
        :columns="tableColumns"
        :data-source="tableData"
        :scroll="{ y: 160 }"
        :pagination="false"
        :row-selection="{
          columnWidth: 32,
          selectedRowKeys,
          onChange: selectChange
        }"
      >
        <template slot="field" slot-scope="text, record">
          <a-select v-model="record.field" :options="fieldList" />
        </template>
        <template slot="alias" slot-scope="text, record">
          <a-input v-model="record.alias" />
        </template>
        <template slot="action" slot-scope="text, record, index">
          <a-icon type="delete" class="pointer" @click="remove(index)" />
        </template>
      </a-table>
    </mp-card>
  </div>
</template>
<script lang="ts">
import { Vue, Component, Prop } from 'vue-property-decorator'
import { UUID } from '@mapgis/web-app-framework'
import { NewSubjectConfig } from '../../../../../store'
import FieldInstance from '../store/fields'

@Component
export default class AttributeTable extends Vue {
  @Prop({ default: () => ({}) }) readonly subjectConfig!: NewSubjectConfig

  visible = false

  fieldList = []

  selectedRowKeys = []

  tableData = []

  tableColumns = [
    {
      title: '字段',
      dataIndex: 'field',
      scopedSlots: { customRender: 'field' }
    },
    {
      title: '别名',
      dataIndex: 'alias',
      width: 200,
      scopedSlots: { customRender: 'alias' }
    },
    {
      title: '操作',
      width: 50,
      scopedSlots: { customRender: 'action' }
    }
  ]

  tools = [
    {
      title: '新增',
      icon: 'plus',
      method: this.add
    },
    {
      title: '批量删除',
      icon: 'delete',
      method: this.batchRemove
    },
    {
      title: '删除配置',
      icon: 'close',
      method: this.close
    }
  ]

  hideTable() {
    this.visible = false
  }

  showTable() {
    if (!this.subjectConfig.ip || !this.subjectConfig.port) {
      this.$message.warning('未配置服务地址')
      return
    }
    this.visible = true
  }

  selectChange(selectedRowKeys: string[]) {
    this.selectedRowKeys = selectedRowKeys
  }

  remove(index: number) {
    this.tableData.splice(index, 1)
  }

  batchRemove() {}

  add() {
    FieldInstance.getFields(this.subjectConfig).then(list => {
      this.fieldList = list
      this.tableData.push({
        id: UUID.uuid(),
        field: '',
        alias: ''
      })
    })
  }

  close() {}
}
</script>
<style lang="less" scoped>
.attribute-table {
  ::v-deep .ant-table {
    line-height: 1.1;
    margin-bottom: 12px;
    .ant-table-thead > tr > th,
    .ant-table-tbody > tr > td {
      padding: 8px;
    }
    .ant-table-body {
      overflow: auto !important;
    }
  }
  &-description {
    color: @primary-color;
    cursor: pointer;
    &:hover {
      text-decoration: underline;
    }
  }
}
</style>
