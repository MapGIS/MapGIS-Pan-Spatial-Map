<template>
  <div class="mp-widget-non-spatial">
    <div class="non-spatial-header">
      <a-input-search
        v-model="searchValue"
        placeholder="请输入查询条件"
        enter-button="搜索"
        allow-clear
        @search="onSearch"
      />
      <div class="header-right">
        <div class="right-item first">
          <span>类型:</span>
          <a-select v-model="selectType" size="small" @change="onSelectChange">
            <a-select-option v-for="item in typeOptions" :key="item.value">
              {{ item.label }}
            </a-select-option>
          </a-select>
        </div>
        <div class="right-item">
          <span>展示方式:</span>
          <a-button
            class="btn-first"
            size="small"
            icon="picture"
            @click="onPicture"
          />
          <a-button
            class="btn-second"
            size="small"
            icon="unordered-list"
            @click="onList"
          />
        </div>
      </div>
    </div>
    <div class="non-spatial-panel">
      <a-table
        v-show="!showPicutre"
        :columns="columns"
        :data-source="tableData"
        :pagination="pagination"
        :rowKey="
          record => {
            return record.id
          }
        "
        @change="onTablePageChange"
      >
        <template slot="name" slot-scope="text">
          <a-icon type="file" />
          <span>{{ text }}</span>
        </template>
        <template slot="action" slot-scope="text, record">
          <a-icon type="download" @click="onClickDownLoad(record)" />
        </template>
      </a-table>
      <div v-show="showPicutre" class="panel-content">
        <div class="content-item" v-for="item in pictrueData" :key="item.id">
          <div class="item-img">
            <img
              :src="`http://localhost:8015${treeConfig.iconConfig[1]}`"
              alt=""
            />
          </div>
          <div class="item-label">
            <a-popover placement="bottom">
              <template slot="content">
                <span>{{ item.name }}</span>
              </template>
              <div class="lable-text">{{ item.name }}</div>
            </a-popover>
          </div>
        </div>
      </div>
    </div>
    <div class="non-spatial-footer">
      <a-pagination
        v-show="!showPicutre"
        :total="pageTotal"
        :show-total="
          (total, range) => `${range[0]}-${range[1]} of ${total} items`
        "
        :page-size="8"
        :default-current="1"
        @change="onPageChange"
      />

      <a-pagination
        v-show="showPicutre"
        :current="currentPage"
        :total="pageTotal"
        :show-total="
          (total, range) => `${range[0]}-${range[1]} of ${total} items`
        "
        :page-size="10"
        :default-current="1"
        @change="onPicturePageChange"
      />
    </div>
  </div>
</template>

<script lang="ts">
import { Mixins, Component, Prop, Watch } from 'vue-property-decorator'
import { WidgetMixin } from '@mapgis/web-app-framework'
import axios from 'axios'

@Component({ name: 'MpNonSpatial' })
export default class MpNonSpatial extends Mixins(WidgetMixin) {
  // 非空间数据资源url
  @Prop({ type: String }) url: string

  // 目录树微件的配置
  @Prop({ type: Object }) treeConfig: object

  // 搜索框输入值
  private searchValue = ''

  // 类型下拉值
  private selectType = ''

  // 类型下拉项数组
  private typeOptions = [
    {
      label: '全部',
      value:
        'doc、docx、xls、xlsx、ppt、pptx、jpg、png、mp4、avi、pcx、ogg、pdf'
    },
    {
      label: '图片',
      value: 'jpg、png'
    },
    {
      label: '文档',
      value: 'doc、docx'
    },
    {
      label: '表格',
      value: 'xls、xlsx'
    },
    {
      label: '视频',
      value: 'mp4、avi、pcx、ogg'
    }
  ]

  // 表格数据
  private tableData = []

  // 表格列配置
  private columns = [
    {
      title: '名称',
      dataIndex: 'name',
      key: 'name',
      scopedSlots: { customRender: 'name' }
    },
    {
      title: '类型',
      dataIndex: 'type',
      key: 'type',
      scopedSlots: { customRender: 'type' }
    },
    {
      title: '下载',
      dataIndex: 'action',
      key: 'action',
      scopedSlots: { customRender: 'action' }
    }
  ]

  // 以大图方式显示的数据
  private pictrueData = []

  // 数据是否以大图显示
  private showPicutre = false

  // 分页器配置
  private pagination = {
    current: 1,
    total: this.tableData.length,
    showTotal: (total, range) => `${range[0]}-${range[1]} of ${total}`,
    pageSize: 8
  }

  // 分页器总数
  private pageTotal = 0

  // 分页器当前页数
  private currentPage = 1

