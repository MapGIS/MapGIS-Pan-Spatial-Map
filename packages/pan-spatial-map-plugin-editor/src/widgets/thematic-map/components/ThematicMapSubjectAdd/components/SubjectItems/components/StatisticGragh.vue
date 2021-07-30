<template>
  <div class="statistic-graph">
    <a-empty :image-style="{ height: '50px' }" v-if="!visible">
      <span
        slot="description"
        @click="showConfigPanel"
        class="statistic-graph-description"
      >
        点击开始配置
      </span>
    </a-empty>
    <mp-card v-else title="图表配置" :tools="tools" :loading="tableLoading">
      <mp-row-flex label="分组字段" :label-width="72">
        <a-select v-model="field" :options="fieldList" placeholder="请选择" />
      </mp-row-flex>
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
        <template slot="field" slot-scope="text, record, index">
          <a-select
            v-model="record.field"
            :options="fieldList"
            :disabled="currentRowIndex === index"
            placeholder="请选择"
          />
        </template>
        <template slot="alias" slot-scope="text, record, index">
          <a-input
            v-model="record.alias"
            :disabled="currentRowIndex === index"
            size="small"
            placeholder="请输入"
          />
        </template>
        <template slot="color" slot-scope="text, record, index">
          <mp-color-picker-confirm
            v-model="record.color"
            :border-radius="false"
            :disabled="currentRowIndex === index"
          />
        </template>
        <template slot="action" slot-scope="text, record, index">
          <a-icon type="edit" class="pointer" @click="editRow(index)" />
          <a-icon type="delete" class="pointer" @click="removeRow(index)" />
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
export default class StatisticGragh extends Vue {
  @Prop({ default: () => ({}) }) readonly subjectConfig!: NewSubjectConfig

  visible = false

  field = null

  fieldList = []

  selectedRowKeys = []

  currentRowIndex = null

  tableLoading = false

  tableData = []

  tableColumns = [
    {
      title: '统计字段',
      dataIndex: 'field',
      scopedSlots: { customRender: 'field' }
    },
    {
      title: '别名',
      dataIndex: 'alias',
      scopedSlots: { customRender: 'alias' }
    },
    {
      title: '颜色设置',
      dataIndex: 'color',
      align: 'center',
      scopedSlots: { customRender: 'color' }
    },
    {
      title: '操作',
      align: 'center',
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
      title: '预览',
      icon: 'eye',
      method: this.view
    },
    {
      title: '批量删除',
      icon: 'delete',
      method: this.batchRemove
    },
    {
      title: '取消配置',
      icon: 'close',
      method: this.close
    }
  ]

  /**
   * 派发结果
   */
  emitValue(value) {
    this.$emit('input', value)
  }

  /**
   * 隐藏配置面板
   */
  hideConfigPanel() {
    this.visible = false
  }

  /**
   * 显示配置面板
   */
  showConfigPanel() {
    if (!this.subjectConfig.ip || !this.subjectConfig.port) {
      this.$message.warning('未配置服务地址')
      return
    }
    this.visible = true
  }

  /**
   * 配置列表选择变化
   */
  selectChange(selectedRowKeys: string[]) {
    this.selectedRowKeys = selectedRowKeys
  }

  /**
   * 编辑某项配置
   */
  editRow(index: number) {
    this.currentRowIndex = index
  }

  /**
   * 移除某项配置
   */
  removeRow(index: number) {
    this.tableData.splice(index, 1)
  }

  /**
   * 添加配置
   */
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

  /**
   * 预览
   */
  view() {}

  /**
   * 批量删除已选配置
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
  }

  /**
   * 取消配置
   */
  close() {
    this.visible = false
    this.emitValue()
  }
}
</script>
<style lang="less" scoped>
.statistic-graph {
  .ant-row-flex {
    margin-bottom: 8px;
  }
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
