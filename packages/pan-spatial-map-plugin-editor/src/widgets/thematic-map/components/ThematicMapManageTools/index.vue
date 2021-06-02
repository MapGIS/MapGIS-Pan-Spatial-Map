<template>
  <!-- 侧边工具栏 -->
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
import { mapGetters, mapMutations } from '@mapgis/pan-spatial-map-store'

interface IIcon {
  type: string
  tooltip: string
  visibleType: string
}
@Component({
  computed: {
    ...mapGetters(['isVisible', 'selectedTimeList'])
  },
  methods: {
    ...mapMutations(['setVisible', 'resetVisible'])
  }
})
export default class ThematicMapManageTools extends Vue {
  mtVisible = false

  get visible() {
    return this.isVisible('mt')
  }

  get iconList() {
    const list = [
      {
        type: 'table',
        tooltip: '属性表',
        visibleType: 'at'
      },
      {
        type: 'bar-chart',
        tooltip: '统计表',
        visibleType: 'st'
      }
      // {
      //   type: 'file-add',
      //   tooltip: '新建专题图',
      //   visibleType: 'sa'
      // }
    ]
    if (this.selectedTimeList && this.selectedTimeList.length > 1) {
      list.splice(2, 0, {
        type: 'clock-circle',
        tooltip: '时间轴',
        visibleType: 'tl'
      })
    }
    return list
  }

  /**
   * 按钮变化
   */
  onToolIconChange(visibleType: string) {
    this.setVisible(visibleType)
  }

  @Watch('visible')
  watchVisible(nV) {
    this.mtVisible = nV
  }

  created() {
    this.mtVisible = this.visible
  }

  beforeDestroy() {
    // this.mtVisible = false
    // this.resetVisible('mt')
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
