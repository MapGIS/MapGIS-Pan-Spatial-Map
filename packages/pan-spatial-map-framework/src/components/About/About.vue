<template>
  <div class="about">
    <div class="header">
      <!-- <img alt="logo" class="logo" src="@/assets/img/logo-earth-blue.png" />
      <span class="title">{{ systemName }}</span> -->
      <mp-icon :icon="appLogo" class="logo" />
      <h1 class="title">{{ application.title }}</h1>
      <!-- <h2>{{ application.subtitle }}</h2> -->
    </div>
    <div class="footer">
      <div class="copyright">
        Copyright<a-icon type="copyright" />{{ copyright }}
      </div>
    </div>
  </div>
</template>

<script>
import { AppMixin } from '@mapgis/web-app-framework'

export default {
  name: 'About',
  mixins: [AppMixin],
  computed: {
    systemName() {
      return this.$store.state.setting.systemName
    },
    copyright() {
      return this.$store.state.setting.copyright
    },
  },
}
</script>

<style lang="less">
.about {
  padding: 0 8px;
  .header {
    display: flex;
    align-items: center;
    padding: 4px 0 16px 0;
    border-bottom: 1px solid @border-color;
    a {
      text-decoration: none;
    }
    .logo {
      height: 32px;
      margin-right: 10px;
      img {
        width: 32px !important;
      }
    }
    .title {
      font-size: 20px;
      color: @title-color;
      font-family: 'Myriad Pro', 'Helvetica Neue', Arial, Helvetica, sans-serif;
      font-weight: 400;
      top: 6px;
      position: relative;
    }
  }
  .footer {
    padding: 12px 0 0px 0;
    text-align: center;
    .copyright {
      color: @text-color-second;
      font-size: 14px;
      i {
        margin: 0 4px;
      }
    }
  }
}
</style>
