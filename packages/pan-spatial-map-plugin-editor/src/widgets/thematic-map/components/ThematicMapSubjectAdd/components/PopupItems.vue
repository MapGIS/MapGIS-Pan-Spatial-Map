<template>
  <div class="popup-items">
    <a-row type="flex" align="middle">
      <a-checkbox @change="onPopupChange">
        弹出框设置
      </a-checkbox>
    </a-row>
    <template v-if="showPopup">
      <row-flex label="显示字段" label-align="right">
        <a-select
          v-model="displayField"
          mode="tags"
          :options="displayFieldList"
        />
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
import { Vue, Component } from 'vue-property-decorator'
import RowFlex from '../../RowFlex'

@Component({
  components: {
    RowFlex
  }
})
export default class PopupItems extends Vue {
  showPopup = false

  displayField = []

  displayFieldList = []

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

  onPopupChange(e) {
    this.showPopup = e.target.checked
  }
}
</script>
<style lang="less" scoped></style>
