<template>
  <div class="mp-widget-non-spatial">
    <div class="non-spatial-header">
      <a-input-search
        placeholder="请输入查询条件"
        enter-button="搜索"
        @search="onSearch"
      />
      <div class="header-right">
        <div class="right-item first">
          <span>类型:</span>
          <a-select v-model="selectType" size="small">
            <a-select-option v-for="item in typeOptions" :key="item">
              {{ item }}
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
        <div class="content-item" v-for="item in tableData" :key="item.key">
          <div class="item-img"></div>
          <div>label</div>
        </div>
      </div>
    </div>
    <div class="non-spatial-footer">
      <a-pagination
        :total="85"
        :show-total="
          (total, range) => `${range[0]}-${range[1]} of ${total} items`
        "
        :page-size="20"
        :default-current="1"
      />
    </div>
  </div>
</template>

<script lang="ts">
import { Mixins, Component } from 'vue-property-decorator'
import { WidgetMixin } from '@mapgis/web-app-framework'

@Component({ name: 'MpNonSpatial' })
export default class MpNonSpatial extends Mixins(WidgetMixin) {
  // 搜索框搜索事件
  private onSearch() {}

  // 类型下拉值
  private selectType = ''

  // 类型下拉项数组
  private typeOptions = []

  // 表格数据
  private tableData = [
    {
      key: '1',
      name: 'John Brown',
      type: 32
    },
    {
      key: '2',
      name: 'Jim Green',
      type: 42
    },
    {
      key: '3',
      name: 'Joe Black',
      type: 32
    },
    {
      key: '4',
      name: 'Joe Black',
      type: 32
    },
    {
      key: '5',
      name: 'Joe Black',
      type: 32
    },
    {
      key: '6',
      name: 'Joe Black',
      type: 32
    },
    {
      key: '7',
      name: 'Joe Black',
      type: 32
    },
    {
      key: '8',
      name: 'Joe Black',
      type: 32
    }
  ]

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

  // 数据是否以大图显示
  private showPicutre = false

  created() {
    this.initData()
  }

  private initData() {}

  // 点击大图图标回调
  private onPicture() {
    this.showPicutre = true
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
      width: 16.6%;
      height: 33%;
      display: flex;
      flex-direction: column;
      border: 1px solid red;
      padding: 8px;
    }
    .item-img {
      flex-grow: 1;
    }
  }

  .non-spatial-footer {
    display: flex;
    justify-content: center;
    align-items: center;
    margin: 16px;
  }
}
</style>
