<template>
  <div class="base-items">
    <!-- 专题名称 -->
    <mp-row-flex label="专题名称">
      <a-dropdown v-model="dropdownVisible" :trigger="['click']">
        <span
          class="ant-input-affix-wrapper pointer"
          @click.stop="showDropdown"
        >
          <span class="ant-input">
            <span v-if="subjectNameNode.title">{{
              subjectNameNode.title
            }}</span>
            <span v-else class="placeholder">请选择</span>
          </span>
          <span
            class="ant-select-arrow"
            :class="{ rotate180: dropdownVisible }"
          >
            <a-icon type="down" class="ant-select-arrow-icon" />
          </span>
        </span>
        <div class="dropdown-content" slot="overlay">
          <a-tree
            @select="treeSelected"
            :show-line="true"
            :tree-data="thematicMapTree"
            :replace-fields="{ key: 'id' }"
          />
        </div>
      </a-dropdown>
    </mp-row-flex>
    <!-- 专题图类型 -->
    <mp-row-flex label="专题图类型">
      <a-select
        @change="subjectTypeChange"
        :value="subjectType"
        :options="subjectTypeList"
        placeholder="请选择"
      />
    </mp-row-flex>
    <!-- 专题图名称 -->
    <mp-row-flex label="专题图名称">
      <a-input v-model="subjectTitle" placeholder="请输入专题图名称" />
    </mp-row-flex>
  </div>
</template>
<script lang="ts">
import { Vue, Component, Watch } from 'vue-property-decorator'
import { UUID } from '@mapgis/web-app-framework'
import _cloneDeep from 'lodash/cloneDeep'
import { mapGetters, subjectTypeList } from '../../../../store'

@Component({
  computed: {
    ...mapGetters(['subjectConfig'])
  }
})
export default class BaseItems extends Vue {
  dropdownVisible = false

  // 专题名称
  subjectNameNode = {
    id: '',
    title: ''
  }

  // 专题图类型
  subjectType = ''

  // 专题图类型列表
  subjectTypeList = subjectTypeList

  // 专题图名称
  subjectTitle = ''

  // 专题服务树
  thematicMapTree = []

  /**
   * 监听专题配置变化
   */
  @Watch('subjectConfig', { immediate: true, deep: true })
  subjectConfigChange(nV) {
    this.setSubjectMapTree(nV)
  }

  showDropdown() {
    this.dropdownVisible = true
  }

  hideDropdown() {
    this.dropdownVisible = false
  }

  /**
   * 格式化专题服务树
   * @param tree
   */
  normalizeTreeData(tree: any[]) {
    return tree.map(node => {
      this.$set(node, 'selectable', false)
      if (node.nodeType === 'list') {
        this.$set(node, 'selectable', true)
        this.$set(node, 'children', [])
      } else if (node.children && node.children.length) {
        this.normalizeTreeData(node.children)
      }
      return node
    })
  }

  /**
   * 设置专题服务树
   * @param tree
   */
  setSubjectMapTree(tree: any[]) {
    this.thematicMapTree = this.normalizeTreeData(_cloneDeep(tree))
  }

  /**
   * 专题分类变化
   */
  treeSelected(selectedKeys: string[], { node }: any) {
    this.subjectNameNode = node.dataRef
    this.hideDropdown()
  }

  /**
   * 专题图类型选择变化
   */
  subjectTypeChange(value: string) {
    this.subjectType = value
    this.subjectTitle = ''
    this.$emit('type-change', value)
  }

  /**
   * 获取专题图基础配置
   * @param 专题图年度配置集合
   */
  getConfig(subjectConfig = []) {
    const {
      subjectNameNode: { id: parentId },
      subjectType,
      subjectTitle
    } = this
    const subjectNode = {
      id: `${subjectType}-${UUID.uuid()}`,
      visible: true,
      nodeType: 'subject',
      type: subjectType,
      title: subjectTitle,
      config: subjectConfig
    }
    return [parentId, subjectNode]
  }
}
</script>
<style lang="less" scoped>
.placeholder {
  color: #c4c4c4;
}

.ant-input-affix-wrapper {
  cursor: pointer;
  &:focus {
    box-shadow: 0 0 0 2px rgb(24, 144, 255, 0.2);
  }
}

.ant-select-arrow {
  transition: transform 0.3s;
  &.rotate180 {
    transform: rotate(180deg);
  }
}

.dropdown-content {
  max-height: 320px;
  overflow-y: auto;
  padding: 8px 12px;
  background: @white;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
}
</style>
