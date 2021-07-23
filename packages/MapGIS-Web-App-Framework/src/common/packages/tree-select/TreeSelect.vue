<template>
  <a-dropdown
    v-model="dropdownVisible"
    :trigger="['click']"
    class="mp-tree-select"
  >
    <slot>
      <a-input
        @change="onValueChange"
        :value="selectedValue"
        :placeholder="placeholder"
        :size="size"
        :allow-clear="true"
        :title="selectedValue"
      >
        <a-icon
          slot="suffix"
          :class="{ rotate180: dropdownVisible }"
          class="mp-tree-select-arrow"
          type="down"
        />
      </a-input>
    </slot>
    <div slot="overlay" class="mp-tree-select-dropdown">
      <a-spin :spinning="loading">
        <a-empty class="mp-tree-select-empty" v-if="!treeData.length" />
        <a-tree
          v-else
          @load="onTreeLoad"
          @select="onTreeSelect"
          :selected-keys="selectedKeys"
          :loaded-keys="loadedKeys"
          :tree-data="treeData"
          :load-data="loadData"
          :filter-tree-node="filterTreeNode"
          :show-line="showLine"
          :default-expand-all="defaultExpandAll"
          :replace-fields="formatReplaceFields"
        />
      </a-spin>
    </div>
  </a-dropdown>
</template>
<script>
import _cloneDeep from 'lodash/cloneDeep'

export default {
  name: 'MpTreeSelect',
  props: {
    value: {
      type: String,
      default: ''
    },
    treeData: {
      type: Array,
      default: () => []
    },
    loadData: {
      type: Function
    },
    replaceFields: {
      type: Object,
      default: () => ({})
    },
    filterProp: {
      type: String,
      default: 'title'
    },
    labelProp: {
      type: String,
      default: 'title'
    },
    loading: {
      type: Boolean,
      default: false
    },
    size: {
      type: String,
      default: 'default',
      validator(v) {
        return ['large', 'default', 'small'].includes(v)
      }
    },
    placeholder: {
      type: String,
      default: '请输入或选择'
    },
    showLine: {
      type: Boolean,
      default: true
    },
    defaultExpandAll: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      dropdownVisible: false,
      selectedValue: '',
      selectedKeys: [],
      loadedKeys: []
    }
  },
  computed: {
    formatReplaceFields({ replaceFields }) {
      return {
        children: 'children',
        title: 'title',
        key: 'key',
        ...replaceFields
      }
    },
    nodeKey({ formatReplaceFields }) {
      return formatReplaceFields.key
    },
    nodeTitle({ formatReplaceFields }) {
      return formatReplaceFields.title
    },
    nodeChildren({ formatReplaceFields }) {
      return formatReplaceFields.children
    },
    selfLabelProp({ labelProp, nodeTitle }) {
      return labelProp || nodeTitle
    },
    selfFilterProp({ filterProp, nodeTitle }) {
      return filterProp || nodeTitle
    }
  },
  watch: {
    value(nV) {
      this.initSelected(nV)
    }
  },
  methods: {
    /**
     * 按需高亮节点
     */
    filterTreeNode({ dataRef }) {
      return (
        this.selectedValue &&
        dataRef[this.selfFilterProp] &&
        dataRef[this.selfFilterProp].includes(this.selectedValue)
      )
    },
    /**
     * 派发事件
     */
    dispatchChange(title, key) {
      this.$emit('update:value', title, key)
      this.$emit('change', title, key)
      this.$emit('input', title, key)
    },

    /**
     * 输入的值变化
     */
    onValueChange(e) {
      this.selectedValue = e.target.value
      this.dispatchChange(this.selectedValue)
    },

    /**
     * 节点选中
     */
    onTreeSelect(selectedKeys, { node: { dataRef } }) {
      this.selectedKeys = selectedKeys
      this.selectedValue = dataRef[this.selfLabelProp]
      this.dropdownVisible = false
      this.dispatchChange(this.selectedValue, this.selectedKeys[0])
    },

    /**
     * 节点加载完毕
     */
    onTreeLoad(loadedKeys) {
      this.loadedKeys = loadedKeys
    },

    /**
     * 根据输入的值回显选中的节点
     */
    getSelectedKeysByValue(tree, value) {
      for (let i = 0; i < tree.length; i++) {
        const node = tree[i]
        const prop = node[this.selfLabelProp]
        const children = node[this.nodeChildren]
        if (prop && prop.includes(value)) {
          this.selectedKeys.push(node[this.nodeKey])
          break
        } else if (children && children.length) {
          this.getSelectedKeysByValue(children, value)
        }
      }
    },

    /**
     * 回显输入框值和选中的key
     */
    initSelected(value) {
      if (this.selectedValue !== value) {
        this.selectedValue = value
        this.getSelectedKeysByValue(this.treeData, value)
      }
    }
  },
  created() {
    this.initSelected(this.value)
  }
}
</script>
<style lang="less" scoped>
.mp-tree-select {
  &-arrow {
    color: #c7c7c7;
    font-size: 12px;
    transition: transform 0.3s;
    cursor: pointer;
    &.rotate180 {
      transform: rotate(180deg);
    }
  }
  &-empty {
    padding: 12px 0;
  }
  &-dropdown {
    max-height: 320px;
    overflow-y: auto;
    padding: 2px 8px;
    background: @white;
    box-shadow: @box-shadow-base;
  }
}
</style>
