<template>
  <div class="mp-attribute-table-column-setting" ref="root">
    <a-popover
      v-model="visible"
      placement="bottomRight"
      trigger="click"
      :get-popup-container="() => $refs.root"
    >
      <div slot="title">
        <a-checkbox
          :indeterminate="indeterminate"
          :checked="checkAll"
          @change="onCheckAllChange"
          class="check-all"
        />列展示
        <a-button
          @click="resetColumns"
          style="float: right"
          type="link"
          size="small"
          >重置</a-button
        >
      </div>
      <div
        style="overflow-y: auto; max-height: 180px;"
        class="beauty-scroll"
        slot="content"
      >
        <a-list
          style="width: 100%"
          size="small"
          :key="i"
          v-for="(col, i) in columns"
        >
          <a-list-item class="column-item">
            <a-checkbox
              v-model="col.visible"
              @change="e => onCheckChange(e, col)"
            />
            <template v-if="col.title"> {{ col.title }}</template>
            <slot
              v-else-if="col.slots && col.slots.title"
              :name="col.slots.title"
            ></slot>
          </a-list-item>
        </a-list>
      </div>
      <mp-toolbar-command title="列配置" icon="setting" />
    </a-popover>
  </div>
</template>

<script>
import cloneDeep from 'lodash.clonedeep'

export default {
  name: 'MpAttributeTableColumnSetting',
  props: ['columns'],
  data() {
    return {
      visible: false,
      indeterminate: false,
      checkAll: true,
      checkedCounts: this.columns.length,
      backColumns: cloneDeep(this.columns)
    }
  },
  watch: {
    checkedCounts(val) {
      this.checkAll = val === this.columns.length
      this.indeterminate = val > 0 && val < this.columns.length
    },
    columns(newVal, oldVal) {
      if (newVal != oldVal) {
        this.checkedCounts = newVal.length
        this.formatColumns(newVal)
      }
    }
  },
  created() {
    this.formatColumns(this.columns)
  },
  methods: {
    onCheckChange(e, col) {
      if (!col.visible) {
        this.checkedCounts -= 1
      } else {
        this.checkedCounts += 1
      }
    },
    resetColumns() {
      const { columns, backColumns } = this
      let counts = columns.length
      backColumns.forEach((back, index) => {
        const column = columns[index]
        column.visible = back.visible === undefined || back.visible
        if (!column.visible) {
          counts -= 1
        }
      })
      this.checkedCounts = counts
      this.visible = false
      this.$emit('reset')
    },
    onCheckAllChange(e) {
      if (e.target.checked) {
        this.checkedCounts = this.columns.length
        this.columns.forEach(col => (col.visible = true))
      } else {
        this.checkedCounts = 0
        this.columns.forEach(col => (col.visible = false))
      }
    },
    formatColumns(columns) {
      for (const col of columns) {
        if (col.visible === undefined) {
          this.$set(col, 'visible', true)
        }
        if (!col.visible) {
          this.checkedCounts -= 1
        }
      }
    }
  }
}
</script>

<style scoped lang="less">
.mp-attribute-table-column-setting {
  display: inline-block;
  .check-all {
    margin-right: 8px;
  }
  .left,
  .right {
    transform: rotate(-90deg);
  }
  .active {
    color: @primary-color;
  }
  .ant-list-item.column-item {
    padding: 4px 0;
  }
}
</style>
