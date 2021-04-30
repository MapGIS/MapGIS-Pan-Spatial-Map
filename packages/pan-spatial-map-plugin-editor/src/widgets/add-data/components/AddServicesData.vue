<template>
  <div class="add-services-data">
    <div class="row first">
      <a-select class="select-first" v-model="serviceCategory">
        <a-select-option
          v-for="(item, index) in serviceCategories"
          :key="index"
          >{{ item.name }}</a-select-option
        >
      </a-select>
      <a-select v-model="serviceType">
        <a-select-option v-for="(item, index) in serviceTypes" :key="index">{{
          item
        }}</a-select-option>
      </a-select>
    </div>
    <div class="row">
      <a-input v-model="keyword">
        <a-icon slot="suffix" type="search"></a-icon>
      </a-input>
      <a-button type="primary">保存服务</a-button>
    </div>
    <a-table
      :columns="columns"
      :data-source="tableData"
      :pagination="pagination"
      :row-selection="{
        selectedRowKeys: selectedRowKeys,
        onChange: onSelectChange
      }"
      :rowKey="
        (record, index) => {
          return index
        }
      "
    >
      <template slot="url" slot-scope="text">
        <span :style="{ cursor: 'pointer' }">{{ text }}</span>
      </template>
      <template v-slot:operate>
        <a-tooltip placement="bottom">
          <template slot="title">
            <span>删除</span>
          </template>
          <a-icon type="delete"></a-icon>
        </a-tooltip>
      </template>
    </a-table>
  </div>
</template>

<script lang="ts">
import { Mixins, Component, Prop, Watch } from 'vue-property-decorator'
import { AppMixin } from '@mapgis/web-app-framework'
import {
  AddServicesMixin,
  ServiceType,
  Service
} from '@mapgis/pan-spatial-map-store'
import axios from 'axios'

@Component({})
export default class AddServicesData extends Mixins(
  AppMixin,
  AddServicesMixin
) {
  @Prop(Array) readonly serviceTypes!: ServiceType[]

  // 类别选中项
  private serviceCategory = ''

  // 子类别选中项
  private serviceType = null

  // private serviceCategories = []

  // 搜索框输入值
  private keyword = ''

  // 表格数据
  private tableData = [
    {
      name: 'xxx',
      type: 'xxx',
      url: 'xxx'
    }
  ]

  // 表格列配置
  private columns = [
    {
      title: '服务名称',
      dataIndex: 'name',
      align: 'center'
    },
    {
      title: '服务类型',
      dataIndex: 'type',
      align: 'center'
    },
    {
      key: 'url',
      title: '服务地址',
      dataIndex: 'url',
      align: 'center',
      scopedSlots: { customRender: 'url' }
    },
    {
      key: 'operate',
      title: '操作',
      align: 'center',
      scopedSlots: { customRender: 'operate' }
    }
  ]

  // 分页器配置
  private pagination = {
    showSizeChanger: true,
    size: 'small',
    total: this.tableData.length,
    showTotal: (total, range) => `${range[0]}-${range[1]} of ${total}`
  }

  // Table选中项的 key 数组
  private selectedRowKeys = []

  created() {
    // console.log(this.serviceCategories)
    this.serviceCategory = this.serviceCategories[0].name
    console.log(this.serviceCategory)
    // this.serviceType = this.serviceTypes[0]
  }

  // Table选中项发生变化时的回调
  onSelectChange(selectedRowKeys) {
    this.selectedRowKeys = selectedRowKeys
  }
}
</script>

<style lang="scss" scoped>
.add-services-data {
  display: flex;
  flex-direction: column;
  align-items: center;
}
.row {
  width: 100%;
  display: flex;
  align-items: center;
  padding: 0 13px;
  .ant-btn {
    margin-left: 8px;
  }
}
.first {
  margin-bottom: 10px;

  .ant-select {
    width: 50%;
  }
  .select-first {
    margin-right: 8px;
  }
}
</style>
