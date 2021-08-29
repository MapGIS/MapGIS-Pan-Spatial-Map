<template>
  <div class="mp-widget-func-warehouse">
    <a-spin :spinning="showLoading">
      <mp-setting-form
        v-if="group.length"
        layout="vertical"
        :no-last-margin-bottom="true"
      >
        <a-form-item>
          <mp-group-tab
            slot="label"
            title="功能类型"
            :has-top-margin="false"
            :has-bottom-margin="false"
          ></mp-group-tab>
          <a-select v-model="selectGroupIndex">
            <a-select-option v-for="item in group" :key="item.index">
              {{ item.groupName }}
            </a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item>
          <mp-group-tab
            slot="label"
            title="功能列表"
            :has-top-margin="false"
            :has-bottom-margin="false"
          ></mp-group-tab>
          <a-table
            v-if="
              group[this.selectGroupIndex] &&
                group[this.selectGroupIndex].children
            "
            :columns="columns"
            :data-source="group[this.selectGroupIndex].children"
            :pagination="pagination"
            :scroll="{ x: 'calc(240%)' }"
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
                <a-icon
                  type="swap"
                  class="func-execute"
                  @click="openHandle(record)"
                ></a-icon>
              </a-tooltip>
            </template>
          </a-table>
        </a-form-item>
      </mp-setting-form>
      <a-empty v-else :image="simpleImage" />
    </a-spin>
    <mp-window-wrapper :visible="openHandlerWindow">
      <template v-slot:default="slotProps">
        <mp-window
          id="handlerSelectId"
          :title="handlerSelect.FlowName"
          :verticalOffset="10"
          :visible.sync="openHandlerWindow"
          anchor="top-center"
          v-bind="slotProps"
        >
          <template>
            <mp-handler-window
              ref="handlerWindow"
              :ip="ip"
              :port="port"
              :funcParam="handlerSelect"
            />
          </template>
        </mp-window>
      </template>
    </mp-window-wrapper>
  </div>
</template>

<script lang="ts">
import { Mixins, Component } from 'vue-property-decorator'
import { Empty } from 'ant-design-vue'
import { WidgetMixin, Analysis } from '@mapgis/web-app-framework'
import { baseConfigInstance } from '@mapgis/pan-spatial-map-common'
import MpHandlerWindow from './handler-window.vue'

// {
//     "CreateDate": "2011/6/21 0:00:00", // 工作流创建时间
//     "Creator": "", // 创建者
//     "Description": "", // 描述
//     "FlowName": "根据srID投影(sfcls/acls)", // 工作流名称
//     "FlowNo": 600234, // 工作流流程ID号
//     "Group": "web工作流目录", // 工作流所属组名
//     "Parameters": [ // 工作流所包含参数信息
//         { // 参数1包含的所有信息
//             "DataType": 1, // 参数类型，1为string，0为Int、2为Float、3为Bool、4为Date、5为DateTime、6为Unknow
//             "DefaultValue": "GDBP://MapGISLocal/Sample/sfcls/wh_中心线new", // 参数默认值
//             "Direction": 0, // 工作流参数方向0为输入（IN）、1为输出（OOUT）、2为输入输出（INOUT）
//             "Index": 1, // 参数对应索引号，默认从1开始编号
//             "Name": "clsName" // 参数名称
//         }],
//     "Version": ""
// }

@Component({ name: 'MpFuncWarehouse', components: { MpHandlerWindow } })
export default class MpFuncWarehouse extends Mixins(WidgetMixin) {
  private selectGroupIndex = 0

  private group = []

  // 是否打开功能执行界面
  private openHandlerWindow = false

  // 要执行功能的参数集合
  private handlerSelect = {}

  // 表头
  private columns = [
    {
      title: '流程号',
      dataIndex: 'FlowNo',
      align: 'center',
      width: 80,
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
      width: 60,
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

  private showLoading = false

  // ip
  get ip() {
    return this.widgetInfo.config.ip || baseConfigInstance.config.ip
  }

  // port
  get port() {
    return this.widgetInfo.config.port || baseConfigInstance.config.ip
  }

  beforeCreate() {
    this.simpleImage = Empty.PRESENTED_IMAGE_SIMPLE
  }

  // 面板打开时候触发函数
  onOpen() {
    this.init()
  }

  // 面板关闭时候触发函数
  onClose() {
    this.reset()
  }

  // 初始化的时候获取服务上功能仓库列表信息
  init() {
    const { ip, port } = this
    this.showLoading = true
    Analysis.WorkflowAnalysis.getWorkflowList({ ip, port })
      .then(res => {
        this.showLoading = false
        this.constructData(res)
      })
      .catch(err => {
        this.showLoading = false
      })
  }

  // 重置
  reset() {
    this.selectGroupIndex = 0
    this.group = []
    this.openHandlerWindow = false
    this.handlerSelect = {}
  }

  // 打开功能执行界面
  openHandle(row) {
    this.handlerSelect = row
    this.openHandlerWindow = true
  }

  // 分类列表数据
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
}
</script>

<style lang="less" scoped>
.mp-widget-func-warehouse {
  display: flex;
  flex-direction: column;
  align-items: center;
  .ant-table-wrapper {
    width: 300px;
    .func-execute {
      &:hover {
        color: @primary-color;
      }
    }
  }
}
</style>
