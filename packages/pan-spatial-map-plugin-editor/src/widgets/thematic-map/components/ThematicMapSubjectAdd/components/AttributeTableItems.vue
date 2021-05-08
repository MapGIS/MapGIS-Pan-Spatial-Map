<template>
  <div class="attribute-table-items">
    <a-row type="flex" align="middle">
      <a-checkbox @change="onAttributeTableChange">
        开启表格展示
      </a-checkbox>
    </a-row>
    <template v-if="showAttributeTable">
      <row-flex label="表格字段" label-align="right">
        <a-select v-model="tableField" mode="tags" :options="tableFieldList" />
      </row-flex>
      <a-table
        row-key="id"
        :loading="tableLoading"
        :columns="tableColumns"
        :data-source="tableData"
        :scroll="{ y: 250 }"
      />
    </template>
  </div>
</template>
<script lang="ts">
import { Mixins, Component } from 'vue-property-decorator'
import { WidgetMixin } from '@mapgis/web-app-framework'
import RowFlex from '../../RowFlex'

@Component({
  components: {
    RowFlex
  }
})
export default class AttributeTableItem extends Mixins<{
  [k: string]: any
}>(WidgetMixin) {
  showAttributeTable = false

  tableField = []

  tableFieldList = []

  tableLoading = false

  tableColumns = [
    {
      title: '字段名',
      dataIndex: 'key'
    },
    {
      title: '别名',
      dataIndex: 'val'
    }
  ]

  tableData = []

  onAttributeTableChange(e) {
    this.showAttributeTable = e.target.checked
  }
}
</script>
<style lang="less" scoped></style>
