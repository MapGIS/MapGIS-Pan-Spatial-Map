<template>
  <div class="mp-widget-func-warehouse">
    <div class="setting-panel">
      <a-space direction="vertical" class="space">
        <a-row>
          <a-col :span="4" class="col">
            服务类型:
          </a-col>
          <a-col :span="20">
            <a-select v-model="selectGroupIndex" @change="changeGroup">
              <a-select-option v-for="item in group" :key="item.index">{{
                item.groupName
              }}</a-select-option>
            </a-select>
          </a-col>
        </a-row>
        <a-table
          :columns="columns"
          :data-source="group[this.selectGroupIndex].children"
          :pagination="pagination"
          :scroll="{ x: 'calc(100% + 50%)' }"
          size="small"
          :rowKey="
            (record, index) => {
              return record.FlowNo
            }
          "
        >
          <template slot="operate" slot-scope="text, record">
            <a-tooltip placement="bottom">
              <template slot="title">
                <span>执行</span>
              </template>
              <a-icon type="swap" @click="openHandle(record)"></a-icon>
            </a-tooltip>
          </template>
        </a-table>
      </a-space>
    </div>
    <mp-window-wrapper :visible="openHandlerWindow">
      <template v-slot:default="slotProps">
        <mp-window
          id="handlerSelectId"
          :title="handlerSelect.FlowName"
          :width="720"
          :bottom="10"
          :verticalOffset="10"
          :visible.sync="openHandlerWindow"
          anchor="top-center"
          v-bind="slotProps"
        >
          <template>
            <mp-handler-window />
          </template>
        </mp-window>
      </template>
    </mp-window-wrapper>
    <!-- <a-modal
      v-model="openHandlerWindow"
      :title="handlerSelect.FlowName"
      :width="500"
      :footer="null"
      :mask="false"
      @ok="openHandlerWindow = false"
    >
      <mp-handler-window />
    </a-modal> -->
  </div>
</template>

<script lang="ts">
import { Mixins, Component } from 'vue-property-decorator'
import { WidgetMixin, Analysis } from '@mapgis/web-app-framework'
import MpHandlerWindow from './handler-window.vue'

@Component({ name: 'MpFuncWarehouse', components: { MpHandlerWindow } })
export default class MpFuncWarehouse extends Mixins(WidgetMixin) {
  private selectGroupIndex = 0

  private group = []

  // 打开处理界面
  private openHandlerWindow = false

  private handlerSelect = {}

  private columns = [
    {
      title: '流程号',
      dataIndex: 'FlowNo',
      align: 'center',
      width: 100,
      ellipsis: true
    },
    {
      title: '功能名称',
      dataIndex: 'FlowName',
      align: 'center',
      width: 160,
      ellipsis: true
    },
    { title: '创建者', dataIndex: 'Creator', align: 'center', ellipsis: true },
    {
      title: '创建时间',
      dataIndex: 'CreateDate',
      align: 'center',
      width: 100,
      ellipsis: true
    },
    {
      title: '描述',
      dataIndex: 'Description',
      align: 'center',
      width: 100,
      ellipsis: true
    },
    { title: '版本', dataIndex: 'Version', align: 'center', ellipsis: true },
    {
      key: 'operate',
      title: '执行',
      dataIndex: 'Handle',
      align: 'center',
      width: 100,
      fixed: 'right',
      scopedSlots: { customRender: 'operate' }
    }
  ]

  // 分页器配置
  private pagination = {
    showSizeChanger: true,
    size: 'small',
    total: this.group.length,
    showTotal: (total, range) => `${range[0]}-${range[1]} of ${total}`
  }

  // 面板打开时候触发函数
  onOpen() {
    this.init()
  }

  // 面板关闭时候触发函数
  onClose() {
    this.reset()
  }

  init() {
    const { ip, port } = this.widgetInfo.config
    Analysis.WorkflowAnalysis.getWorkflowList({ ip, port }).then(res => {
      this.constructData(res)
    })
  }

  reset() {
    this.selectGroupIndex = 0
    this.group = []
    this.openHandlerWindow = false
    this.handlerSelect = {}
    this.$refs.handlerWindow.resetView()
  }

  openHandle(row) {
    this.handlerSelect = row
    this.openHandlerWindow = true
  }

  // 拼接方法
  constructData(res) {
    const groups = []
    for (let i = 0; i < res.length; i++) {
      if (!groups.includes(res[i].Group)) {
        groups.push(res[i].Group)
      }
    }
    const data = []
    for (let i = 0; i < groups.length; i++) {
      const group = {}
      group.groupName = groups[i]
      group.index = i
      group.children = []
      for (let j = 0; j < res.length; j++) {
        if (res[j].Group === groups[i]) {
          group.children.push(res[j])
        }
      }
      data.push(group)
    }
    this.group = data
    this.selectGroupIndex = 0
  }

  changeGroup(val, option) {
    console.log(val, option)
  }
}
</script>

<style lang="less" scoped>
.mp-widget-func-warehouse {
  display: flex;
  flex-direction: column;
  align-items: center;
  .title {
    .space {
      width: 4px;
      height: 25px;
      background: @primary-color;
      margin-right: 8px;
      float: left;
    }
    .label {
      line-height: 25px;
      font-weight: bold;
    }
  }
  .space {
    width: 100%;
  }
  .btn {
    text-align: right;
    margin: 12px 0;
    button {
      margin-left: 8px;
    }
  }
  .col {
    text-align: center;
    line-height: 30px;
  }
  .setting-panel {
    display: flex;
    flex-direction: column;
    .ant-divider-horizontal {
      margin: 8px 0;
    }
    .color {
      height: 30px;
      box-shadow: @shadow-1-down;
      border-radius: 3px;
    }
  }
  .ant-table-wrapper {
    width: 500px;
  }
}
</style>
