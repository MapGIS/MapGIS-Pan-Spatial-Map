<template>
  <a-layout-sider
    theme="light"
    :class="[themeMode, 'side-panel-wrapper']"
    :width="resizeWidth"
    v-show="syncedVisible"
  >
    <slot />
    <mp-pan-spatial-map-adjust-line
      direction="right"
      :resize-button="false"
      @line-move="onPanelLineMove"
    />
  </a-layout-sider>
</template>

<script>
import { mapState } from 'vuex'
import MpPanSpatialMapAdjustLine from '../AdjustLine/AdjustLine.vue'

export default {
  name: 'MpPanSpatialMapSideWindow',
  components: { MpPanSpatialMapAdjustLine },
  props: {
    // 显示标题
    title: { type: String, default: 'Title' },
    // 显示图标
    icon: { type: String, required: false },
    // 是否显示
    visible: { type: Boolean, default: false },
    // 内容宽度
    width: { type: Number, default: 240 }
  },
  data() {
    return {
      resizeWidth: this.width
    }
  },
  computed: {
    ...mapState('setting', ['theme']),
    themeMode() {
      return this.theme.mode
    },
    // 同步属性visible
    syncedVisible: {
      get() {
        return this.visible
      },
      set(value) {
        this.$emit('update:visible', value)
      }
    }
  },
  methods: {
    onPanelLineMove(offset) {
      this.resizeWidth += offset
      if (this.resizeWidth < 2) {
        this.resizeWidth = 2
      }
    },
    // 关闭事件
    onClose() {
      this.syncedVisible = false
    }
  }
}
</script>

<style lang="less">
.side-panel-wrapper {
  .ant-layout-sider-children {
    display: flex;
    flex-direction: row;
    height: 100%;
    justify-content: flex-end;
  }
}
</style>

<style lang="less" scoped>
.side-panel-wrapper {
  z-index: 500;
  height: calc(100vh - 48px);
}
</style>
