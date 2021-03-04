<template>
  <a-dropdown>
    <div class="header-avatar" style="cursor: pointer">
      <span class="name">{{ getName }}</span>
    </div>
    <a-menu :class="['avatar-menu']" slot="overlay">
      <a-menu-item @click="handleLogout">
        <a-icon style="margin-right: 8px;" type="poweroff" />
        <span>退出登录</span>
      </a-menu-item>
    </a-menu>
  </a-dropdown>
</template>

<script>
import { mapGetters } from 'vuex'
import { LoginMixin } from '@mapgis/pan-spatial-map-store'

export default {
  name: 'MpHeaderAvatar',
  mixins: [LoginMixin],
  computed: {
    ...mapGetters('user', ['getName'])
  },
  methods: {
    async handleLogout() {
      await this.doLogout()
      this.$router.push('/login')
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
