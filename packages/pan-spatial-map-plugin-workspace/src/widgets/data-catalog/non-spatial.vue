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
        :loading="loading"
        :data-source="tableData"
        :pagination="pagination"
        :rowKey="
          record => {
            return record.id
          }
        "
        @change="onTablePageChange"
      >
        <template slot="name" slot-scope="text, record">
          <a-icon type="file" />
          <span @click="onView(record)">{{ text }}</span>
        </template>
        <template slot="action" slot-scope="text, record">
          <a-icon type="download" @click="onClickDownLoad(record)" />
        </template>
      </a-table>
      <div v-show="showPicutre" class="panel-content">
        <div
          class="content-item"
          v-for="item in pictrueData"
          :key="item.id"
          @click="onView(item)"
        >
          <div class="item-img">
            <img
              v-if="item.type === 'doc' || item.type === 'docx'"
              src="./images/word.png"
              alt=""
            />
            <img
              v-if="item.type === 'xls' || item.type === 'xlsx'"
              src="./images/excel.png"
              alt=""
            />
            <img
              v-if="
                item.type === 'ppt' ||
                  item.type === 'pptx' ||
                  item.type === 'pdf'
              "
              src="./images/pdf.png"
              alt=""
            />
            <img
              v-if="
                item.type === 'mp4' ||
                  item.type === 'avi' ||
                  item.type === 'pcx' ||
                  item.type === 'ogg'
              "
              src="./images/video.png"
              alt=""
            />
            <img
              v-if="item.type === 'jpg' || item.type === 'png'"
              src="./images/img.png"
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
        :current="currentPageList"
        :total="pageTotal"
        :show-total="
          (total, range) => `${range[0]}-${range[1]} of ${total} items`
        "
        :page-size="8"
        @change="onPageChange"
      />

      <a-pagination
        v-show="showPicutre"
        :current="currentPagePic"
        :total="pageTotal"
        :show-total="
          (total, range) => `${range[0]}-${range[1]} of ${total} items`
        "
        :page-size="10"
        :default-current="1"
        @change="onPicturePageChange"
      />
    </div>
    <a-modal v-model="showModal" :footer="null" :width="800">
      <iframe
        v-if="showFileType === 'text'"
        :src="fileUrl"
        width="100%"
        height="100%"
        frameborder="1"
      >
      </iframe>
      <video
        v-if="showFileType === 'video'"
        :src="videoUrl"
        alt="预览"
        id="video"
        controls="controls"
        width="752"
        height="632"
      ></video>
      <img
        v-if="showFileType === 'img'"
        :src="imgUrl"
        alt=""
        width="752"
        height="632"
      />
    </a-modal>
  </div>
</template>

<script lang="ts">
import { Mixins, Component, Prop, Watch } from 'vue-property-decorator'
import { WidgetMixin } from '@mapgis/web-app-framework'
import axios from 'axios'

@Component({ name: 'MpNonSpatial' })
export default class MpNonSpatial extends Mixins(WidgetMixin) {
  // 获取当前选种的非空间数据资源列表url
  @Prop({ type: String }) url: string

  // 非空间数据资源url
  @Prop({ type: String }) nonSpatialUrl: string

  // 非空间数据类型
  @Prop({ type: String }) type: string

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

  // 数据是否加载中
  private loading = false

  // 以大图方式显示的数据
  private pictrueData = []

  // 数据是否以大图显示
  private showPicutre = false

  // table的分页器配置(table自身的分页器在页面中隐藏显示了)
  // table的分页功能是通过页面下方的分页器进行控制的
  private pagination = {
    current: 1,
    total: this.tableData.length,
    showTotal: (total, range) => `${range[0]}-${range[1]} of ${total}`,
    pageSize: 8
  }

  // 分页器总数
  private pageTotal = 0

  // 分页器当前页数(列表状态显示)
  private currentPageList = 1

  // 分页器当前页数(大图状态显示)
  private currentPagePic = 1

  // 点击的文件对应的资源url
  private fileUrl = ''

