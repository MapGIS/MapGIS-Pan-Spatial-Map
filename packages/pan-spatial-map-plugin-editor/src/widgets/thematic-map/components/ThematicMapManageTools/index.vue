<template>
  <!-- 工具栏 -->
  <mp-window-wrapper :visible="mtVisible">
    <transition name="slide-fade">
      <mp-placement
        class="thematic-map-manage-tools"
        position="bottom-right"
        :offset="[0, 70]"
        v-show="mtVisible"
      >
        <a-row v-for="icon in iconList" :key="icon.type">
          <a-col>
            <a-tooltip placement="left" :title="icon.tooltip">
              <a-icon
                :type="icon.type"
                @click.stop="onToolIconChange(icon.visibleType)"
              />
            </a-tooltip>
          </a-col>
        </a-row>
      </mp-placement>
    </transition>
  </mp-window-wrapper>
</template>
<script lang="ts">
import { Vue, Component, Watch } from 'vue-property-decorator'
import { ThematicMapInstance, TModuleType } from '@mapgis/pan-spatial-map-store'

interface IIcon {
  type: string
  tooltip: string
  visibleType: TModuleType
}
@Component
export default class ThematicMapManageTools extends Vue {
  mtVisible = false

  iconList: IIcon[] = [
    {
      type: 'table',
      tooltip: '属性表',
      visibleType: 'at'
    },
    {
      type: 'bar-chart',
      tooltip: '统计表',
      visibleType: 'st'
    },
    {
      type: 'clock-circle',
      tooltip: '时间轴',
      visibleType: 'tl'
    },
    {
      type: 'file-add',
      tooltip: '新建专题图',
      visibleType: 'sa'
    }
  ]

  get visible() {
    return ThematicMapInstance.isVisible('mt')
  }

  /**
   * 按钮变化
   * @param visibleType<string>
   */
  onToolIconChange(visibleType: TModuleType) {
    ThematicMapInstance.setVisible(visibleType)
  }

  @Watch('visible')
  watchVisible(nV) {
    this.mtVisible = nV
  }

  created() {
    this.mtVisible = this.visible
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
