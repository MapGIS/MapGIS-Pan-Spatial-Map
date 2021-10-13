<template>
  <div class="base-items">
    <!-- 专题名称 -->
    <mp-row-flex :label-width="84" label="专题分类">
      <mp-tree-select
        @change="subjectClassifyChange"
        :value="subjectClassify"
        :tree-data="thematicMapTree"
        :replace-fields="{ key: 'id' }"
        :default-expand-all="true"
        description="输入内容可自动创建专题分类"
      />
    </mp-row-flex>
    <!-- 专题图名称 -->
    <mp-row-flex :label-width="84" label="专题图名称">
      <a-input
        @change="subjectTitleChange"
        :value="baseItemsObj.title"
        :allow-clear="true"
        placeholder="请输入专题图名称"
      />
    </mp-row-flex>
    <!-- 专题图类型 -->
    <mp-row-flex :label-width="84" label="专题图类型">
      <a-select
        @change="subjectTypeChange"
        :options="subjectTypeList"
        :value="baseItemsObj.type"
        placeholder="请选择专题图类型"
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
  ISubjectType,
  INewSubjectConfig,
  ISubjectConfigNode
} from '../../../../store'

@Component({
  computed: {
    ...mapGetters(['subjectConfig'])
  }
})
export default class BaseItems extends Vue {
  @Prop({ default: () => ({}) }) readonly value!: INewSubjectConfig

  // 专题类型列表
  subjectTypeList = subjectTypeList

  // 专题分类
  subjectClassify = ''

  // 专题图树
  thematicMapTree: Array<ISubjectConfigNode> = []

  // 专题节点公共的基础数据
  get baseItemsObj() {
    return { ...this.value }
  }

  set baseItemsObj(nV) {
    this.$emit('input', {
      id: `subject-${UUID.uuid()}`,
      visible: true,
      nodeType: 'subject',
      ...nV
    })
  }

  /**
   * 专题图节点选择变化
   */
  subjectClassifyChange(value: stirng, key?: string) {
    this.subjectClassify = value
    this.baseItemsObj = {
      ...this.baseItemsObj,
      parentId: key,
      parentTitle: value
    }
  }

  /**
   * 专题类型选择变化
   */
  subjectTypeChange(type: ISubjectType) {
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
  normalizeThematicMapTree(tree: Array<ISubjectConfigNode>) {
    if (!tree.length) return []
    return tree.map(node => {
      this.$set(node, 'selectable', node.nodeType !== 'subject')
      if (node.nodeType === 'list') {
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
  setThematicMapTree(tree: Array<ISubjectConfigNode>) {
    this.thematicMapTree = this.normalizeThematicMapTree(_cloneDeep(tree))
  }

  /**
   * 监听: 专题配置变化
   */
  @Watch('value.parentTitle')
  parentTitleChanged(nV) {
    this.subjectClassify = nV
  }

  /**
   * 监听: 专题配置变化
   */
  @Watch('subjectConfig', { deep: true })
  subjectConfigChanged(nV) {
    this.setThematicMapTree(nV)
  }

  created() {
    this.subjectClassify = this.value.parentTitle
    this.setThematicMapTree(this.subjectConfig)
  }
}
</script>
<style lang="less" scoped>
.base-items {
  .ant-row-flex {
    margin-bottom: 12px;
  }
}
</style>
