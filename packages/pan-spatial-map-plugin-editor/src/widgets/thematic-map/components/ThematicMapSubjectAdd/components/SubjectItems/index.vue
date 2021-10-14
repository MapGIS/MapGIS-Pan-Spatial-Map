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
      <a-empty class="subject-items-empty" v-if="!configList.length" />
      <a-collapse
        v-else
        @change="panelChange"
        :activeKey="activePanel"
        :accordion="true"
        class="subject-items-collapse"
      >
        <a-collapse-panel v-for="(config, i) in configList" :key="i">
          <!-- 年度/时间 -->
          <mp-row-flex
            slot="header"
            :span="panelHeaderSpan"
            justify="space-between"
          >
            <a-input
              slot="label"
              @click.stop
              @blur="timeBlur(config.time)"
              v-model="config.time"
              size="small"
              placeholder="请输入年度/时间"
              class="subject-items-time"
            />
            <a-checkbox
              @click.stop
              @change="checked($event, config, i)"
              v-show="showCheckbox"
              :checked="config._checked"
            />
          </mp-row-flex>
          <!-- 服务设置等公共设置项 -->
          <common
            @change="configChange($event, config)"
            :subject-config="config"
          />
          <!-- 样式、属性表、统计表、弹框配置 -->
          <a-tabs type="card" size="small" class="subject-items-card">
            <a-tab-pane
              v-for="{ key, tab } in configTabList"
              :key="key"
              :tab="tab"
            >
              <component
                @change="configChange($event, config)"
                :subject-config="config"
                :subject-type="subjectType"
                :is="key"
              />
            </a-tab-pane>
          </a-tabs>
        </a-collapse-panel>
      </a-collapse>
    </div>
  </div>
</template>
<script lang="ts">
import { Vue, Component, Prop, Watch } from 'vue-property-decorator'
import { ISubjectType, INewSubjectConfig } from '../../../../store'
import Common from './components/Common.vue'
import SubjectStyles from './components/SubjectStyles'
import AttributeTable from './components/AttributeTable.vue'
import StatisticGragh from './components/StatisticGragh.vue'
import Popup from './components/Popup.vue'

@Component({
  components: {
    Common,
    SubjectStyles,
    AttributeTable,
    StatisticGragh,
    Popup
  }
})
export default class SubjectItems extends Vue {
  @Prop() readonly subjectType!: ISubjectType

  @Prop({ default: () => [] }) readonly value!: Array<INewSubjectConfig>

  activePanel = '0'

  showCheckbox = false

  checkedPanels = []

  configTabList: Array<{
    key: string
    tab: string
  }> = [
    {
      key: 'SubjectStyles',
      tab: '样式配置'
    },
    {
      key: 'AttributeTable',
      tab: '表格配置'
    },
    {
      key: 'StatisticGragh',
      tab: '统计图配置'
    },
    {
      key: 'Popup',
      tab: '弹框配置'
    }
  ]

  get panelHeaderSpan() {
    return this.showCheckbox ? [23, 1] : [24, 0]
  }

  get configList() {
    return this.value
  }

  set configList(config: Array<INewSubjectConfig>) {
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
  panelChange(key: string) {
    this.activePanel = key
  }

  /**
   * 专题配置change
   */
  configChange(newConfig: Record<string, any>, config: INewSubjectConfig) {
    this.setProperties(newConfig, config)
    console.log('配置数据', { ...config })
  }

  /**
   * 专题图年度输入失焦
   */
  timeBlur(time: string) {
    if (this.configList.filter(c => time && c.time === time).length > 1) {
      this.$message.warning(
        `存在相同的年度"${time}"， 若继续保存，将会保存最新配置的年度`
      )
    }
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
    if (!this.checkedPanels.length) {
      this.$message.warning('请选择需要删除的年度')
      return
    }
    this.checkedPanels.forEach(index => this.configList.splice(index, 1))
  }

  /**
   * 选中年度
   */
  checked(e: Event, config: Record<string, unknown>, index: number) {
    e.stopPropagation()
    const { checked } = e.target
    this.$set(config, '_checked', checked)
    if (checked) {
      this.checkedPanels.push(index)
    } else {
      this.checkedPanels.splice(index, 1)
    }
  }

  /**
   * 取消选中年度
   */
  cancel() {
    this.showCheckbox = false
    this.checkedPanels = []
    this.configList.forEach(v => this.$set(v, '_checked', false))
  }
}
</script>
<style lang="less">
@import './index.less';
</style>
