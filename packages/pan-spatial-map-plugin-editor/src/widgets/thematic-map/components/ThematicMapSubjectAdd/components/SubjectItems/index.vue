<template>
  <div class="subject-items" v-show="subjectType">
    <mp-row-flex
      class="subject-items-head"
      label="专题图设置"
      justify="space-between"
      content-align="right"
      :colon="false"
    >
      <a-tooltip title="新增年度">
        <a-icon type="plus" @click="addTime" />
      </a-tooltip>
      <a-tooltip title="删除年度">
        <a-icon type="delete" @click="removeTime" />
      </a-tooltip>
    </mp-row-flex>
    <div class="subject-items-content">
      <a-empty description="暂无年度数据" v-if="!subjectConfig.length" />
      <a-collapse
        v-else
        @change="panelChange"
        :activeKey="activePanel"
        accordion
      >
        <a-collapse-panel v-for="(sub, i) in subjectConfig" :key="i">
          <template #header>
            <a-checkbox @click.stop @change="checkedTime($event, i)" />
            <span class="time">{{ sub.time || '新增年度' }}</span>
          </template>
          <!-- 年度或时间 -->
          <mp-row-flex label="年度(或时间)" label-align="right" :span="[6, 18]">
            <a-input v-model="sub.time" placeholder="请输入年度(或时间)" />
          </mp-row-flex>
          <!-- 服务设置 -->
          <source-target @change="sourceTargetChange($event, sub)" />
          <!-- 属性表模块 -->
          <!-- <attribute-table /> -->
          <!-- 统计表模块 -->
          <!--  <statistic-graph /> -->
          <!-- 弹框模块 -->
          <!--  <popup /> -->
          <!-- 各专题图专有配置 -->
          <subject-styles
            :subject-type="subjectType"
            @change="subjectChange($event, sub)"
          />
        </a-collapse-panel>
      </a-collapse>
    </div>
  </div>
</template>
<script lang="ts">
import { Vue, Component, Prop, Watch } from 'vue-property-decorator'
import _cloneDeep from 'lodash/cloneDeep'
import SourceTarget from './components/SourceTarget'
import SubjectStyles from './components/SubjectStyles/index.vue'

@Component({
  components: {
    SourceTarget,
    SubjectStyles
  }
})
export default class SubjectItems extends Vue {
  @Prop({ type: String }) readonly subjectType!: string

  activePanel = 0

  checkedPanel = []

  subjectConfig = []

  subjectTypeConfigMap = new Map()

  @Watch('subjectType')
  subjectTypeChanged(nV) {
    this.subjectConfig = this.subjectTypeConfigMap.get(nV) || []
  }

  @Watch('subjectConfig', { deep: true })
  subjectConfigChanged(nV) {
    this.subjectTypeConfigMap.set(this.subjectType, _cloneDeep(nV))
  }

  /**
   * 更新属性
   */
  setProperties(source, target) {
    for (const key in source) {
      this.$set(target, key, source[key])
    }
  }

  /**
   * 面板change
   */
  panelChange(key) {
    this.activePanel = key
  }

  /**
   * 专题服务选择变化
   */
  sourceTargetChange(serverConfig, sub) {
    this.setProperties(serverConfig, sub)
  }

  /**
   * 专题个性配置选择变化
   */
  subjectChange(newSub, sub) {
    this.setProperties(newSub, sub)
  }

  /**
   * 新增年度
   */
  addTime() {
    const node = {
      time: ''
    }
    this.subjectConfig.push(node)
  }

  /**
   * 移除年度
   */
  removeTime() {
    if (!this.checkedPanel.length) {
      this.$message.warning('请选择需要删除的年度')
      return
    }
    this.checkedPanel.forEach(index => this.subjectConfig.splice(index, 1))
  }

  /**
   * 选中年度
   */
  checkedTime(e, index: number) {
    e.stopPropagation()
    e.preventDefault()
    if (e.target.checked) {
      this.checkedPanel.push(index)
    } else {
      this.checkedPanel.splice(index, 1)
    }
  }

  /**
   * 获取专题图的年度配置集合
   */
  getConfig() {
    return this.subjectConfig
  }
}
</script>
<style lang="less" scoped>
@import './index.less';
</style>
