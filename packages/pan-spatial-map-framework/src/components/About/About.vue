<template>
  <div class="about">
    <div class="header">
      <img alt="logo" class="logo" src="@/assets/img/logo.png" />
      <span class="title">{{ systemName }}</span>
    </div>
    <a-divider />
    <div class="footer">
      <div class="copyright">
        Copyright<a-icon type="copyright" />{{ copyright }}
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'About',
  computed: {
    systemName() {
      return this.$store.state.setting.systemName
    },
    copyright() {
      return this.$store.state.setting.copyright
    }
  }
}
</script>

<style lang="less">
.about {
  .header {
    height: 44px;
    line-height: 44px;
    a {
      text-decoration: none;
    }
    .logo {
      height: 44px;
      vertical-align: top;
      margin-right: 16px;
    }
    .title {
      font-size: 20px;
      color: @title-color;
      font-family: 'Myriad Pro', 'Helvetica Neue', Arial, Helvetica, sans-serif;
      font-weight: 600;
      position: relative;
      top: 2px;
    }
  }
  .footer {
    padding: 0 0 16px 0;
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
