<template>
  <div class="popup">
    <a-empty :image-style="{ height: '50px' }" v-if="!visible">
      <span
        slot="description"
        @click="showConfigPanel"
        class="popup-description"
      >
        点击开始配置
      </span>
    </a-empty>
    <template v-else>
      <mp-row-flex label="显示字段" label-align="right">
        <a-select
          v-model="displayField"
          mode="tags"
          :options="displayFieldList"
        />
      </mp-row-flex>
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
import { Vue, Component, Prop } from 'vue-property-decorator'
import { NewSubjectConfig } from '../../../../../store'

@Component
export default class Popup extends Vue {
  @Prop({ default: () => ({}) }) readonly subjectConfig!: NewSubjectConfig

  visible = false

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

  showConfigPanel() {
    this.visible = true
  }
}
</script>
<style lang="less" scoped>
.popup {
  &-description {
    color: @primary-color;
    cursor: pointer;
    font-size: 12px;
    &:hover {
      text-decoration: underline;
    }
  }
}
</style>
