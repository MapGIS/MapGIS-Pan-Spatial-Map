<template>
  <div class="subject-items">
    <!-- 设置面板头部 -->
    <mp-toolbar :bordered="false" class="subject-items-head">
      <mp-toolbar-title :has-padding="false">
        专题图设置
      </mp-toolbar-title>
      <mp-toolbar-command-group>
        <mp-toolbar-command @click="add" title="新增" icon="plus" />
        <template v-if="configList.length">
          <template v-if="!showCheckbox">
            <mp-toolbar-command @click="edit" title="编辑" icon="form" />
          </template>
          <template v-else>
            <mp-toolbar-command @click="remove" title="删除" icon="delete" />
            <mp-toolbar-command @click="cancel" title="取消" icon="close" />
          </template>
        </template>
      </mp-toolbar-command-group>
    </mp-toolbar>
    <!-- 设置面板内容 -->
    <div class="subject-items-content">
      <a-empty v-if="!configList.length" />
      <a-collapse
        v-else
        @change="panelChange"
        :activeKey="activePanel"
        :accordion="true"
      >
        <a-collapse-panel v-for="(sub, i) in configList" :key="i">
          <!-- 设置头 -->
          <mp-row-flex
            slot="header"
            justify="space-between"
            :label="sub.time || '年度/时间'"
            :span="[23, 1]"
            :colon="false"
          >
            <transition name="fade">
              <a-checkbox
                v-show="showCheckbox"
                @click.stop
                @change="checked($event, sub, i)"
                :checked="sub._checked"
              />
            </transition>
          </mp-row-flex>
          <!-- 年度或时间、服务设置等公共设置项 -->
          <common
            :subject-config="sub"
            @time-change="timeChange($event, sub)"
            @field-change="fieldChange($event, sub)"
            @server-change="serverChange($event, sub)"
          />
          <!-- 其他配置 -->
          <a-tabs type="card" size="small">
            <a-tab-pane key="style" tab="样式配置">
              <subject-styles
                :subject-type="subjectType"
                @change="subjectStylesChange($event, sub)"
              />
            </a-tab-pane>
            <a-tab-pane key="attr" tab="表格配置">
              <attribute-table :subject-config="sub" />
            </a-tab-pane>
            <a-tab-pane key="graph" tab="统计图配置">
              <!--  <statistic-graph /> -->
            </a-tab-pane>
            <a-tab-pane key="popup" tab="弹框配置">
              <!--  <popup /> -->
            </a-tab-pane>
          </a-tabs>
        </a-collapse-panel>
      </a-collapse>
    </div>
  </div>
</template>
<script lang="ts">
import { Vue, Component, Prop, Watch } from 'vue-property-decorator'
import { SubjectType, NewSubjectConfig } from '../../../../store'
import Common from './components/Common.vue'
import SubjectStyles from './components/SubjectStyles'
import AttributeTable from './components/AttributeTable.vue'

@Component({
  components: {
    Common,
    SubjectStyles,
    AttributeTable
  }
})
export default class SubjectItems extends Vue {
  @Prop() readonly subjectType!: SubjectType

  @Prop({ default: () => [] }) readonly value!: Array<NewSubjectConfig>

  activePanel = 0

  showCheckbox = false

  checkedPanel = []

  configListMap = new Map()

  get configList() {
    return this.value
  }

  set configList(config: Array<NewSubjectConfig>) {
    this.$emit('input', config)
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
   * 专题图选择change
   */
  timeChange(time, sub) {
    this.$set(sub, 'time', time)
  }

  /**
   * 专题图选择change
   */
  fieldChange(field, sub) {
    this.$set(sub, 'field', field)
  }

  /**
   * 专题图选择change
   */
  serverChange(serverConfig, sub) {
    this.setProperties(serverConfig, sub)
  }

  /**
   * 专题个性配置选择change
   */
  subjectStylesChange(newSub, sub) {
    this.setProperties(newSub, sub)
  }

  /**
   * 新增年度
   */
  add() {
    const node = {
      time: '',
      _checked: false
    }
    this.configList = this.configList.concat(node)
    this.showCheckbox = false
  }

  /**
   * 编辑
   */
  edit() {
    this.showCheckbox = !this.showCheckbox
  }

  /**
   * 移除年度
   */
  remove() {
    if (!this.checkedPanel.length) {
      this.$message.warning('请选择需要删除的年度')
      return
    }
    this.checkedPanel.forEach(index => this.configList.splice(index, 1))
  }

  /**
   * 选中年度
   */
  checked(e: Event, sub: Record<string, unknown>, index: number) {
    e.stopPropagation()
    const { checked } = e.target
    this.$set(sub, '_checked', checked)
    if (checked) {
      this.checkedPanel.push(index)
    } else {
      this.checkedPanel.splice(index, 1)
    }
  }

  /**
   * 取消选中年度
   */
  cancel() {
    this.showCheckbox = false
    this.checkedPanel = []
    this.configList.forEach(v => this.$set(v, '_checked', false))
  }
}
</script>
<style lang="less" scoped>
@import './index.less';
</style>
