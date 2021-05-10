<template>
  <div class="add-services-data">
    <div class="row first">
      <a-select class="select-first" v-model="serviceCategory">
        <a-select-option v-for="item in serviceCategories" :key="item.name">{{
          item.name
        }}</a-select-option>
      </a-select>
      <a-select v-model="serviceType">
        <a-select-option v-for="item in serviceTypes" :key="item.value">{{
          item.label
        }}</a-select-option>
      </a-select>
    </div>
    <div class="row">
      <a-input-search v-model="keyword" @search="getData"></a-input-search>
      <a-button type="primary" @click="onSave">保存服务</a-button>
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
          return record.id
        }
      "
    >
      <template slot="url" slot-scope="text">
        <span :style="{ cursor: 'pointer' }" @click="onOpenUrl(text)">{{
          text
        }}</span>
      </template>
      <template slot="operate" slot-scope="text">
        <a-tooltip placement="bottom">
          <template slot="title">
            <span>删除</span>
          </template>
          <a-icon type="delete" @click="onDelete(text)"></a-icon>
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

  // 搜索框输入值
  private keyword = ''

  // 表格数据
  private tableData = []

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

  // Table选中项数组
  private checkedRows = []

  // Table上一次选中项数组
  private preCheckedRows = []

  @Watch('serviceCategory', { immediate: true })
  @Watch('serviceType', { immediate: true })
  getData() {
    this.tableData = this.services.filter(item => {
      if (this.serviceCategory && item.category !== this.serviceCategory)
        return false
      if (this.serviceType && item.type !== this.serviceType) return false
      if (!item.name.includes(this.keyword)) return false
      return true
    })
    // this.selected = this.data.filter(item => item.visible)
  }

  created() {
    this.serviceCategory = this.serviceCategories[0].name
    this.serviceType = this.serviceTypes[0].value
    this.$message.config({
      top: '100px',
      duration: 2,
      maxCount: 1
    })
  }

  // Table选中项发生变化时的回调
  onSelectChange(selectedRowKeys) {
    this.selectedRowKeys = selectedRowKeys
    console.log(this.services)
    console.log(this.selectedRowKeys)
    let newChecked = []
    let newUnChecked = []
    // 区分哪些是新选中的，哪些是新取消选中的
    this.checkedRows = this.tableData.reduce((result, item) => {
      if (this.selectedRowKeys.includes(item.id)) {
        result.push(item)
      }
      return result
    }, [])
    if (this.preCheckedRows.length === 0) {
      newChecked = this.checkedRows
    } else if (this.checkedRows.length === 0) {
      newUnChecked = this.preCheckedRows
    } else {
      newChecked = this.checkedRows.reduce((result, item) => {
        if (this.preCheckedRows.includes(item) === false) {
          result.push(item)
        }
        return result
      }, [])

      newUnChecked = this.preCheckedRows.reduce((result, item) => {
        if (this.checkedRows.includes(item) === false) {
          result.push(item)
        }
        return result
      }, [])
    }
    console.log(newChecked)
    console.log(newUnChecked)

    for (let i = 0; i < this.services.length; i++) {
      const service = this.services[i]
      if (
        newChecked.some(item => item.id === service.id) &&
        service.visible === false
      ) {
        service.visible === true
        // 添加服务到文档中
        this.addLayerToDocumentByService(service)
      }
      if (
        newUnChecked.some(item => item.id === service.id) &&
        service.visible === true
      ) {
        service.visible === false
        // 将服务从文档中删除
        this.removeLayerFromDocumentByService(service)
      }
    }

    this.preCheckedRows = JSON.parse(JSON.stringify(this.checkedRows))
  }

  // 点击服务地址列的回调
  onOpenUrl(url) {
    window.open(url)
  }

  // 点击删除图标的回调
  onDelete(text) {
    console.log(text)
    this.deleteService(text)
    this.getData()
  }

  // 点击保存服务按钮的回调
  onSave() {
    const url = '/onemap/WebService/SaveConfig'
    let fileName = 'addService'
    if (!this.is2DMapMode) {
      fileName = 'addService3d'
    }
    const data = JSON.stringify(this.services)
    const fd = new FormData()
    fd.append('id', fileName)
    fd.append('config', data)
    const config = {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    }
    axios.post(url, fd, config).then(
      res => {
        this.$message.success('保存成功')
      },
      error => {
        this.$message.error('保存失败')
      }
    )
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
.ant-table-wrapper {
  width: 100%;
}
</style>
