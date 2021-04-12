<template>
  <div class="filter-group">
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
      <a-button type="link" @click="close">
        <a-icon type="close" :style="{ fontSize: '20px', color: '#ff4d4f' }" />
      </a-button>
      <a-button type="link" @click="handleAdd">
        <a-icon type="plus" :style="{ fontSize: '20px' }" />
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

<script lang="ts">
import {
  Vue,
  Component,
  Prop,
  PropSync,
  Model,
  Watch,
  Emit
} from 'vue-property-decorator'
import FilterItem, { SelectOptionItem } from './FilterItem.vue'

@Component({
  components: { FilterItem }
})
export default class FilterGroup extends Vue {
  // 传入查询参数信息，用于查询字段及字段值
  @Prop(Object) readonly queryParams!: Record<string, any>

  @PropSync('filterItems', {
    type: Array,
    default: () => [
      { id: Math.random().toString(), where: '' },
      { id: Math.random().toString(), where: '' }
    ]
  })
  tempFilterItems!: { id: string; where: string }[]

  // 传入字段信息
  @Prop(String) readonly oper!: { id: string; where: string }[]

  @PropSync('oper', {
    type: String,
    default: 'AND'
  })
  tempOper!: string

  // 添加条件项
  private handleAdd() {
    this.tempFilterItems.push({ id: Math.random().toString(), where: '' })
  }

  // 删除条件项, 删除最后一条之后提交删除分组事件
  private handleDel(index: number) {
    this.tempFilterItems.splice(index, 1)
  }

  private updateFilterItems(val, index) {
    // 这样处理，vue才能监听到filterItems的更新
    const item = this.tempFilterItems[index]
    this.$set(this.tempFilterItems, index, { ...item, where: val })
  }

  // 提交删除分组事件
  @Emit()
  private close() {}
}
</script>

<style lang="less">
@import '~ant-design-vue/lib/style/themes/default.less';
.filter-group {
  border-bottom: 1px solid @border-color-base;
}

.btn {
  font-size: 30px;
}
</style>
