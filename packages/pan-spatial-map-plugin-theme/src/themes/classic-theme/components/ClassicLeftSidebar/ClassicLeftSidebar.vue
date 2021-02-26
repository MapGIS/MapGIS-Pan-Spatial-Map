<template>
  <div>
    <div :style="{ width: sidebarWidth + 'px', overflow: 'hidden' }" />

    <a-layout-sider
      :style="{
        overflow: 'auto',
        height: 'calc(100% - 48px)',
        position: 'fixed',
        left: 0
      }"
      :theme="themeMode"
      class="beauty-scroll"
      v-model="collapsed"
      :collapsedWidth="sidebarWidth"
      collapsible
    >
      <a-menu :theme="themeMode" :default-selected-keys="['1']" mode="inline">
        <a-menu-item key="1">
          <a-icon type="pie-chart" />
          <span>Option 1</span>
        </a-menu-item>
        <a-menu-item key="2">
          <a-icon type="desktop" />
          <span>Option 2</span>
        </a-menu-item>
        <a-sub-menu key="sub1">
          <span slot="title"><a-icon type="user" /><span>User</span></span>
          <a-menu-item key="3">
            Tom
          </a-menu-item>
          <a-menu-item key="4">
            Bill
          </a-menu-item>
          <a-menu-item key="5">
            Alex
          </a-menu-item>
        </a-sub-menu>
        <a-sub-menu key="sub2">
          <span slot="title"><a-icon type="team" /><span>Team</span></span>
          <a-menu-item key="6">
            Team 1
          </a-menu-item>
          <a-menu-item key="8">
            Team 2
          </a-menu-item>
        </a-sub-menu>
        <a-menu-item key="9">
          <a-icon type="file" />
          <span>File</span>
        </a-menu-item>
      </a-menu>
    </a-layout-sider>
  </div>
</template>

<script>
import { mapState } from 'vuex'

export default {
  name: 'MpPanSpatialMapClassicLeftSidebar',
  data() {
    return {
      collapsed: false,
      initSidebarWidth: 48
    }
  },
  computed: {
    ...mapState('setting', ['theme']),
    themeMode() {
      return this.theme.mode == 'light' ? this.theme.mode : 'dark'
    },
    sidebarWidth() {
      return this.collapsed ? this.initSidebarWidth : 200
    }
  }
}
</script>

<style lang="less">
@import '../../../index.less';
</style>
