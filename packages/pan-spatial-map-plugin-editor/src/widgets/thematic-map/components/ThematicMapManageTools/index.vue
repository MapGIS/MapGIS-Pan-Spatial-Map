<template>
  <!-- 侧边工具栏 -->
  <transition name="fade">
    <mp-window-wrapper :visible="visible">
      <mp-placement
        v-show="visible"
        class="thematic-map-manage-tools"
        position="center-right"
        :offset="[12, 0]"
      >
        <a-row v-for="item in iconList" :key="item.icon">
          <a-col>
            <a-tooltip placement="left" :title="item.title">
              <a-icon :type="item.icon" @click.stop="iconChange(item.type)" />
            </a-tooltip>
          </a-col>
        </a-row>
      </mp-placement>
    </mp-window-wrapper>
  </transition>
</template>
<script lang="ts">
import { Vue, Component, Watch } from 'vue-property-decorator'
import { mapGetters, mapMutations, ModuleType } from '../../store'

interface IIcon {
  icon: string
  title: string
  type: keyof ModuleType
}

@Component({
  computed: {
    ...mapGetters(['isVisible', 'subjectData', 'selectedSubjectTimeList'])
  },
  methods: {
    ...mapMutations(['setVisible'])
  }
})
export default class ThematicMapManageTools extends Vue {
  // 按钮列表
  get iconList() {
    return this.getIconList()
  }

  // 是否可见
  get visible() {
    return this.isVisible(ModuleType.TOOLS) && !!this.iconList.length
  }

  /**
   * 获取按钮列表
   */
  getIconList() {
    const list: Array<IIcon> = []
    if (this.subjectData?.table) {
      const tableConfig = {
        icon: 'table',
        title: '属性表',
        type: ModuleType.TABLE
      }
      list.push(tableConfig)
    }
    if (this.subjectData?.graph) {
      const graphConfig = {
        icon: 'bar-chart',
        title: '统计表',
        type: ModuleType.GRAPH
      }
      list.push(graphConfig)
    }
    if (
      this.selectedSubjectTimeList &&
      this.selectedSubjectTimeList.length > 1
    ) {
      const timelineConfig = {
        icon: 'clock-circle',
        title: '时间轴',
        type: ModuleType.TIMELINE
      }
      list.push(timelineConfig)
    }
    return list
  }

  /**
   * 按钮变化
   * @param {string} type 类型
   */
  iconChange(type: keyof ModuleType) {
    this.setVisible(type)
  }
}
</script>
<style lang="less" scoped>
@import './index.less';
</style>
