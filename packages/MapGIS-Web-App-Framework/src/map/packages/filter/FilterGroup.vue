<template>
  <div class="mp-filter-group">
    <a-row type="flex" align="middle">
      <a-col flex="1 1 0%">
        <a-radio-group v-model="tempOper">
          <a-radio value="AND">
            匹配所有表达式
          </a-radio>
          <a-radio value="OR">
            匹配任意表达式
          </a-radio>
        </a-radio-group>
      </a-col>
      <a-button type="link" @click="handleClose" size="small">
        <a-icon type="close" class="group-delete" />
      </a-button>
      <a-button type="link" @click="handleAdd" size="small">
        <a-icon type="plus" class="group-add" />
      </a-button>
    </a-row>
    <filter-item
      v-for="({ id }, index) in tempFilterItems"
      :key="id"
      :queryParams="queryParams"
      style="padding:5px 0"
      @close="handleDel(index)"
      @change="
        val => {
          updateFilterItems(val, index)
        }
      "
    />
  </div>
</template>

<script>
import FilterItem from './FilterItem.vue'

export default {
  name: 'FilterGroup',
  components: { FilterItem },
  props: {
    // 传入查询参数信息，用于查询字段及字段值
    queryParams: {
      type: Object,
      required: true
    },
    filterItems: {
      type: Array,
      default: () => [
        { id: Math.random().toString(), where: '' },
        { id: Math.random().toString(), where: '' }
      ]
    },
    oper: {
      type: String,
      default: 'AND'
    }
  },
  computed: {
    tempFilterItems: {
      get() {
        return this.filterItems
      },
      set(value) {
        this.$emit('update:filterItems', value)
      }
    },
    tempOper: {
      get() {
        return this.oper
      },
      set(value) {
        this.$emit('update:oper', value)
      }
    }
  },
  methods: {
    // 添加条件项
    handleAdd() {
      this.tempFilterItems.push({ id: Math.random().toString(), where: '' })
    },
    // 删除条件项, 删除最后一条之后提交删除分组事件
    handleDel(index) {
      this.tempFilterItems.splice(index, 1)
    },
    updateFilterItems(val, index) {
      // 这样处理，vue才能监听到filterItems的更新
      const item = this.tempFilterItems[index]
      this.$set(this.tempFilterItems, index, { ...item, where: val })
    },
    // 提交删除分组事件
    handleClose() {
      this.$emit('close')
    }
  }
}
</script>

<style lang="less">
.mp-filter-group {
  border-bottom: 1px solid @border-color-base;
  .group-delete {
    color: @error-color;
  }
  .group-add {
    color: @primary-color;
  }
}
</style>
