/**
 *第三方登录
 */
import { mapActions } from 'vuex'
import { thirdLoginUserCreate, thirdLoginCheckPassword } from '@/api/login'

const thirdLoginMixin = {
  data() {
    return {
      // 第三方登录相关信息
      thirdType: '',
      thirdLoginInfo: '',
      thirdPasswordShow: false,
      thirdLoginPassword: '',
      thirdLoginUsername: '',
      thirdLoginUserId: '',
      thirdConfirmShow: false,
      thirdCreateUserLoding: false,
      thirdLoginState: false
    }
  },
  created() {},
  methods: {
    ...mapActions(['thirdLogin']),
    onThirdLogin(source) {
      const loginUrl = `${window._CONFIG['domainURL']}${window._CONFIG['apiPathManagerPrefix']}/auth/thirdLogin/render/${source}`
      window.open(
        loginUrl,
        `login ${source}`,
        'height=500, width=500, top=0, left=0, toolbar=no, menubar=no, scrollbars=no, resizable=no,location=n o, status=no'
      )
      const that = this
      that.thirdType = source
      that.thirdLoginInfo = ''
      that.thirdLoginState = false
      const receiveMessage = function (event) {
        const token = event.data
        if (typeof token === 'string') {
          // 如果是字符串类型 说明是token信息
          if (token === 'Login Failed') {
            that.$message.warning(token)
          } else {
            that.doThirdLogin(token)
          }
        } else if (typeof token === 'object') {
          // 对象类型 说明需要提示是否绑定现有账号
          if (token['isObj'] === true) {
            that.thirdConfirmShow = true
            that.thirdLoginInfo = { ...token }
            that.thirdLoginUsername = that.thirdLoginInfo.loginName
            that.thirdLoginUserId = that.thirdLoginInfo.userId
          }
        } else {
          that.$message.warning(that.$t('user.login.unrecognized.information'))
        }

        window.removeEventListener('message', receiveMessage)
      }
      window.addEventListener('message', receiveMessage, false)
    },
    // 根据token执行登录
    doThirdLogin(token) {
      if (this.thirdLoginState === false) {
        this.thirdLoginState = true
        const param = {}
        param.source = this.thirdType
        param.token = token
        this.thirdLogin(param)
          .then(res => this.loginSuccess(res))
          .catch(err => this.requestFailed(err))
      }
    },
    // 绑定已有账号 需要输入密码
    thirdLoginUserBind() {
      this.thirdLoginPassword = ''
      this.thirdConfirmShow = false
      this.thirdPasswordShow = true
    },
    // 创建新账号
    thirdLoginUserCreate() {
      this.thirdCreateUserLoding = true
      // 账号名后面添加三位随机数
      this.thirdLoginInfo['suffix'] = parseInt(Math.random() * 900 + 100)
      thirdLoginUserCreate(this.thirdLoginInfo)
        .then(res => {
          const token = res.token
          this.doThirdLogin(token)
          this.thirdConfirmShow = false
        })
        .finally(() => {
          this.thirdCreateUserLoding = false
        })
    },
    thirdLoginNoConfirm() {
      this.thirdConfirmShow = false
    },
    // 核实密码
    thirdLoginCheckPassword() {
      const param = Object.assign({}, this.thirdLoginInfo, { password: this.thirdLoginPassword })
      thirdLoginCheckPassword(param)
        .then(res => {
          this.doThirdLogin(res.token)
        })
        .finally(() => {
          this.thirdLoginNoPassword()
        })
    },
    // 没有密码 取消操作
    thirdLoginNoPassword() {
      this.thirdPasswordShow = false
      this.thirdLoginPassword = ''
      this.thirdLoginUserName = ''
    },
    loginSuccess(res) {
      this.$router.push({ path: '/' })
    },
    requestFailed(err) {
      const description =
        ((err.response || {}).data || {}).message || err.message || this.$t('user.login.error.occurred.try')
      this.$notification['error']({
        message: this.$t('user.login.failed'),
        description: description,
        duration: 4
      })
    }
  }
}

export { thirdLoginMixin }
