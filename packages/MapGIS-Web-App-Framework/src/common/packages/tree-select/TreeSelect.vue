<template>
  <a-dropdown
    v-model="dropdownVisible"
    :trigger="['click']"
    class="mp-tree-select"
  >
    <a-input
      @blur="onBlur"
      @change="onValueChange"
      :value="selectedValue"
      :placeholder="placeholder"
      :size="size"
      :allow-clear="true"
    >
      <a-icon
        slot="suffix"
        :class="{ rotate180: dropdownVisible }"
        class="mp-tree-select-arrow"
        type="down"
      />
    </a-input>
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
<script lang="ts">
import { Vue, Component, Prop, Watch } from 'vue-property-decorator'
import _cloneDeep from 'lodash/cloneDeep'

type Size = 'large' | 'default' | 'small'

@Component
export default class MpTreeSelect extends Vue {
  @Prop({ default: '' }) readonly value!: string

  @Prop({ default: 'default' }) readonly size!: Size

  @Prop({ default: '请输入或选择' }) readonly placeholder!: string

  @Prop({ default: () => [] }) readonly treeData!: Array<unknown>

  @Prop({ type: Function }) readonly loadData!: (node: unknown) => void

  @Prop({ default: () => ({}) }) readonly replaceFields!: object

  @Prop({ default: 'title' }) readonly filterProp!: string

  @Prop({ default: 'title' }) readonly labelProp!: string

  @Prop({ default: false }) readonly loading!: boolean

  @Prop({ default: true }) readonly showLine!: boolean

  @Prop({ default: false }) readonly defaultExpandAll!: boolean

  dropdownVisible = false

  selectedValue = ''

  selectedKeys: Array<string> = []

  loadedKeys: Array<string> = []

  get formatReplaceFields() {
    return {
      children: 'children',
      title: 'title',
      key: 'key',
      ...this.replaceFields
    }
  }

  get nodeKey() {
    return this.formatReplaceFields.key
  }

  get nodeTitle() {
    return this.formatReplaceFields.title
  }

  get nodeChildren() {
    return this.formatReplaceFields.children
  }

  get selfLabelProp() {
    return this.labelProp || this.nodeTitle
  }

  get selfFilterProp() {
    return this.filterProp || this.nodeTitle
  }

  /**
   * 按需高亮节点
   */
  filterTreeNode({ dataRef }) {
    return (
      this.selectedValue &&
      dataRef[this.selfFilterProp] &&
      dataRef[this.selfFilterProp].includes(this.selectedValue)
    )
  }

  /**
   * 派发事件
   */
  dispatchChange(title, key) {
    this.$emit('update:value', title, key)
    this.$emit('change', title, key)
    this.$emit('input', title, key)
  }

  /**
   * 输入的值变化
   */
  onValueChange(e) {
    this.selectedValue = e.target.value.trim()
    if (!this.selectedValue) {
      this.selectedKeys = []
    }
    this.dispatchChange(this.selectedValue)
  }

  /**
   * 节点选中
   */
  onTreeSelect(selectedKeys: Array<string>, { node: { dataRef } }) {
    this.selectedKeys = selectedKeys
    this.selectedValue = dataRef[this.selfLabelProp]
    this.dispatchChange(this.selectedValue, this.selectedKeys[0])
  }

  /**
   * 节点加载完毕
   */
  onTreeLoad(loadedKeys) {
    this.loadedKeys = loadedKeys
  }

  /**
   * 失焦事件
   */
  onBlur(e) {
    if (!this.dropdownVisible) {
      this.$emit('blur', e)
    }
  }

  /**
   * 根据输入的值回显选中的节点
   */
  getSelectedKeysByValue(tree: Array<unknown>, value: string) {
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
  }

  /**
   * 回显输入框值和选中的key
   */
  initSelected(value) {
    if (this.selectedValue !== value) {
      this.selectedValue = value
      this.getSelectedKeysByValue(this.treeData, value)
    }
  }

  /**
   * 监听： 值变化
   */
  @Watch('value')
  valueChanged(nV) {
    this.initSelected(nV)
  }

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
