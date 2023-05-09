<template>
  <div class="about">
    <div class="header">
      <mapgis-ui-icon :icon="appLogo" class="logo" />
      <h1 class="title">{{ application.title }}</h1>
      <!-- <h2>{{ application.subtitle }}</h2> -->
    </div>
    <div class="footer">
      <div class="copyright">Copyright<mapgis-ui-iconfont type="mapgis-copyright" />{{ application.copyright }}</div>
    </div>
  </div>
</template>

<script>
import { AppMixin } from '@mapgis/web-app-framework'

export default {
  name: 'About',
  mixins: [AppMixin],
  data() {
    return {}
  },
  computed: {
    systemName() {
      return this.$store.state.setting.systemName
    },
    copyright() {
      return this.$store.state.setting.copyright
    }
  },
  methods: {}
}
</script>

<style lang="scss" scoped>
.about {
  .header {
    border-bottom: 1px solid $border-color-base;
    .title {
      color: $text-color;
    }
    .logo {
      color: $primary-color;
      i {
        color: $primary-color;
      }
    }
  }
  .footer {
    .copyright {
      color: $text-color-second;
    }
  }
}
</style>

<style lang="less">
.about {
  padding: 8px;
  .header {
    display: flex;
    align-items: center;
    padding: 4px 0 16px 0;
    a {
      text-decoration: none;
    }
    .logo {
      height: 32px;
      margin-right: 10px;
      img {
        width: 32px !important;
      }
      .icon > svg {
        width: 32px !important;
        height: 32px !important;
      }
    }
    .title {
      font-size: 20px;
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
      font-size: 14px;
      i {
        margin: 0 4px;
      }
    }
  }
}
</style>