  // 媒体文件对应的资源url
  private videoUrl = ''

  // 图片文件对应的资源url
  private imgUrl = ''

  // 预览对话框的显隐
  private showModal = false

  // 当前预览的文件类型
  private showFileType = ''

  // 监听非空间数据url变化，初始化table表格数据及大图状态数据
  @Watch('url')
  onUrlChange(newVal) {
    this.loading = true
    this.getUrlData(newVal).then(res => {
      this.loading = false
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

    this.$message.config({
      top: '100px',
      duration: 2,
      maxCount: 1
    })
  }

  // 通过发送请求获取对应服务数据
  private getUrlData(url) {
    const this_ = this
    return new Promise((resolve, reject) => {
      const request = new XMLHttpRequest()
      request.ontimeout = function(e) {
        this_.$message.error('请求超时，数据加载失败')
        this_.loading = false
      }
      request.responseType = 'json'
      request.open('GET', url)
      request.withCredentials = true
      request.timeout = 5000
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
  private onPageChange(page) {
    this.currentPageList = page
    this.pagination.current = page

    // 同步更新table表格的分页器
    this.onTablePageChange(this.pagination)
  }

  // 分页页码改变的回调(大图状态显示)
  private onPicturePageChange(page) {
    this.currentPagePic = page

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
      const startIndex = (this.currentPagePic - 1) * 10
      const endIndex = this.currentPagePic * 10
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
    this.loading = true
    this.getUrlData(this.url).then(res => {
      this.loading = false
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

      // 筛选数据后，数据总数会变，同时也要同步table表格的页码
      this.pageTotal = this.tableData.length
      this.onPageChange(this.currentPageList)

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
    const downLoadUrl = `${this.baseUrl}/api/non-spatial/download/url?name=${record.name}&path=${this.type}&protocol=ftp&type=${record.type}&url=${this.nonSpatialUrl}`
    this.getUrlData(downLoadUrl).then(res => {
      const downLoadPath = this.baseUrl + res.path

      const xhr = new XMLHttpRequest()
      xhr.open('get', downLoadPath)
      xhr.responseType = 'blob'
      xhr.withCredentials = true
      xhr.send()
      xhr.onload = function() {
        if (this.status === 200 || this.status === 304) {
          const fileReader = new FileReader()
          fileReader.readAsDataURL(this.response)
          fileReader.onload = function() {
            const a = document.createElement('a')
            a.style.display = 'none'
            a.href = this.result
            a.download = `${record.name}.${record.type}`
            document.body.appendChild(a)
            a.click()
            document.body.removeChild(a)
          }
        }
      }
    })
  }

  // 点击文件项进行预览回调
  private onView(record) {
    const downLoadUrl = `${this.baseUrl}/api/non-spatial/download/url?name=${record.name}&path=${this.type}&protocol=ftp&type=${record.type}&url=${this.nonSpatialUrl}`

    if (!'pdf,mp4,ogg,jpg,png'.includes(record.type)) {
      this.$message.warning('该类型文件暂不支持预览')
      return false
    } else {
      this.getUrlData(downLoadUrl).then(res => {
        this.fileUrl = this.baseUrl + res.path

        switch (record.type) {
          // 目前iframe只支持pdf文件的预览
          case 'pdf':
            this.showFileType = 'text'
            break
          // 目前video标签只支持mp4、ogg格式视频文件的预览
          case 'mp4':
          case 'ogg':
            this.showFileType = 'video'
            this.videoUrl = this.fileUrl
            break
          case 'jpg':
          case 'png':
            this.showFileType = 'img'
            this.imgUrl = this.fileUrl
            break
          default:
            break
        }

        this.showModal = true
      })
    }
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
::v-deep .ant-modal {
  top: 60px;
}
::v-deep .ant-modal-body {
  height: 680px;
}
::v-deep .ant-modal-close-x {
  display: flex;
  justify-content: center;
  width: 28px;
  padding-top: 8px;
}
</style>
