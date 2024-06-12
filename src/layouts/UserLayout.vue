<template>
  <div id="userLayout" :class="['user-layout-wrapper', isMobile && 'mobile']">
    <div class="container" :style="{ backgroundImage: backgourndImageUrl }">
      <div class="user-layout-lang">
        <select-lang v-if="supportInternationalization" class="select-lang-trigger" />
      </div>
      <div class="user-layout-content">
        <div class="top">
          <div class="header">
            <a href="/">
              <variable-icon v-if="logo" :icon="logo" :height="44" :width="44" class="logo" alt="logo" />
              <span class="title">{{ title }}</span>
            </a>
          </div>
          <div class="desc"></div>
        </div>
        <router-view />
      </div>
      <div class="footer">
        <div class="copyright">{{ copyright }}</div>
      </div>
    </div>
  </div>
</template>

<script>
import { deviceMixin } from '@/store/device-mixin'
import { serverMixin } from '@/store/server-mixin'
import SelectLang from '@/components/SelectLang'
import VariableIcon from '@/components/VariableIcon'

export default {
  name: 'UserLayout',
  mixins: [deviceMixin, serverMixin],
  components: {
    SelectLang,
    VariableIcon
  },
  data() {
    return {}
  },
  computed: {
    backgourndImageUrl() {
      // eslint-disable-next-line camelcase, no-undef
      return `url('${__webpack_public_path__}login-bg.png')`
    },
    supportInternationalization() {
      return window._CONFIG['supportInternationalization '] === 'true'
    }
  },
  mounted() {
    document.body.classList.add('userLayout')
  },
  beforeDestroy() {
    document.body.classList.remove('userLayout')
  }
}
</script>

<style lang="less" scoped>
#userLayout.user-layout-wrapper {
  height: 100%;

  &.mobile {
    .container {
      .main {
        max-width: 368px;
        width: 98%;
      }
    }
  }

  .container {
    width: 100%;
    min-height: 100%;
    background-repeat: no-repeat;
    background-position-x: center;
    background-size: cover;
    position: relative;

    .user-layout-lang {
      width: 100%;
      height: 40px;
      line-height: 44px;
      text-align: right;

      .select-lang-trigger {
        cursor: pointer;
        padding: 12px;
        margin-right: 24px;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        font-size: 18px;
        vertical-align: middle;
      }
    }

    a {
      text-decoration: none;
    }

    .user-layout-content {
      padding: 110px 0 144px;

      .top {
        text-align: center;

        .header {
          height: 44px;
          line-height: 44px;

          .badge {
            position: absolute;
            display: inline-block;
            line-height: 1;
            vertical-align: middle;
            margin-left: -12px;
            margin-top: -10px;
            opacity: 0.8;
          }

          .logo {
            vertical-align: top;
            margin-right: 16px;
            border-style: none;
            display: inline-block;
          }

          .title {
            font-size: 33px;
            color: rgba(255, 255, 255, 0.65);
            font-family: Avenir, 'Helvetica Neue', Arial, Helvetica, sans-serif;
            font-weight: 600;
            position: relative;
            top: 2px;
          }
        }
        .desc {
          font-size: 14px;
          color: rgba(255, 255, 255, 0.65);
          margin-top: 12px;
          margin-bottom: 40px;
        }
      }

      .main {
        min-width: 260px;
        width: 368px;
        margin: 0 auto;
      }
    }

    .footer {
      position: absolute;
      width: 100%;
      bottom: 0;
      padding: 0 16px;
      margin: 48px 0 24px;
      text-align: center;

      .links {
        margin-bottom: 8px;
        font-size: 14px;
        a {
          color: rgba(255, 255, 255, 0.65);
          transition: all 0.3s;
          &:not(:last-child) {
            margin-right: 40px;
          }
        }
      }
      .copyright {
        color: rgba(255, 255, 255, 0.65);
        font-size: 14px;
      }
    }
  }
}
</style>
