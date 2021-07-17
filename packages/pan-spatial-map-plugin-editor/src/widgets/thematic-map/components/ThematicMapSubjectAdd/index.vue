<template>
  <mp-window-wrapper :visible="saVisible">
    <mp-window
      title="新建专题图"
      :visible.sync="saVisible"
      :vertical-offset="50"
      :has-padding="false"
      anchor="top-center"
    >
      <div class="thematic-map-subject-add" v-if="saVisible">
        <div class="subject-add-content">
          <!-- 专题基础配置 -->
          <base-items v-model="selfSubjectNode" />
          <!-- 专题个性配置 -->
          <subject-items v-model="selfSubjectNode" />
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
import { mapGetters, mapMutations, NewSubjectConfig } from '../../store'
import BaseItems from './components/BaseItems'
import SubjectItems from './components/SubjectItems'

@Component({
  components: {
    BaseItems,
    SubjectItems
  },
  computed: {
    ...mapGetters(['isVisible'])
  },
  methods: {
    ...mapMutations(['resetVisible', 'createSubjectConfigNode'])
  }
})
export default class ThematicMapSubjectAdd extends Vue {
  @Prop({ default: () => ({}) }) readonly subjectNode!: NewSubjectConfig

  @Watch('subjectNode', { deep: true })
  subjectNodeChanged(nV) {
    this.selfSubjectNode = { ...nV }
  }

  // 专题节点
  selfSubjectNode: NewSubjectConfig = {}

  get saVisible() {
    return this.isVisible('sa')
  }

  set saVisible(nV) {
    if (!nV) {
      this.resetVisible('sa')
    }
  }

  /**
   * 取消
   */
  onCancel() {
    this.saVisible = false
  }

  /**
   * 保存
   * todo 专题配置表单校验?是否使用a-form来实现, 业务组件如何触发校验?
   */
  onSave() {
    if (!this.selfSubjectNode.parentId) {
      this.$message.warning('请选择专题图目录')
    } else if (!this.selfSubjectNode.type) {
      this.$message.warning('请选择专题类型')
    } else if (!this.selfSubjectNode.config.length) {
      this.$message.warning('请填写专题配置')
    } else {
      this.createSubjectConfigNode(this.selfSubjectNode)
      this.$message.success('保存成功')
      this.onCancel()
    }
  }
}
</script>
<style lang="less">
@import './index.less';
</style>
