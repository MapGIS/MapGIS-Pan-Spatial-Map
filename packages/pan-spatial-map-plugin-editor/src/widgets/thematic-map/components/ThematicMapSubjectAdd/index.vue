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
          <base-items ref="baseItems" @type-change="subjectType = $event" />
          <!-- 专题个性配置 -->
          <subject-items ref="subjectItems" :subject-type="subjectType" />
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
import { Vue, Component } from 'vue-property-decorator'
import { mapGetters, mapMutations } from '../../store'
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
    ...mapMutations(['resetVisible', 'createSubjectConfigNode'])
  }
})
export default class ThematicMapSubjectAdd extends Vue {
  subjectType = ''

  get saVisible() {
    return this.isVisible('sa')
  }

  set saVisible(nV) {
    if (!nV) {
      this.resetVisible('sa')
    }
  }

  onCancel() {
    this.saVisible = false
  }

  onSave() {
    // todo 表单校验待优化
    if (!this.subjectType) {
      this.$message.warning('请选择专题类型')
    } else {
      const subjectConfig = this.$refs.subjectItems.getConfig()
      const node = this.$refs.baseItems.getConfig(subjectConfig)
      if (!node.title) {
        this.$message.warning('请填写专题图名称')
      } else {
        this.createSubjectConfigNode(node)
        this.$message.success('保存成功')
        this.onCancel()
      }
    }
  }
}
</script>
<style lang="less">
@import './index.less';
</style>
