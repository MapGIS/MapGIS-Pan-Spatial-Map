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
    <template v-else>
      <mp-row-flex label="分组字段" :label-width="72">
        <a-select
          v-model="showFields"
          :options="fieldList"
          size="small"
          placeholder="请选择"
        />
      </mp-row-flex>
      <mp-row-flex label="字段别名" :label-width="72">
        <a-input v-model="showFieldsTitle" size="small" placeholder="请输入" />
      </mp-row-flex>
      <mp-card title="图表配置" :tools="tools" :loading="tableLoading">
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
            <a-select
              v-model="record.field"
              :options="fieldList"
              size="small"
              placeholder="请选择"
            />
          </template>
          <template slot="color" slot-scope="text, record">
            <mp-color-picker-confirm
              v-model="record.color"
              :border-radius="false"
              :disabled="true"
            />
          </template>
          <template slot="action" slot-scope="text, record, index">
            <a-icon type="edit" class="pointer" @click="editRow(index)" />
            <a-icon type="delete" class="pointer" @click="removeRow(index)" />
          </template>
        </a-table>
      </mp-card>
    </template>
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

  showFields = ''

  showFieldsTitle = ''

  fieldList = []

  selectedRowKeys = []

  tableLoading = false

  tableData = []

  tableColumns = [
    {
      title: '统计字段',
      dataIndex: 'field',
      scopedSlots: { customRender: 'field' }
    },
    {
      title: '颜色设置',
      dataIndex: 'color',
      width: 110,
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
  editRow(record: Record<string, any>, index: number) {}

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
  batchRemove() {}

  /**
   * 取消配置
   */
  close() {
    this.visible = false
  }
}
</script>
<style lang="less" scoped>
.statistic-graph {
  ::v-deep .ant-table {
    th {
      padding: 4px 8px;
    }
    td {
      padding: 0;
    }
    .ant-select-selection {
      border: none;
    }
    .ant-select-focused .ant-select-selection {
      box-shadow: none;
    }
  }
  &-description {
    color: @primary-color;
    cursor: pointer;
    font-size: 12px;
    &:hover {
      text-decoration: underline;
    }
  }
}
</style>