  // 监听非空间数据url变化，初始化table表格数据及大图状态数据
  @Watch('url')
  onUrlChange(newVal) {
    console.log(newVal)

    this.getNonSpatialData().then(res => {
      console.log(res)
      this.tableData = res.content
      this.pageTotal = res.totalElements

      if (this.showPicutre) {
        this.getPictureData()
      }
    })
  }

  created() {
    this.initData()
  }

  // 初始化各项数据
  private initData() {
    this.selectType = this.typeOptions[0].value
  }

  // 初始化非空间数据
  private getNonSpatialData() {
    return new Promise((resolve, reject) => {
      const request = new XMLHttpRequest()
      request.responseType = 'json'
      request.open('GET', this.url)
      request.withCredentials = true
      request.onreadystatechange = () => {
        if (request.readyState === 4) {
          if (request.status >= 200 && request.status <= 304) {
            const data = JSON.parse(JSON.stringify(request.response))
            resolve(data)
          } else {
            reject(request.response)
          }
        }
      }
      request.send()
    })
  }

  // 分页页码改变的回调(列表状态显示)
  private onPageChange(page, pageSize) {
    this.pagination.current = page
    this.pagination.pageSize = pageSize

    // 同步更新table表格的分页器
    this.onTablePageChange(this.pagination)
  }

  // 分页页码改变的回调(大图状态显示)
  private onPicturePageChange(page) {
    this.currentPage = page

    this.getPictureData()
  }

  // table分页变化时回调
  private onTablePageChange(pagination) {
    this.pagination = { ...pagination }
  }

  // 获取大图状态显示下的数据
  private getPictureData() {
    if (this.tableData.length <= 10) {
      this.pictrueData = this.tableData
    } else {
      const startIndex = (this.currentPage - 1) * 10
      const endIndex = this.currentPage * 10
      this.pictrueData = this.tableData.slice(startIndex, endIndex)
    }
  }

  // 搜索框搜索事件回调
  private onSearch(value) {
    this.onFilterData()
  }

  // 下拉项变化时回调
  private onSelectChange(value) {
    this.onFilterData()
  }

  // 通过搜索框与下拉项筛选数据
  // 可能同时存在搜索值与下拉项值，所以筛选数据都放在一块处理
  private onFilterData() {
    this.getNonSpatialData().then(res => {
      this.tableData = res.content

      this.tableData = this.tableData.reduce((result, item) => {
        const type = item.type.toLowerCase()
        if (
          this.selectType.includes(type) &&
          item.name.includes(this.searchValue)
        ) {
          result.push(item)
        }
        return result
      }, [])
      this.pageTotal = this.tableData.length

      if (this.showPicutre) {
        this.getPictureData()
      }
    })
  }

  // 点击大图图标回调
  private onPicture() {
    this.showPicutre = true

    this.getPictureData()
  }

  // 点击列表图标回调
  private onList() {
    this.showPicutre = false
  }

  // 点击下载图标回调
  private onClickDownLoad(record) {
    console.log(record)
  }
}
</script>

<style lang="less" scoped>
.mp-widget-non-spatial {
  display: flex;
  flex-direction: column;
  height: 100%;
  .non-spatial-header {
    display: flex;
    justify-content: space-between;
    align-items: center;

    .ant-input-search {
      width: 225px;
    }

    .header-right {
      display: flex;
      align-items: center;
    }

    .right-item {
      span {
        margin-right: 4px;
      }

      .btn-first {
        margin-right: 8px;
      }

      .btn-second {
      }
    }

    .first {
      margin-right: 24px;
    }

    .ant-select {
      width: 64px;
    }
  }

  .non-spatial-panel {
    flex-grow: 1;
    width: 100%;
    margin-top: 8px;

    ::v-deep.ant-table-row :hover {
      color: #31a7da;
      cursor: pointer;
    }

    .panel-content {
      width: 100%;
      height: 100%;
      display: flex;
      flex-wrap: wrap;
      align-content: flex-start;
    }

    .content-item {
      width: 18.6%;
      height: 39%;
      display: flex;
      flex-direction: column;
      padding: 8px;
      margin-bottom: 16px;
    }

    .content-item:hover {
      color: #169bd5;
      cursor: pointer;
    }

    .item-img {
      flex-grow: 1;
      width: 100%;
      position: relative;
      border: 1px solid #dcdcdc;

      img {
        height: 65%;
        position: absolute;
        top: 0;
        right: 0;
        bottom: 0;
        left: 0;
        margin: auto;
      }
    }

    .item-label {
      border: 1px solid #dcdcdc;
      padding: 2px;

      .lable-text {
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
    }

    ::v-deep.ant-table-pagination {
      visibility: hidden;
    }
  }

  .non-spatial-footer {
    display: flex;
    justify-content: center;
    align-items: center;
    margin: 12px;
  }
}
</style>
