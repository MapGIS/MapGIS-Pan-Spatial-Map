<template>
  <a-layout-sider
    theme="light"
    :class="[themeMode, 'side-panel-wrapper']"
    :width="width"
  >
  </a-layout-sider>
</template>

<script>
import { mapState } from 'vuex'

export default {
  name: 'MpPanSpatialMapSidePanel',
  props: {
    width: {
      type: Number,
      default: 320
    }
  },
  computed: {
    ...mapState('setting', ['theme']),
    themeMode() {
      return this.theme.mode
    }
  }
}
</script>

<style lang="less">
.side-panel-wrapper {
  height: calc(100vh - 48px);
}
</style>
