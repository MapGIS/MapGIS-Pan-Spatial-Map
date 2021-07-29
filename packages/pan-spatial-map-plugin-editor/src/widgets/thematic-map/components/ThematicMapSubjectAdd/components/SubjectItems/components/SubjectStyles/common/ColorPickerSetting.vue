<template>
  <a-dropdown :visible="dropdownVisible" :trigger="['click']">
    <span
      class="color-view"
      :style="{ background }"
      @click.stop="showDropdown"
    />
    <mp-layout-column slot="overlay" :box-shadow="true" size="small">
      <mp-toolbar-header slot="header" title="颜色设置" :tools="tools" />
      <a-table
        bordered
        :pagination="false"
        :columns="tableColumns"
        :data-source="tableData"
        :row-selection="{
          columnWidth: 32,
          selectedRowKeys,
          onChange: selectChange
        }"
        class="color-setting-table"
      >
        <template slot="color" slot-scope="text, record">
          <color-picker
            v-model="record.color"
            :border-radius="false"
            type="rgb"
          />
        </template>
        <template slot="percent" slot-scope="text, record">
          <a-input-number
            v-model="record.percent"
            :min="0"
            :max="100"
            :precision="0"
            :formatter="value => `${value}%`"
            :parser="value => value.replace('%', '')"
          />
        </template>
        <template slot="operation" slot-scope="text, record, index">
          <a-icon type="delete" class="pointer" @click="remove(index)" />
        </template>
      </a-table>
    </mp-layout-column>
  </a-dropdown>
</template>
<script lang="ts">
import { Vue, Component, Prop, Watch } from 'vue-property-decorator'
import { UUID } from '@mapgis/web-app-framework'
import ColorPicker from './ColorPicker.vue'

interface ITableDataItem {
  color: string
  percent: number
}

@Component({
  components: {
    ColorPicker
  }
})
export default class ColorPickerSetting extends Vue {
  // {0.25: rgb(0,0,255), 0.55: rgb(0,0,255)}
  @Prop() readonly value!: Record<string, string>

  defaultColor = 'rgb(64,169,255)'

  dropdownVisible = false

  selectedRowKeys = []

  tableColumns = [
    {
      title: '颜色',
      dataIndex: 'color',
      align: 'center',
      scopedSlots: { customRender: 'color' }
    },
    {
      title: '占比',
      dataIndex: 'percent',
      scopedSlots: { customRender: 'percent' }
    },
    {
      title: '操作',
      align: 'center',
      scopedSlots: { customRender: 'operation' }
    }
  ]

  tableData: ITableDataItem[] = []

  tools = [
    {
      title: '新增',
      icon: 'plus',
      method: this.add
    },
    {
      title: '批量删除',
      icon: 'delete',
      method: this.batchRemove
    },
    {
      title: '确认',
      icon: 'check',
      method: this.confirm
    },
    {
      title: '关闭',
      icon: 'close',
      method: this.close
    }
  ]

  @Watch('value', { immediate: true, deep: true })
  valueChange() {
    this.initTableData()
  }

  get background() {
    if (this.value) {
      const gradientColors = Object.entries(this.value)
        .sort((a, b) => a[0] - b[0])
        .map(([percent, color]) => `${color} ${percent * 100}%`)
        .join(',')
      return `linear-gradient(to right,${gradientColors})`
    }
    return this.defaultColor
  }

  /**
   * 初始化列表数据
   */
  initTableData() {
    if (!this.value || Object.keys(this.value).some(n => isNaN(Number(n)))) {
      return
    }
    this.tableData = Object.entries(this.value).map(([percent, color]) => ({
      color,
      key: UUID.uuid(),
      percent: percent * 100
    }))
  }

  /**
   * 打开选择器
   */
  showDropdown() {
    this.dropdownVisible = true
    this.initTableData()
  }

  /**
   * 关闭选择器
   */
  hideDropdown() {
    this.dropdownVisible = false
  }

  /**
   * 关闭
   */
  close() {
    this.hideDropdown()
    this.selectChange([])
  }

  /**
   * 删除
   */
  remove(index: number) {
    this.tableData.splice(index, 1)
  }

  /**
   * 批量删除
   */
  batchRemove() {
    if (!this.selectedRowKeys.length) {
      this.$message.warning('请勾选数据')
    } else {
      this.selectedRowKeys.forEach(k =>
        this.remove(this.tableData.findIndex(({ key }) => key === k))
      )
      this.selectedRowKeys = []
    }
  }

  /**
   * 添加
   */
  add() {
    const node = {
      key: UUID.uuid(),
      color: this.defaultColor,
      percent: 0
    }
    this.tableData.push(node)
  }

  /**
   * 确认
   */
  confirm() {
    const colorObj = this.tableData.reduce<Record<string, string>>(
      (obj, { color, percent }) => {
        const _percent = `${percent / 100}`
        const key = percent % 100 === 0 ? `${_percent}.0` : _percent
        obj[key] = color
        return obj
      },
      {}
    )
    this.$emit('input', colorObj)
    this.close()
  }

  /**
   * 选择
   */
  selectChange(selectedRowKeys) {
    this.selectedRowKeys = selectedRowKeys
  }
}
</script>
<style lang="less" scoped>
.pointer {
  cursor: pointer;
  &:hover {
    color: @primary-color;
  }
}
.color-view {
  width: 88px;
  height: 32px;
  line-height: 32px;
  display: inline-block;
  vertical-align: middle;
  border-radius: @border-radius-base;
  border: 1px solid transparent;
  cursor: pointer;
}
.color-setting-table {
  /deep/ .ant-table {
    .ant-input-number {
      border: none;
      border-radius: 0;
      &-focused {
        box-shadow: none;
      }
      &-focused,
      &:hover,
      &:focus {
        border-color: @border-color-base;
      }
    }
    th {
      padding: 6px 8px;
    }
    td {
      padding: 0;
    }
  }
}
</style>
