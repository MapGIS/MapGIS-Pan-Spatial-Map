<template>
  <common-layout class="login-wrapper">
    <div class="top">
      <div class="header">
        <img alt="logo" class="logo" src="@/assets/img/logo-earth.png" />
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
            placeholder="用户名"
            v-decorator="[
              'name',
              {
                rules: [
                  {
                    required: true,
                    message: '请输入用户名',
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
            placeholder="密码"
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
  </common-layout>
</template>

<script>
import CommonLayout from '@/layouts/CommonLayout'
import { login } from '@/services/user'
import { setAuthorization } from '@/utils/request'
import { mapMutations } from 'vuex'

export default {
  name: 'Login',
  components: { CommonLayout },
  data() {
    return {
      logging: false,
      error: '',
      form: this.$form.createForm(this),
      redirect: undefined
    }
  },
  computed: {
    systemName() {
      return this.$store.state.setting.systemName
    }
  },
  watch: {
    $route: {
      handler: function(route) {
        this.redirect = route.query && route.query.redirect
      },
      immediate: true
    }
  },
  methods: {
    ...mapMutations('account', ['setUser']),
    onSubmit(e) {
      e.preventDefault()
      const self = this
      this.form.validateFields(err => {
        if (!err) {
          this.logging = true
          const name = this.form.getFieldValue('name')
          const password = this.form.getFieldValue('password')
          login(name, password)
            .then(this.afterLogin)
            .catch(error => {
              this.logging = false
              this.error = error.response.data.message
            })
        }
      })
    },
    afterLogin(res) {
      this.logging = false
      const loginRes = res.data
      const { user } = loginRes
      this.setUser(user.user)
      setAuthorization({
        token: loginRes.token,
        expireAt: new Date(new Date().getTime() + 30 * 60 * 1000)
      })
      this.$router.push({ path: this.redirect || '/map' })
    },
    onClose() {
      this.error = false
    }
  }
}
</script>

<style lang="less">
.login-wrapper {
  &.common-layout {
    background-image: url('../../assets/img/login-bg.png');
    background-repeat: no-repeat;
    background-position-x: center;
    background-size: cover;
    .content {
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
    }
    .footer {
      .copyright {
        color: rgba(255, 255, 255, 0.45);
      }
      .links {
        a {
          color: rgba(255, 255, 255, 0.45);
        }
      }
    }
  }
}
</style>

<style lang="less" scoped>
.common-layout {
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
        color: #dbdfec;
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
</style>
