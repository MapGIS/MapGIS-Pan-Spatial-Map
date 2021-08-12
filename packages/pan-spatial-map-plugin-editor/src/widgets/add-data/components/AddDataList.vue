<template>
  <div class="mp-widget-add-data beauty-scroll">
    <mp-toolbar class="add-data-toolbar">
      <add-data-category-select
        :categories="categories"
        :value="categoryName"
        @select="onCategorySelect"
        size="small"
        class="add-data-category-select"
      />
      <mp-toolbar-command-group>
        <mp-toolbar-command title="添加分类" icon="plus" @click="onAddCategory">
        </mp-toolbar-command>
      </mp-toolbar-command-group>
      <mp-toolbar-space></mp-toolbar-space>
      <a-divider type="vertical" />
      <mp-toolbar-command-group>
        <mp-toolbar-command title="保存" icon="save" @click="onSaveData">
        </mp-toolbar-command>
      </mp-toolbar-command-group>
    </mp-toolbar>
    <a-space direction="vertical" class="full-width">
      <a-row>
        <a-table
          class="data-table"
          :columns="columns"
          :data-source="categoryDataList"
          :pagination="pagination"
          :row-selection="{
            columnWidth: 20,
            selectedRowKeys: selectedRowKeys,
            onChange: onSelectChange
          }"
          :rowKey="
            (record, index) => {
              return record.id
            }
          "
          @change="onTableChange"
          size="small"
        >
          <div
            slot="filterDropdown"
            slot-scope="{
              setSelectedKeys,
              selectedKeys,
              confirm,
              clearFilters,
              column
            }"
            style="padding: 8px"
          >
            <a-input
              v-ant-ref="c => (searchInput = c)"
              :placeholder="`请输入${column.title}`"
              :value="selectedKeys[0]"
              style="width: 188px; margin-bottom: 8px; display: block;"
              @change="
                e => setSelectedKeys(e.target.value ? [e.target.value] : [])
              "
              @pressEnter="
                () => onSearch(selectedKeys, confirm, column.dataIndex)
              "
            />
            <a-button
              type="primary"
              icon="search"
              size="small"
              style="width: 90px; margin-right: 8px"
              @click="() => onSearch(selectedKeys, confirm, column.dataIndex)"
            >
              搜索
            </a-button>
            <a-button
              size="small"
              style="width: 90px"
              @click="() => onSearchReset(clearFilters)"
            >
              重置
            </a-button>
          </div>
          <a-icon
            slot="filterIcon"
            slot-scope="filtered"
            type="search"
            :style="{ color: filtered ? '#108ee9' : undefined }"
          />
          <template
            slot="customRenderName"
            slot-scope="text, record, index, column"
          >
            <span v-if="searchText && searchedColumn === column.dataIndex">
              <template
                v-for="(fragment, i) in text
                  .toString()
                  .split(
                    new RegExp(`(?<=${searchText})|(?=${searchText})`, 'i')
                  )"
              >
                <mark
                  v-if="fragment.toLowerCase() === searchText.toLowerCase()"
                  :key="i"
                  class="highlight"
                  >{{ fragment }}</mark
                >
                <template v-else>{{ fragment }}</template>
              </template>
            </span>
            <template v-else>
              {{ text }}
            </template>
          </template>
          <template slot="expandedRowRender" slot-scope="record">
            <div class="data-content">
              <a-textarea
                class="data-url"
                disabled
                :value="record.url"
                auto-size
              ></a-textarea>
              <mp-toolbar class="data-content-toolbar">
                <mp-toolbar-command-group>
                  <a-popconfirm
                    title="确认删除?"
                    @confirm="() => onDeleteData(record)"
                  >
                    <mp-toolbar-command
                      title="删除"
                      icon="delete"
                    ></mp-toolbar-command>
                  </a-popconfirm>
                </mp-toolbar-command-group>
              </mp-toolbar>
            </div>
          </template>
          <template slot="customRenderType" slot-scope="text">
            <div>{{ typeDescription(text) }}</div>
          </template>
        </a-table>
      </a-row>
    </a-space>
    <add-data-category
      :categories="categories"
      :visible="addCategoryVisible"
      @finished="onAddCategoryFinished"
      @added="onAddCategoryOk"
    ></add-data-category>
  </div>
</template>

<script lang="ts">
import { Vue, Component, Prop, Watch } from 'vue-property-decorator'
import AddDataCategorySelect from './AddDataCategorySelect.vue'
import AddDataCategory from './AddDataCategory.vue'

@Component({
  name: 'AddDataList',
  components: {
    AddDataCategorySelect,
    AddDataCategory
  }
})
export default class AddDataList extends Vue {
  @Prop({ type: Array }) dataList

  @Prop({ type: Array }) dataTypes

  @Prop({ type: Array }) categories

  private categoryName = this.categories.length ? this.categories[0].name : ''

  private categoryDataList = []

  private pagination = {
    current: 1,
    showSizeChanger: true,
    size: 'small',
    total: this.categoryDataList.length,
    showTotal: (total, range) => `${range[0]}-${range[1]} of ${total}`,
    pageSizeOptions: ['5', '10', '15', '20'],
    pageSize: 10
  }

  private searchText = ''

  private searchInput = null

  private searchedColumn = ''

  private pageSizeOptions = ['5', '10', '15', '20']

  private selectedRowKeys = []

  private preSelectedRowKeys = []

  private addCategoryVisible = false

