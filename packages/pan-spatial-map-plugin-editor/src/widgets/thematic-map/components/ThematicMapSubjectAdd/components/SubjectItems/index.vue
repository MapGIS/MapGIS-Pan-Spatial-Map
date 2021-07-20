<template>
  <div class="subject-items">
    <mp-toolbar :bordered="false" class="subject-items-head">
      <mp-toolbar-title :has-padding="false">
        专题设置
      </mp-toolbar-title>
      <mp-toolbar-command-group>
        <mp-toolbar-command
          v-for="item in configTools"
          :key="item.title"
          :title="item.title"
          :icon="item.icon"
          @click="item.method()"
        >
        </mp-toolbar-command>
      </mp-toolbar-command-group>
    </mp-toolbar>
    <div class="subject-items-content">
      <a-empty description="暂无年度数据" v-if="!configList.length" />
      <a-collapse
        v-else
        @change="panelChange"
        :activeKey="activePanel"
        accordion
      >
        <a-collapse-panel v-for="(sub, i) in configList" :key="i">
          <template #header>
            <a-checkbox
              @click.stop
              @change="checkedTime($event, sub, i)"
              :checked="sub.checked"
            />
            <span class="time">{{ sub.time || '新增年度' }}</span>
          </template>
          <!-- 年度或时间 -->
          <mp-row-flex label="年度(或时间)" label-align="right" :span="[6, 18]">
            <a-input v-model="sub.time" placeholder="请输入年度(或时间)" />
          </mp-row-flex>
          <!-- 服务设置 -->
          <server-tree-select @change="serverChange($event, sub)" />
          <!-- 属性表模块 -->
          <!-- <attribute-table /> -->
          <!-- 统计表模块 -->
          <!--  <statistic-graph /> -->
          <!-- 弹框模块 -->
          <!--  <popup /> -->
          <!-- 各专题图专有配置 -->
          <subject-styles
            :subject-type="subjectType"
            @change="subjectStylesChange($event, sub)"
          />
        </a-collapse-panel>
      </a-collapse>
    </div>
  </div>
</template>
<script lang="ts">
import { Vue, Component, Prop, Watch } from 'vue-property-decorator'
import { SubjectType, NewSubjectConfig } from '../../../../store'
import ServerTreeSelect from './components/ServerTreeSelect.vue'
import SubjectStyles from './components/SubjectStyles'

@Component({
  components: {
    ServerTreeSelect,
    SubjectStyles
  }
})
export default class SubjectItems extends Vue {
  @Prop() readonly subjectType!: SubjectType

  @Prop({ default: () => [] }) readonly value!: Array<NewSubjectConfig>

  activePanel = 0

  checkedPanel = []

  configTools = [
    {
      title: '新增年度',
      icon: 'plus',
      method: this.addTime
    },
    {
      title: '删除年度',
      icon: 'delete',
      method: this.removeTime
    }
  ]

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
  addTime() {
    const node = {
      time: '',
      checked: false
    }
    this.configList = this.configList.concat(node)
  }

  /**
   * 移除年度
   */
  removeTime() {
    if (!this.checkedPanel.length) {
      this.$message.warning('请选择需要删除的年度')
      return
    }
    this.checkedPanel.forEach(index => this.configList.splice(index, 1))
  }

  /**
   * 选中年度
   */
  checkedTime(e, sub, index: number) {
    e.stopPropagation()
    e.preventDefault()
    const checked = e.target.checked
    this.$set(sub, 'checked', checked)
    if (checked) {
      this.checkedPanel.push(index)
    } else {
      this.checkedPanel.splice(index, 1)
    }
  }
}
</script>
<style lang="less" scoped>
@import './index.less';
</style>
