<template>
  <a-layout-sider
    theme="light"
    :class="[themeMode, 'side-panel-wrapper']"
    :width="panelWidth"
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
  name: 'MpPanSpatialMapSidePanel',
  components: { MpPanSpatialMapAdjustLine },
  props: {
    width: {
      type: Number,
      default: 320
    },
    // 是否显示
    visible: { type: Boolean, default: false }
  },
  data() {
    return {
      panelWidth: this.width
    }
  },
  computed: {
    ...mapState('setting', ['theme']),
    themeMode() {
      return this.theme.mode
    }
  },
  methods: {
    onPanelLineMove(offset) {
      this.panelWidth += offset
      if (this.panelWidth < 2) {
        this.panelWidth = 2
      }
    }
  }
}
</script>

<style lang="less">
.side-panel-wrapper {
  z-index: 500;
  .ant-layout-sider-children {
    display: flex;
    flex-direction: row;
    height: 100%;
    justify-content: flex-end;
  }
}
</style>

<style lang="less">
.side-panel-wrapper {
  height: calc(100vh - 48px);
}
</style>
