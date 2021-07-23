<template>
  <div class="attribute-table">
    <mp-row-flex label="开启表格展示" label-align="right" :span="[6, 18]">
      <a-radio-group v-model="isShow">
        <a-radio :value="true">是</a-radio>
        <a-radio :value="false">否</a-radio>
      </a-radio-group>
    </mp-row-flex>
    <transition name="fade">
      <template v-if="isShow">
        <a-table
          row-key="id"
          :columns="tableColumns"
          :data-source="tableData"
          :scroll="{ y: 250 }"
          bordered
        >
          <template slot="field" slot-scope="text, record">
            <a-select v-model="record.field" :options="fieldList" />
          </template>
          <template slot="alias" slot-scope="text, record">
            <a-input v-model="record.alias" /> </template
        ></a-table>
      </template>
    </transition>
  </div>
</template>
<script lang="ts">
import { Vue, Component } from 'vue-property-decorator'

@Component
export default class AttributeTable extends Vue {
  isShow = false

  fieldList = []

  tableColumns = [
    {
      title: '字段',
      dataIndex: 'field',
      scopedSlots: { customRender: 'field' }
    },
    {
      title: '别名',
      dataIndex: 'alias',
      scopedSlots: { customRender: 'alias' }
    }
  ]

  tableData = []
}
</script>
<style lang="less" scoped></style>
