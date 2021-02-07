<template>
  <div class="common-layout">
    <div class="content">
      <div class="top">
        <div class="header">
          <span class="title">{{ systemName }}</span>
        </div>
        <div class="desc"></div>
      </div>
      <div class="login">
        <a-form @submit="onSubmit" :form="form">
          <a-alert
            type="error"
            :closable="true"
            v-if="error"
            :message="error"
            @close="onClose"
            showIcon
            style="margin-bottom: 24px"
          />
          <a-form-item>
            <a-input
              autocomplete="autocomplete"
              size="large"
              v-decorator="[
                'username',
                {
                  rules: [
                    {
                      required: true,
                      message: '请输入账户名',
                      whitespace: true
                    }
                  ]
                }
              ]"
            >
              <a-icon slot="prefix" type="user" />
            </a-input>
          </a-form-item>
          <a-form-item>
            <a-input
              size="large"
              autocomplete="autocomplete"
              type="password"
              v-decorator="[
                'password',
                {
                  rules: [
                    {
                      required: true,
                      message: '请输入密码',
                      whitespace: true
                    }
                  ]
                }
              ]"
            >
              <a-icon slot="prefix" type="lock" />
            </a-input>
          </a-form-item>
          <a-form-item>
            <a-button
              :loading="logging"
              style="width: 100%; margin-top: 24px"
              size="large"
              htmlType="submit"
              type="primary"
              >登录
            </a-button>
          </a-form-item>
        </a-form>
      </div>
    </div>
    <div class="footer">
      <div class="copyright">
        Copyright<a-icon type="copyright" />{{ copyright }}
      </div>
    </div>
  </div>
</template>

<script>
import { LoginMixin } from '@mapgis/pan-spatial-map-store'

export default {
  name: 'Login',
  mixins: [LoginMixin],
  data() {
    return {
      logging: false,
      error: '',
      form: this.$form.createForm(this)
    }
  },
  computed: {
    systemName() {
      return this.$store.state.setting.systemName
    },
    copyright() {
      return this.$store.state.setting.copyright
    }
  },
  methods: {
    onSubmit(e) {
      e.preventDefault()
      const self = this
      this.form.validateFields(async err => {
        if (!err) {
          self.logging = true
          const username = self.form.getFieldValue('username')
          const password = self.form.getFieldValue('password')
          const flag = await self.checkLogin({ username, password })
          self.logging = false
          if (flag) {
            self.$router.push('/')
          } else {
            self.error = '登录失败'
          }
        }
      })
    },
    onClose() {
      this.error = false
    }
  }
}
</script>

<style lang="less" scoped>
.common-layout {
  display: flex;
  flex-direction: column;
  height: 100vh;
  overflow: auto;
  background-color: @layout-body-background;
  background-image: url('../assets/images/login_bg.png');
  background-repeat: no-repeat;
  background-position-x: 50%;
  background-position-y: center;
  background-size: 100%;
  .content {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    margin-left: 50vw;
    @media screen and (max-width: 480px) {
      margin-left: 0;
    }

    padding: 32px 0;
    flex: 1;
    @media (min-width: 768px) {
      padding: 112px 0 24px;
    }

    .top {
      text-align: center;
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
          font-size: 33px;
          color: @title-color;
          font-family: 'Myriad Pro', 'Helvetica Neue', Arial, Helvetica,
            sans-serif;
          font-weight: 600;
          position: relative;
          top: 2px;
        }
      }
      .desc {
        font-size: 14px;
        color: @text-color-second;
        margin-top: 12px;
        margin-bottom: 40px;
      }
    }
    .login {
      width: 368px;
      margin: 0 auto;
      @media screen and (max-width: 576px) {
        width: 95%;
      }
      @media screen and (max-width: 320px) {
        .captcha-button {
          font-size: 14px;
        }
      }
      .icon {
        font-size: 24px;
        color: @text-color-second;
        margin-left: 16px;
        vertical-align: middle;
        cursor: pointer;
        transition: color 0.3s;

        &:hover {
          color: @primary-color;
        }
      }
    }
  }

  .footer {
    padding: 48px 16px 24px;
    /*margin: 48px 0 24px;*/
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
