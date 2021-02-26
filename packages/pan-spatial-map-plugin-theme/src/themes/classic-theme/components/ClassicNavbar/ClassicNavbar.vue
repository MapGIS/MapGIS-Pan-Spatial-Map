<template>
  <a-layout-header class="classic-navbar-wrap">
    <div class="logo" />
    <a-menu
      :theme="themeMode"
      mode="horizontal"
      :default-selected-keys="['2']"
      :style="{ lineHeight: '48px' }"
    >
      <a-menu-item key="1">
        nav 1
      </a-menu-item>
      <a-menu-item key="2">
        nav 2
      </a-menu-item>
      <a-menu-item key="3">
        nav 3
      </a-menu-item>
    </a-menu>
  </a-layout-header>
</template>

<script>
import { mapState } from 'vuex'

export default {
  name: 'MpPanSpatialMapClassicNavbar',
  computed: {
    ...mapState('setting', ['theme']),
    themeMode() {
      return this.theme.mode == 'light' ? this.theme.mode : 'dark'
    }
  }
}
</script>

<style lang="less" scoped>
.classic-navbar-wrap {
  height: 48px;
  line-height: 48px;
  padding: 0px;
}

.logo {
  width: 120px;
  height: 32px;
  background: rgba(255, 255, 255, 0.2);
  margin: 8px 28px 8px 0;
  float: left;
}
</style>
