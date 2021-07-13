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
        accordion
        :activeKey="activePanel"
        @change="panelChange"
      >
        <a-collapse-panel
          v-for="(sub, i) in subjectConfig"
          :key="`${i}`"
          :header="sub.time"
        >
          <!-- 年度或时间 -->
          <mp-row-flex label="年度/时间" label-align="right" :span="[6, 18]">
            <a-input v-model="sub.time" placeholder="请输入年度/时间" />
          </mp-row-flex>
          <!-- 服务设置 -->
          <source-target @change="sourceTargetChange($event, sub)" />
          <!-- 属性表模块 -->
          <!-- <attribute-table-items /> -->
          <!-- 统计表模块 -->
          <!--  <statistic-table-items /> -->
          <!-- 弹框模块 -->
          <!--  <popup-items /> -->
          <!-- 各专题图专有配置 -->
          <component :is="subjectType" :subject="sub" />
        </a-collapse-panel>
      </a-collapse>
    </div>
  </div>
</template>
<script lang="ts">
import { Vue, Component, Prop } from 'vue-property-decorator'
import SourceTarget from './components/SourceTarget'
import SubjectStyles from './components/SubjectStyles'

@Component({
  components: {
    SourceTarget,
    ...SubjectStyles
  }
})
export default class SubjectItems extends Vue {
  @Prop() readonly subjectType!: string

  activePanel = ''

  subjectConfig = []

  /**
   * 面板change
   */
  panelChange(key) {
    if (key) {
      this.activePanel = key
    }
  }

  /**
   * 专题服务选择变化
   */
  sourceTargetChange(serverConfig, sub) {
    for (const key in serverConfig) {
      this.$set(sub, key, serverConfig[key])
    }
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
    this.subjectConfig.splice(this.activePanel, 1)
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
