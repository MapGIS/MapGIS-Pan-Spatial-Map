<template>
  <!-- 侧边工具栏 -->
  <mp-window-wrapper :visible="visible">
    <transition name="slide-fade">
      <mp-placement
        class="thematic-map-manage-tools"
        position="bottom-right"
        :offset="[0, 70]"
        v-show="visible"
      >
        <a-row v-for="item in iconList" :key="item.icon">
          <a-col>
            <a-tooltip placement="left" :title="item.title">
              <a-icon :type="item.icon" @click.stop="iconChange(item.type)" />
            </a-tooltip>
          </a-col>
        </a-row>
      </mp-placement>
    </transition>
  </mp-window-wrapper>
</template>
<script lang="ts">
import { Vue, Component, Watch } from 'vue-property-decorator'
import { mapGetters, mapMutations, ModuleType } from '../../store'

interface IIcon {
  icon: string
  title: string
  type: ModuleType
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
  get visible() {
    return this.isVisible('tools')
  }

  // 按钮列表
  get iconList() {
    return this.getIconList()
  }

  /**
   * 获取按钮列表
   */
  getIconList() {
    const list: Array<IIcon> = []
    const addConfig = {
      icon: 'file-add',
      title: '新建专题图',
      type: 'create'
    }
    const tableConfig = {
      icon: 'table',
      title: '属性表',
      type: 'table'
    }
    const graphConfig = {
      icon: 'bar-chart',
      title: '统计表',
      type: 'graph'
    }
    const timelineConfig = {
      icon: 'clock-circle',
      title: '时间轴',
      type: 'timeline'
    }
    if (this.subjectData?.table) {
      list.push(tableConfig)
    }
    if (this.subjectData?.graph) {
      list.push(graphConfig)
    }
    if (
      this.selectedSubjectTimeList &&
      this.selectedSubjectTimeList.length > 1
    ) {
      list.push(timelineConfig)
    }
    list.push(addConfig)
    return list
  }

  /**
   * 按钮变化
   */
  iconChange(type: ModuleType) {
    this.setVisible(type)
  }
}
</script>
<style lang="less">
.slide-fade-enter-active,
.slide-fade-leave-active {
  transition: all 0.3s ease;
}

.slide-fade-enter,
.slide-fade-leave-to {
  transform: translateX(100%);
  opacity: 0;
}
</style>
<style lang="less" scoped>
@import './index.less';
</style>
