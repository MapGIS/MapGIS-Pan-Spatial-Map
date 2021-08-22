<template>
  <div class="mp-filter">
    <a-row class="filter-toolbar" type="flex" align="middle">
      <a-button type="link" icon="plus" @click="handleAddFilter" size="small">
        添加表达式
      </a-button>
      <a-button type="link" icon="plus" @click="handleAddGroup" size="small">
        添加集合
      </a-button>
      <a-col flex="auto">
        <a-radio-group
          v-if="
            showGroupOptions ||
              (filterItems.length > 0 && filterGroups.length > 0)
          "
          v-model="oper"
          size="small"
        >
          <a-radio value="AND">
            匹配所有表达式
          </a-radio>
          <a-radio value="OR">
            匹配任意表达式
          </a-radio>
        </a-radio-group>
      </a-col>
    </a-row>
    <div class="filter-content">
      <div :class="{ 'filter-items': filterItems.length > 0 }">
        <a-radio-group
          v-if="filterItems.length > 1"
          v-model="itemsOper"
          style="margin:5px 0"
        >
          <a-radio value="AND">
            匹配所有表达式
          </a-radio>
          <a-radio value="OR">
            匹配任意表达式
          </a-radio>
        </a-radio-group>
        <filter-item
          style="padding:5px 0"
          v-for="({ id }, index) in filterItems"
          :key="id"
          :queryParams="queryParams"
          @change="
            val => {
              updateFilterItems(val, index)
            }
          "
          @close="handleDel(index)"
        />
      </div>
      <filter-group
        v-for="(item, index) in filterGroups"
        :key="item.id"
        :queryParams="queryParams"
        :filterItems.sync="item.filterItems"
        :oper.sync="item.oper"
        @close="handleDelGroup(index)"
      />
    </div>
    <a-space direction="vertical" class="filter-sql">
      <div>SQL表达式</div>
      <a-textarea v-model="where" :auto-size="{ minRows: 3, maxRows: 3 }" />
    </a-space>
    <a-space class="filter-btn">
      <a-button type="primary" @click="handleOK">
        应用
      </a-button>
      <a-button
        :disabled="where.length == 0"
        type="primary"
        @click="where = ''"
      >
        重置
      </a-button>
    </a-space>
  </div>
</template>

<script>
import FilterGroup from './FilterGroup.vue'
import FilterItem from './FilterItem.vue'

export default {
  name: 'MpFilter',
  components: { FilterGroup, FilterItem },
  props: {
    queryParams: {
      type: Object,
      required: true
    }
  },
  data() {
    return {
      // {id: string, oper: 'AND', filterItems: { id: string; where: string }[]}[]
      filterGroups: [],
      // 所有的条件项
      filterItems: [{ id: Math.random().toString(), where: '' }],
      oper: 'AND',
      itemsOper: 'AND',
      where: ''
    }
  },
  computed: {
    showGroupOptions() {
      return this.filterGroups.length > 1
    }
  },
  watch: {
    oper: {
      immediate: true,
      deep: true,
      handler() {
        this.changeFilterItems()
      }
    },
    itemsOper: {
      immediate: true,
      deep: true,
      handler() {
        this.changeFilterItems()
      }
    },
    filterItems: {
      immediate: true,
      deep: true,
      handler() {
        this.changeFilterItems()
      }
    },
    filterGroups: {
      immediate: true,
      deep: true,
      handler() {
        this.changeFilterItems()
      }
    }
  },
  methods: {
    changeFilterItems() {
      const itemsLength = this.filterItems.length
      const groupsLength = this.filterGroups.length

      let itemsStr = ''
      itemsStr = this.getFilterItemsStr(this.filterItems, this.itemsOper)

      let groupStr = ''
      if (groupsLength === 1) {
        groupStr = this.getFilterItemsStr(
          this.filterGroups[0].filterItems,
          this.filterGroups[0].oper
        )
      } else if (groupsLength > 1) {
        const self = this
        groupStr = this.filterGroups
          .map(x => {
            return self.getFilterItemsStr(x.filterItems, x.oper)
          })
          .join(` ${this.oper} `)
      }
      if (itemsStr !== '' && groupStr !== '') {
        this.where = [itemsStr, groupStr].join(` ${this.oper} `)
      } else if (itemsStr !== '' && groupStr === '') {
        this.where = itemsStr
      } else if (itemsStr === '' && groupStr !== '') {
        this.where = groupStr
      }
    },
    getFilterItemsStr(filterItems, oper) {
      const itemsLength = filterItems.length
      let itemsStr = ''
      if (itemsLength === 1) {
        itemsStr = filterItems[0].where
      } else if (itemsLength > 0) {
        itemsStr = filterItems
          .map(x => x.where)
          .filter(x => !!x)
          .join(` ${oper} `)
      }
      return itemsStr
    },
    handleAddGroup() {
      const obj = [
        {
          id: Math.random().toString(),
          where: ''
        },
        {
          id: Math.random().toString(),
          where: ''
        }
      ]
      this.filterGroups.push({
        id: Math.random().toString(),
        oper: 'AND',
        filterItems: obj
      })
    },
    handleAddFilter() {
      this.filterItems.push({
        id: Math.random().toString(),
        where: ''
      })
    },
    handleDelGroup(index) {
      this.filterGroups.splice(index, 1)
    },
    // 删除条件项, 删除最后一条之后提交删除分组事件
    phandleDel(index) {
      this.filterItems.splice(index, 1)
    },
    handleOK() {
      this.$emit('finish', this.where)
    },
    updateFilterItems(val, index) {
      // 这样处理，vue才能监听到filterItems的更新
      const item = this.filterItems[index]
      this.$set(this.filterItems, index, { ...item, where: val })
    }
  }
}
</script>

<style lang="less" scoped>
.mp-filter {
  // 容器
  height: 100%;
  padding: 0 5px;
  width: 100%;
  display: flex;
  flex-direction: column;
  .filter-toolbar {
    // 顶部工具条
    border-bottom: 1px solid @border-color-base;
    padding-bottom: 5px;
  }
  .filter-content {
    flex: 1;
    overflow-y: auto;
    .filter-items {
      border-bottom: 1px solid @border-color-base;
    }
  }
  .filter-sql {
    // sql语句
    border-top: 1px solid @border-color-base;
    padding: 5px 0;
    textarea {
      resize: none;
      height: 60px;
    }
  }
  .filter-btn {
    display: flex;
    justify-content: flex-end;
  }
}
</style>