  get columns() {
    return [
      {
        title: '名称',
        dataIndex: 'name',
        sorter: (a, b) => a.name < b.name,
        scopedSlots: {
          filterDropdown: 'filterDropdown',
          filterIcon: 'filterIcon',
          customRender: 'customRenderName'
        },
        onFilter: (value, record) =>
          record.name
            .toString()
            .toLowerCase()
            .includes(value.toLowerCase()),
        onFilterDropdownVisibleChange: visible => {
          if (visible) {
            setTimeout(() => {
              this.searchInput.focus()
            }, 0)
          }
        }
      },
      {
        title: '类型',
        dataIndex: 'type',
        sorter: (a, b) =>
          this.typeDescription(a.type) < this.typeDescription(b.type),
        scopedSlots: { customRender: 'customRenderType' },
        filters: this.dataTypes,
        onFilter: (value, record) => record.type.indexOf(value) === 0
      }
    ]
  }

  get typeDescription() {
    return function(typeVal) {
      const type = this.dataTypes.find(item => {
        return item.value === typeVal
      })
      return type ? type.text : ''
    }
  }

  @Watch('categoryName', { immediate: true })
  changeCategory() {
    this.queryData()
  }

  onCategorySelect(val) {
    this.categoryName = val
  }

  onAddCategory() {
    this.addCategoryVisible = true
  }

  onSaveData() {
    this.$emit('save')
  }

  onTableChange(pagination) {
    this.pagination = { ...pagination }
  }

  onSearch(selectedKeys, confirm, dataIndex) {
    confirm()
    this.searchText = selectedKeys[0]
    this.searchedColumn = dataIndex
  }

  onSearchReset(clearFilters) {
    clearFilters()
    this.searchText = ''
  }

  onSelectChange(selectedRowKeys) {
    this.selectedRowKeys = selectedRowKeys
    let newChecked = []
    let newUnChecked = []
    // 区分哪些是新选中的，哪些是新取消选中的
    if (this.preSelectedRowKeys.length === 0) {
      newChecked = this.selectedRowKeys
    } else if (this.selectedRowKeys.length === 0) {
      newUnChecked = this.preSelectedRowKeys
    } else {
      newChecked = this.selectedRowKeys.reduce((result, item) => {
        if (this.preSelectedRowKeys.includes(item) === false) {
          result.push(item)
        }
        return result
      }, [])

      newUnChecked = this.preSelectedRowKeys.reduce((result, item) => {
        if (this.selectedRowKeys.includes(item) === false) {
          result.push(item)
        }
        return result
      }, [])
    }

    for (let i = 0; i < this.categoryDataList.length; i++) {
      const dataItem = this.categoryDataList[i]
      if (
        newChecked.some(item => item === dataItem.id) &&
        dataItem.visible === false
      ) {
        dataItem.visible = true
        this.addLayer(dataItem)
      }
      if (
        newUnChecked.some(item => item === dataItem.id) &&
        dataItem.visible === true
      ) {
        dataItem.visible = false
        this.removeLayer(dataItem)
      }
    }

    this.preSelectedRowKeys = JSON.parse(JSON.stringify(this.selectedRowKeys))
  }

  onAddCategoryFinished() {
    this.addCategoryVisible = false
  }

  onAddCategoryOk({ name, description }) {
    this.$emit('add-category', { name, description })
    this.categoryName = name
  }

  onDeleteData(dataItem) {
    const selected = this.selectedRowKeys.find(key => key === dataItem.id)
    if (selected) {
      // 需要从文档中移除
      this.removeLayer(dataItem)
    }

    const index = this.categoryDataList.findIndex(
      item => item.id == dataItem.id
    )

    if (index >= 0) {
      this.categoryDataList.splice(index, 1)
    }
  }

  private queryData() {
    const category = this.dataList.find(category => {
      return category.name === this.categoryName
    })

    if (!category) {
      return []
    }
    this.categoryDataList = category.children
  }

  private selectData(name, data) {
    this.categoryName = name
    this.queryData()
    this.selectedRowKeys.push(data.id)
    this.onSelectChange(this.selectedRowKeys)
  }

  private unSelectData(id) {
    const index = this.selectedRowKeys.findIndex(item => item === id)

    this.selectedRowKeys.splice(index, 1)
    this.onSelectChange(this.selectedRowKeys)
  }

  private addLayer(dataItem) {
    this.$emit('add-layer', dataItem)
  }

  private removeLayer(dataItem) {
    this.$emit('remove-layer', dataItem)
  }
}
</script>

<style lang="less" scoped>
.mp-widget-add-data {
  overflow: auto;
  .add-data-toolbar {
    margin-bottom: 10px;
    .add-data-category-select {
      min-width: 120px;
      padding-right: 6px;
    }
  }
  .full-width {
    width: 100%;
  }
  .data-table {
    .data-content {
      display: flex;
      flex-direction: column;
      .data-url {
        padding: 3px 0;
        color: @text-color-secondary;
        word-break: break-all;
        white-space: break-spaces;
        font-size: 12px;
        &.ant-input {
          border: none;
          background-color: transparent;
          resize: none;
        }
      }
      .data-content-toolbar {
        flex-direction: row-reverse;
      }
    }
    /deep/.ant-table-expand-icon-th,
    /deep/.ant-table-row-expand-icon-cell {
      width: 20px;
      min-width: 20px;
    }
    /deep/.ant-table-pagination.ant-pagination {
      margin: 8px 0 0 0;
      .ant-pagination-options-size-changer.ant-select {
        margin-right: 0;
      }
    }
  }
}
</style>
