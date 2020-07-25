<template>
  <q-layout>
    <q-page-container>
      <q-page class="flex bg-image flex-center">
        <q-card
          style="opacity: 0.9"
          v-bind:style="$q.screen.lt.sm ? { width: '80%' } : { width: '30%' }"
        >
          <q-card-section>
            <div class="text-center q-pt-xs">
              <div class="col text-h5 ellipsis">
                MapGIS全空间一张图
              </div>
            </div>
          </q-card-section>
          <q-card-section>
            <q-form class="q-gutter-md">
              <q-input
                ref="username"
                filled
                v-model="loginForm.username"
                label="用户名"
                placeholder="admin"
                :rules="[validateUsername]"
                @keyup="keyUp"
              />
              <q-input
                ref="password"
                type="password"
                filled
                v-model="loginForm.password"
                label="密码"
                placeholder="onemap.sa"
                :rules="[validatePassword]"
                @keyup="keyUp"
              />
              <div class="row">
                <q-space />
                <q-btn
                  label="登录"
                  type="button"
                  color="primary"
                  @click="handleLogin"
                />
              </div>
            </q-form>
          </q-card-section>
        </q-card>
      </q-page>
    </q-page-container>
  </q-layout>
</template>

<script lang="ts">
import { Component, Mixins } from 'vue-property-decorator'
import LoginMixin from '../mixins/login'

@Component({})
export default class Login extends Mixins(LoginMixin) {
  private loginForm = {
    username: '',
    password: ''
  }

  mounted() {
    if (this.loginForm.username === '') {
      ;(this.$refs.username as HTMLInputElement).focus()
    } else if (this.loginForm.password === '') {
      ;(this.$refs.password as HTMLInputElement).focus()
    }
  }

  private validateUsername(value: string) {
    if (value.length === 0) {
      return '用户名不能为空'
    }
    return true
  }

  private validatePassword(value: string) {
    if (value.length < 6 && value !== 'sa') {
      return '密码不少于6位数'
    }
    if (value.length > 14) {
      return '密码不多于14位数'
    }
    return true
  }

  private async handleLogin() {
    if (this.validateUsername(this.loginForm.username) !== true) {
      ;(this.$refs.username as HTMLInputElement).focus()
      return
    }
    if (this.validatePassword(this.loginForm.password) !== true) {
      ;(this.$refs.password as HTMLInputElement).focus()
      return
    }

    const flag = await this.checkLogin(this.loginForm)
    if (flag) {
      this.$router.push('/')
    } else {
      this.$q.notify({
        position: 'center',
        message: '登录失败'
      })
    }
  }

  private keyUp(e: KeyboardEvent) {
    if (e.key === 'Enter') {
      this.handleLogin()
    }
  }
}
</script>

<style lang="scss">
.bg-image {
  background-image: url('../assets/images/login_bg.jpg');
  background-repeat: no-repeat;
  background-position: center center;
  -webkit-background-size: cover;
  -o-background-size: cover;
  background-size: cover;
}
</style>
