<template>
  <div class="mp-colors-setting">
    <a-table
      bordered
      size="small"
      :pagination="false"
      :columns="tableColumns"
      :data-source="tableData"
      :scroll="{ y: 350 }"
    >
      <template slot="color" slot-scope="text, record">
        <MpColorPicker
          :color.sync="record.color"
          :disableAlpha="false"
        ></MpColorPicker>
      </template>
      <template slot="max" slot-scope="text, record, index">
        <a-input
          v-model="record.max"
          size="small"
          :min="record.min"
          :max="getMax(index)"
          :prefix="`${record.min}~`"
          @change="changeMax(record, index)"
          type="number"
        />
      </template>
      <template slot="operation" slot-scope="text, record, index">
        <a-tooltip placement="top" title="删除">
          <a-icon
            type="delete"
            class="pointer icon"
            @click="remove(index)"
          ></a-icon>
        </a-tooltip>
        <a-tooltip placement="top" title="向下插入一行">
          <a-icon type="plus" class="pointer icon" @click="add(index)"></a-icon>
        </a-tooltip>
      </template>
    </a-table>
  </div>
</template>

<script lang="ts">
import { Vue, Component, Prop, Watch } from 'vue-property-decorator'
import { UUID } from '@mapgis/web-app-framework'

interface ITableDataItem {
  color: string
  min: number
  max: number
}

@Component({ name: 'MpColorsSetting' })
export default class MpColorsSetting extends Vue {
  // [{ min: 0, max: 60, color: 'rgba(244, 67, 54, 0.5)' }...]
  @Prop() readonly value!: Record<string, string>

  @Prop({
    type: String,
    default: '角度范围'
  })
  readonly rangeField?: string

  defaultColor = 'rgb(64,169,255,0.5)'

  dropdownVisible = false

  tableColumns = [
    {
      title: '颜色',
      dataIndex: 'color',
      align: 'center',
      scopedSlots: { customRender: 'color' }
    },
    {
      title: this.rangeField,
      dataIndex: 'max',
      scopedSlots: { customRender: 'max' }
    },
    {
      title: '操作',
      align: 'center',
      scopedSlots: { customRender: 'operation' }
    }
  ]

  tableData: ITableDataItem[] = []

  emitValue = []

  @Watch('value', { immediate: true, deep: true })
  valueChange() {
    if (JSON.stringify(this.value) !== JSON.stringify(this.emitValue)) {
      this.initTableData()
    }
  }

  @Watch('tableData', { immediate: true, deep: true })
  tableDataChange() {
    this.emitValue = this.tableData.map(({ min, max, color }) => ({
      min,
      max,
      color
    }))
    this.$emit('input', this.emitValue)
  }

  /**
   * 修改选中行的最大值，后面一行的最小值同步变化
   */
  changeMax(record, index) {
    // console.log(record, index)
    if (record.max > this.tableData[index + 1].max) {
      record.max = this.tableData[index + 1].max
    }
    if (index < this.tableData.length - 1) {
      this.tableData[index + 1].min = record.max
    }
  }

  /**
   * 获取每行的可输入最大值（就是后一行的最大值）
   */
  getMax(index) {
    return index < this.tableData.length - 1
      ? this.tableData[index + 1].max
      : this.tableData[this.tableData.length - 1].max
  }

  /**
   * 初始化列表数据
   */
  initTableData() {
    if (!this.value || this.value.length === 0) {
      return
    }
    this.tableData = this.value.map(({ min, max, color }) => ({
      key: UUID.uuid(),
      min,
      max,
      color
    }))
  }

  /**
   * 删除，删除后，前一行和后一行要衔接上
   */
  remove(index: number) {
    const length = this.tableData.length
    if (index === 0) {
      this.tableData[index + 1].min = this.tableData[index].min
    } else if (index < length - 1) {
      this.tableData[index + 1].min = this.tableData[index].min
      this.tableData[index - 1].max = this.tableData[index + 1].min
    } else {
      this.tableData[index - 1].max = this.tableData[index].min
    }
    this.tableData.splice(index, 1)
  }

  /**
   * 添加，向下插入一行，把该行的最大最小值的间隔一分为二
   */
  add(index) {
    const length = this.tableData.length
    const { min, max } = this.tableData[index]
    const num = Math.ceil((max + min) / 2)
    this.tableData[index].max = num
    const node = {
      key: UUID.uuid(),
      color: this.defaultColor,
      min: num,
      max
    }
    this.tableData.splice(index + 1, 0, node)
  }
}
</script>
<style lang="less" scoped>
.mp-colors-setting {
  /deep/ .color-picker .color-container {
    padding: 5px 2px;
    height: 25px;
    border: 0px solid #d9d9d9;
    border-radius: 0px;
  }
  /deep/ .ant-table {
    font-size: 12px;
    width: 260px;
  }

  /deep/ .ant-input-affix-wrapper .ant-input-prefix {
    font-size: 12px;
    left: 3px;
  }

  /deep/ .ant-input {
    font-size: 12px;
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

  /deep/ .ant-tooltip {
    font-size: 12px;
  }

  /deep/ th {
    padding: 6px 8px !important;
  }

  /deep/ td {
    padding: 0 !important;
  }

  .icon {
    margin: 0 8px;
    &:hover {
      color: @primary-color;
    }
  }
}
</style>
