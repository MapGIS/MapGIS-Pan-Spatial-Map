<template>
  <mp-window-wrapper :visible="visible">
    <mp-window
      title="新建专题图"
      :visible.sync="visible"
      :vertical-offset="50"
      :has-padding="false"
      anchor="top-center"
    >
      <div class="thematic-map-subject-add" v-if="visible">
        <div class="subject-add-content">
          <!-- 基础配置 -->
          <base-items v-model="baseItemsObj" />
          <!-- 主题配置 -->
          <subject-items
            v-show="subjectType"
            v-model="subjectItemsConfig"
            :subject-type="subjectType"
          />
        </div>
        <!-- 取消\保存按钮 -->
        <div class="subject-add-save-btn">
          <a-button @click="onCancel">取消</a-button>
          <a-button type="primary" @click="onSave">保存</a-button>
        </div>
      </div>
    </mp-window>
  </mp-window-wrapper>
</template>
<script lang="ts">
import { Vue, Component, Prop, Watch } from 'vue-property-decorator'
import {
  mapGetters,
  mapMutations,
  SubjectType,
  NewSubjectConfig,
  ThematicMapSubjectConfigNode
} from '../../store'
import BaseItems from './components/BaseItems'
import SubjectItems from './components/SubjectItems'

@Component({
  components: {
    BaseItems,
    SubjectItems
  },
  computed: {
    ...mapGetters(['isVisible', 'subjectConfig'])
  },
  methods: {
    ...mapMutations(['resetVisible', 'updateSubjectConfig'])
  }
})
export default class ThematicMapSubjectAdd extends Vue {
  @Prop({ default: () => ({}) }) readonly subjectNode!: NewSubjectConfig

  baseItemsObj = {}

  subjectItemsConfig = []

  @Watch('subjectNode', { deep: true })
  subjectNodeChanged({ config, ...others }) {
    this.baseItemsObj = { ...others }
    this.subjectItemsConfig = config
  }

  get visible() {
    return this.isVisible('create')
  }

  set visible(nV) {
    if (!nV) {
      this.resetVisible('create')
    }
  }

  get parentId() {
    return this.baseItemsObj.parentId
  }

  get subjectType() {
    return this.baseItemsObj.type
  }

  /**
   * 创建专题节点
   */
  createSubjectConfigNode(node) {
    const resursion = (tree, node) => {
      return tree.map(item => {
        if (item.id === node.parentId) {
          if (item.children && item.children.length) {
            const index = item.children.findIndex(({ id }) => id === node.id)
            if (index !== -1) {
              item.children.splice(index, 1, node)
            } else {
              item.children.push(node)
            }
          } else {
            item.children = [node]
          }
        } else if (item.children && item.children.length) {
          resursion(item.children, node)
        }
        return item
      })
    }
    this.updateSubjectConfig(resursion(this.subjectConfig, node))
      .then(() => {
        this.$message.success('保存成功')
        this.onCancel()
      })
      .catch(err => {
        this.$message.error('保存失败')
      })
  }

  /**
   * 取消
   */
  onCancel() {
    this.visible = false
    this.baseItemsObj = {}
    this.subjectItemsConfig = []
  }

  /**
   * 保存
   * todo 专题配置表单校验?是否使用a-form来实现, 业务组件如何触发校验?
   */
  onSave() {
    if (!this.parentId) {
      this.$message.warning('请选择专题图目录')
    } else if (!this.subjectType) {
      this.$message.warning('请选择专题图类型')
    } else if (!this.subjectItemsConfig.length) {
      this.$message.warning('请填写专题图配置')
    } else {
      this.createSubjectConfigNode({
        ...this.baseItemsObj,
        config: this.subjectItemsConfig
      })
    }
  }
}
</script>
<style lang="less">
@import './index.less';
</style>
