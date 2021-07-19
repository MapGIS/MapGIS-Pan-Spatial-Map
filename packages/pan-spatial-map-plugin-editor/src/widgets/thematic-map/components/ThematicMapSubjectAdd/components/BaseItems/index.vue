<template>
  <div class="base-items">
    <!-- 专题名称 -->
    <mp-row-flex label="专题名称">
      <a-dropdown v-model="thematicMapTreeVisible" :trigger="['click']">
        <span
          class="ant-input-affix-wrapper pointer"
          @click.stop="thematicMapTreeShow"
        >
          <span class="ant-input">
            <span v-if="baseItemsObj.parentTitle">{{
              baseItemsObj.parentTitle
            }}</span>
            <span v-else class="placeholder">请选择</span>
          </span>
          <span
            class="ant-select-arrow"
            :class="{ rotate180: thematicMapTreeVisible }"
          >
            <a-icon type="down" class="ant-select-arrow-icon" />
          </span>
        </span>
        <div class="dropdown-content" slot="overlay">
          <a-tree
            @select="thematicMapTreeSelected"
            :selected-keys="selectedThematicMapKeys"
            :show-line="true"
            :tree-data="thematicMapTree"
            :replace-fields="{ key: 'id' }"
          />
        </div>
      </a-dropdown>
    </mp-row-flex>
    <!-- 专题图名称 -->
    <mp-row-flex label="专题图名称">
      <a-input
        @change="subjectTitleChange"
        :value="baseItemsObj.title"
        placeholder="请输入专题图名称"
      />
    </mp-row-flex>
    <!-- 专题图类型 -->
    <mp-row-flex label="专题图类型">
      <a-select
        @change="subjectTypeChange"
        :options="subjectTypeList"
        :value="baseItemsObj.type"
        placeholder="请选择"
      />
    </mp-row-flex>
  </div>
</template>
<script lang="ts">
import { Vue, Component, Watch, Prop } from 'vue-property-decorator'
import { UUID } from '@mapgis/web-app-framework'
import _cloneDeep from 'lodash/cloneDeep'
import {
  mapGetters,
  subjectTypeList,
  SubjectType,
  NewSubjectConfig,
  ThematicMapSubjectConfigNode
} from '../../../../store'

@Component({
  computed: {
    ...mapGetters(['subjectConfig'])
  }
})
export default class BaseItems extends Vue {
  @Prop({ default: () => ({}) }) readonly value!: NewSubjectConfig

  // 专题类型列表
  subjectTypeList = subjectTypeList

  // 专题图树展示开关
  thematicMapTreeVisible = false

  // 专题图树
  thematicMapTree: Array<ThematicMapSubjectConfigNode> = []

  // 选中的专题图树节点key
  selectedThematicMapKeys: string[] = []

  // 专题节点公共的基础数据
  get baseItemsObj() {
    return { ...this.value }
  }

  set baseItemsObj(nV) {
    this.$emit('input', {
      id: `thematic-map-${UUID.uuid()}`,
      visible: true,
      nodeType: 'subject',
      ...nV
    })
  }

  /**
   * 展示专题目录树
   */
  thematicMapTreeShow() {
    this.thematicMapTreeVisible = true
  }

  /**
   * 隐藏专题目录树
   */
  thematicMapTreeHide() {
    this.thematicMapTreeVisible = false
  }

  /**
   * 专题图节点选择变化
   */
  thematicMapTreeSelected(selectedKeys: string[], { node: { dataRef } }: any) {
    this.selectedThematicMapKeys = selectedKeys
    this.baseItemsObj = {
      ...this.baseItemsObj,
      parentId: dataRef.id,
      parentTitle: dataRef.title
    }
    this.thematicMapTreeHide()
  }

  /**
   * 专题类型选择变化
   */
  subjectTypeChange(type: SubjectType) {
    this.baseItemsObj = {
      ...this.baseItemsObj,
      type
    }
  }

  /**
   * 专题名称变化
   */
  subjectTitleChange(e) {
    this.baseItemsObj = {
      ...this.baseItemsObj,
      title: e.target.value
    }
  }

  /**
   * 格式化专题图树
   * @param tree
   */
  normalizeThematicMapTree(tree: Array<ThematicMapSubjectConfigNode>) {
    if (!tree.length) return []
    return tree.map(node => {
      this.$set(node, 'selectable', false)
      if (node.nodeType === 'list') {
        this.$set(node, 'selectable', true)
        this.$set(node, 'children', [])
      } else if (node.children && node.children.length) {
        this.normalizeThematicMapTree(node.children)
      }
      return node
    })
  }

  /**
   * 设置专题图树
   * @param tree
   */
  setThematicMapTree(tree: Array<ThematicMapSubjectConfigNode>) {
    this.thematicMapTree = this.normalizeThematicMapTree(_cloneDeep(tree))
  }

  /**
   * 监听: 专题配置变化
   */
  @Watch('value.parentId')
  parentIdChanged(nV) {
    this.selectedThematicMapKeys = [nV]
  }

  /**
   * 监听: 专题配置变化
   */
  @Watch('subjectConfig', { deep: true })
  subjectConfigChanged(nV) {
    this.setThematicMapTree(nV)
  }

  created() {
    this.selectedThematicMapKeys = [this.value.parentId]
    this.setThematicMapTree(this.subjectConfig)
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
    box-shadow: @box-shadow-base;
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
  padding: 2px 8px;
  background: @white;
  box-shadow: @box-shadow-base;
}
</style>
