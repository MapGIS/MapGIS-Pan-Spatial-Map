<template>
  <mapgis-ui-dropdown>
    <div class="header-avatar" style="cursor: pointer">
      <mapgis-ui-iconfont type="mapgis-user" class="avatar" />
      <span class="name">{{ nickname }}</span>
    </div>
    <mapgis-ui-menu :class="['avatar-menu']" slot="overlay">
      <mapgis-ui-menu-item @click="handleLogout">
        <mapgis-ui-iconfont style="margin-right: 8px" type="mapgis-poweroff" />
        <span>退出登录</span>
      </mapgis-ui-menu-item>
    </mapgis-ui-menu>
  </mapgis-ui-dropdown>
</template>

<script>
import { mapGetters } from 'vuex'

export default {
  name: 'HeaderAvatar',
  computed: {
    ...mapGetters(['avatar', 'nickname'])
  },
  methods: {
    handleLogout(e) {
      this.$store.dispatch('logout').then(() => {
        if (!this.$store.getters.casInfo.enabled) {
          location.href = '/'
        }
      })
    }
  }
}
</script>

<style lang="less">
.header-avatar {
  display: inline-flex;
  .avatar,
  .name {
    align-self: center;
  }
  .avatar {
    margin-right: 8px;
  }
  .name {
    font-weight: 500;
  }
}
.avatar-menu {
  width: 150px;
}
</style>
